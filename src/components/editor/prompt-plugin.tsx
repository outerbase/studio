import AgentDriverList from "@/drivers/agent/list";
import { generateId } from "@/lib/generate-id";
import { unifiedMergeView } from "@codemirror/merge";
import {
  Compartment,
  EditorState,
  StateEffect,
  StateField,
  Transaction,
} from "@codemirror/state";
import {
  Decoration,
  EditorView,
  keymap,
  showTooltip,
  Tooltip,
  ViewPlugin,
  WidgetType,
} from "@codemirror/view";
import { createRoot } from "react-dom/client";
import { resolveToNearestStatement } from "../gui/sql-editor/statement-highlight";
import "./prompt-plugin.css";
import { CodeMirrorPromptWidget } from "./prompt-widget";

// Effect to add/remove prompt widget
const effectHidePrompt = StateEffect.define();
const effectShowPrompt = StateEffect.define<{
  lineNumber: number;
  from: number;
  to: number;
}>();

// This effect is used to add selected code
// that will be for prompt suggestion
const effectSelectedPromptLine = StateEffect.define<number[]>();

export interface PromptSelectedFragment {
  text: string;
  fullText: string;
  startLineNumber: number;
  endLineNumber: number;
  sessionId: string;
  selectedModel?: string;
}

export type PromptCallback = (
  promptQuery: string,
  selected: PromptSelectedFragment
) => Promise<string>;

class PlaceholderWidget extends WidgetType {
  toDOM(): HTMLElement {
    const wrap = document.createElement("span");
    wrap.className = "cm-placeholder";
    wrap.style.padding = "";
    wrap.append(document.createTextNode("⌘ + B to get AI assistant"));
    return wrap;
  }

  ignoreEvent(): boolean {
    return false;
  }
}

// React-based Widget for Inline Prompt
class PromptWidget extends WidgetType {
  protected container: HTMLDivElement;

  constructor(
    public plugin: CodeMirrorPromptPlugin,
    public from: number,
    public to: number
  ) {
    super();

    // Generate unique session id for this prompt
    const sessionId = generateId();

    plugin.lock();
    this.container = document.createElement("div");

    plugin.isActive = true;
    plugin.activeWidget = this;

    const view = plugin.getEditorView();
    if (!view) return;

    // First we need to lock the editor to read-only.
    // This will simplify the logic of the plugin of not having to
    // worry about keeping up with the editor state while the prompt
    const getSelectionLines = () => {
      const startLineNumber = view.state.doc.lineAt(from).number;
      const endLineNumber = view.state.doc.lineAt(to).number;

      return Array.from(
        { length: endLineNumber - startLineNumber + 1 },
        (_, i) => startLineNumber + i
      );
    };

    const selectedLines = getSelectionLines();

    // Calculate cursor and selection positions
    const startPosition = from;
    const startLineNumber = view.state.doc.lineAt(startPosition).number;
    const endPosition = selectedLines
      ? view.state.doc.line(selectedLines[selectedLines.length - 1]).to
      : view.state.doc.lineAt(startPosition).to;

    // Reverse the suggestion that we have made
    const selectedOriginalText = view.state.sliceDoc(
      startPosition,
      endPosition
    );

    const originalText = view.state.doc.toString();
    let suggestedText = selectedOriginalText;

    const reverseSuggestion = () => {
      if (suggestedText !== selectedOriginalText) {
        this.plugin.hideSuggestionDiff();

        view.dispatch({
          changes: {
            from: startPosition,
            to: startPosition + suggestedText.length,
            insert: selectedOriginalText,
          },
          annotations: [Transaction.addToHistory.of(false)],
        });
      }
    };

    this.container.style.padding = "10px";

    this.container.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    this.container.addEventListener("mousedown", (e) => {
      e.stopPropagation();
    });

    this.container.addEventListener("keydown", (e) => {
      e.stopPropagation();
    });

    // The query counter helps in canceling queries.
    // When a query is canceled, the counter is incremented.
    // If the result of a query arrives and the counter has changed, the result is ignored.
    let queryCounter = 1;

    const onGenerate = async (promptText: string, selectedModel?: string) => {
      try {
        const expectedQueryCounter = queryCounter;

        const queryText = await this.plugin.getSuggestion(promptText, {
          text: suggestedText ?? selectedOriginalText,
          fullText: view.state.doc.toString(),
          startLineNumber,
          sessionId,
          endLineNumber: view.state.doc.lineAt(
            startPosition + suggestedText.length
          ).number,
          selectedModel,
        });

        // This prevent when we close the widget before
        // the suggestion return result which cause
        // us to suggestion code to the editor
        if (!this.plugin.isActive) return;

        // If the query counter is not matched, it must be canceled
        if (expectedQueryCounter !== queryCounter) return;

        // We need to reverse the change before apply new suggestion
        reverseSuggestion();

        this.plugin.showDiff(originalText);

        // Replace selection with suggested result from prompt
        view.dispatch({
          changes: {
            from: startPosition,
            to: endPosition,
            insert: queryText,
          },
          annotations: [Transaction.addToHistory.of(false)],
        });

        suggestedText = queryText;

        // Highlight the suggested code along with the previous selected code
        view.dispatch({
          effects: [
            effectSelectedPromptLine.of(
              Array.from(
                {
                  length:
                    view.state.doc.lineAt(startPosition + suggestedText.length)
                      .number - startLineNumber,
                },
                (_, i) => startLineNumber + i
              )
            ),
          ],
        });
      } finally {
        queryCounter++;
      }
    };

    const onClosePrompt = () => {
      plugin.closePrompt();
      plugin.setEditorFocus();
      reverseSuggestion();
    };

    const onReject = () => {
      reverseSuggestion(); // Restore the original text

      view.dispatch({
        effects: [
          effectSelectedPromptLine.of(selectedLines), // Reverse the selected line highlight
        ],
      });

      suggestedText = selectedOriginalText;
    };

    const onCancel = () => {
      queryCounter++;
    };

    const onAccept = () => {
      plugin.closePrompt();
      plugin.setEditorFocus();
    };

    createRoot(this.container).render(
      <CodeMirrorPromptWidget
        onClose={onClosePrompt}
        onAccept={onAccept}
        onSubmit={onGenerate}
        onReject={onReject}
        onCancel={onCancel}
        agentDriver={plugin.agents}
      />
    );
  }

  toDOM() {
    return this.container;
  }

  destroy() {
    // Clean up when the widget is destroyed
    this.plugin.unlock();

    this.plugin.activeWidget = undefined;
    this.plugin.isActive = false;
  }

  ignoreEvent() {
    return false; // Allow interactions inside the widget
  }
}

const decorationSelectedLine = Decoration.line({
  class: "prompt-line-selected",
});

const promptSelectedLines = StateField.define({
  create() {
    return Decoration.none;
  },

  update(v, tr) {
    for (const e of tr.effects) {
      if (e.is(effectSelectedPromptLine)) {
        return Decoration.set(
          e.value.map((line) =>
            decorationSelectedLine.range(tr.state.doc.line(line).from)
          )
        );
      } else if (e.is(effectHidePrompt)) {
        return Decoration.none;
      }
    }

    return v;
  },
  provide: (f) => EditorView.decorations.from(f),
});

function getCursorTooltips(
  state: EditorState,
  plugin: CodeMirrorPromptPlugin
): readonly Tooltip[] {
  return state.selection.ranges
    .filter((range) => !range.empty)
    .map((range) => {
      return {
        pos: range.head,
        above: range.head < range.anchor,
        strictSide: true,
        arrow: false,
        create: () => {
          const dom = document.createElement("div");
          dom.className = "rounded overflow-hidden border border-zinc-500";

          const editButton = document.createElement("button");
          editButton.className =
            "bg-muted text-secondary-foreground text-sm p-1 px-2 cursor-pointer";
          editButton.innerHTML = "Edit <span>⌘B</span>";

          editButton.onclick = () => {
            plugin.openPrompt(plugin.getEditorView()!);
          };

          dom.appendChild(editButton);

          return { dom };
        },
      };
    });
}

export class CodeMirrorPromptPlugin {
  public isActive = false;
  activeWidget?: PromptWidget;
  promptCallback?: PromptCallback;
  public agents?: AgentDriverList;

  /**
   * This is for locking when prompt is open. This is to prevent
   * a lot of complication dealing with updated selected text and
   * cursor position.
   */
  protected lockCompartment = new Compartment();

  /**
   * This is for showing the diff mode when we got response from
   * AI agent.
   */
  protected diffCompartment = new Compartment();

  protected view?: EditorView;

  public lock() {
    requestAnimationFrame(() => {
      if (this.view) {
        this.view.dispatch({
          effects: this.lockCompartment.reconfigure([
            EditorState.readOnly.of(true),
          ]),
        });
      }
    });
  }

  public unlock() {
    requestAnimationFrame(() => {
      if (this.view) {
        this.view.dispatch({
          effects: this.lockCompartment.reconfigure([]),
        });
      }
    });
  }

  public setEditorFocus() {
    this.view?.focus();
  }

  public closePrompt() {
    this.view?.dispatch({
      effects: [
        effectHidePrompt.of(null),
        this.diffCompartment.reconfigure([]),
      ],
    });
  }

  public getEditorView() {
    return this.view;
  }

  public showDiff(originalText: string) {
    if (this.view) {
      this.view.dispatch({
        effects: this.diffCompartment.reconfigure([
          unifiedMergeView({
            original: originalText,
            mergeControls: false,
            syntaxHighlightDeletions: false,
          }),
        ]),
      });
    }
  }

  public hideSuggestionDiff() {
    if (this.view) {
      this.view.dispatch({
        effects: this.diffCompartment.reconfigure([]),
      });
    }
  }

  public openPrompt(v: EditorView) {
    const currentCursor = v.state.selection.main.from;
    const currentCursorLine = v.state.doc.lineAt(currentCursor);
    const nearestA = resolveToNearestStatement(
      v.state,
      v.state.selection.main.from
    );
    const nearestB = resolveToNearestStatement(
      v.state,
      v.state.selection.main.to
    );

    const startLine = v.state.doc.lineAt(nearestA?.from ?? 0);
    const endLine = v.state.doc.lineAt(nearestB?.to ?? v.state.doc.length);

    setTimeout(() => {
      if (v.state.selection.main.from === v.state.selection.main.to) {
        // We need to find a way to know if user want to generate new query
        // or user want to improve the existing query.

        // We determine if user want to generate new query if it is in empty line
        // and it is not in the middle of statement
        if (currentCursor < startLine.from || currentCursor > endLine.to) {
          v.dispatch({
            effects: [
              effectShowPrompt.of({
                lineNumber: currentCursorLine.number,
                from: currentCursorLine.from,
                to: currentCursorLine.to,
              }),
            ],
            selection: { anchor: currentCursor, head: currentCursor },
          });
          return true;
        }
      }

      v.dispatch({
        effects: [
          effectShowPrompt.of({
            lineNumber: startLine.number,
            from: startLine.from,
            to: endLine.to,
          }),
          effectSelectedPromptLine.of(
            Array.from(
              { length: endLine.number - startLine.number + 1 },
              (_, i) => startLine.number + i
            )
          ),
        ],
        selection: { anchor: startLine.from, head: startLine.from },
      });
    }, 50);
  }

  /**
   * This is cheap trick to get the view instance from the plugin.
   * If there is a better way to do this, please let me know.
   */
  protected getViewInstance(self: CodeMirrorPromptPlugin) {
    return ViewPlugin.fromClass(
      class {
        constructor(view: EditorView) {
          self.view = view;
        }
      }
    );
  }

  protected getStateFieldPrompt(self: CodeMirrorPromptPlugin) {
    return StateField.define({
      create: () => {
        return Decoration.none;
      },

      update(v, tr) {
        for (const e of tr.effects) {
          if (e.is(effectShowPrompt)) {
            return Decoration.set([
              Decoration.widget({
                widget: new PromptWidget(self, e.value.from, e.value.to),
                side: -10,
                block: true,
              }).range(e.value.from),
            ]);
          } else if (e.is(effectHidePrompt)) {
            return Decoration.none;
          }
        }

        if (tr.docChanged) {
          return v.map(tr.changes);
        }

        return v;
      },

      provide: (f) => EditorView.decorations.from(f),
    });
  }

  getExtensions() {
    return [
      this.lockCompartment.of([]),
      this.diffCompartment.of([]),
      this.getStateFieldPrompt(this),
      this.getViewInstance(this),
      StateField.define<readonly Tooltip[]>({
        create: (state) => getCursorTooltips(state, this),

        update: (tooltips, tr) => {
          if (!tr.docChanged && !tr.selection) return tooltips;
          return getCursorTooltips(tr.state, this);
        },

        provide: (f) => showTooltip.computeN([f], (state) => state.field(f)),
      }),
      StateField.define({
        create() {
          return Decoration.none;
        },
        update: (v, tr) => {
          const cursorPosition = tr.state.selection.main.from;
          const line = tr.state.doc.lineAt(cursorPosition);
          const lineText = line.text;

          if (
            lineText === "" &&
            !this.isActive &&
            tr.state.selection &&
            tr.selection?.main.from === tr.selection?.main.to
          ) {
            return Decoration.set([
              Decoration.widget({
                widget: new PlaceholderWidget(),
                side: 10,
              }).range(line.from),
            ]);
          }

          return Decoration.none;
        },
        provide: (f) => EditorView.decorations.from(f),
      }),
      promptSelectedLines,
      keymap.of([
        {
          key: "Ctrl-b",
          mac: "Cmd-b",
          run: (v) => {
            this.openPrompt(v);
            return true;
          },
        },
      ]),
    ];
  }

  async getSuggestion(promptQuery: string, selected: PromptSelectedFragment) {
    if (this.promptCallback) {
      return this.promptCallback(promptQuery, selected);
    }

    throw new Error("There is no suggestion function");
  }

  handleSuggestion(callback: PromptCallback) {
    this.promptCallback = callback;
  }
}
