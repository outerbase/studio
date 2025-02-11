import {
  Compartment,
  EditorState,
  StateEffect,
  StateField,
} from "@codemirror/state";
import {
  Decoration,
  EditorView,
  keymap,
  ViewPlugin,
  WidgetType,
} from "@codemirror/view";
import { createRoot } from "react-dom/client";
import { resolveToNearestStatement } from "../gui/sql-editor/statement-highlight";
import { CodeMirrorPromptWidget } from "./prompt-widget";

// Effect to add/remove prompt widget
const effectHidePrompt = StateEffect.define();
const effectShowPrompt = StateEffect.define<{
  lineNumber: number;
  from: number;
  to: number;
}>();

// React-based Widget for Inline Prompt
class PromptWidget extends WidgetType {
  protected container: HTMLDivElement;

  constructor(
    public plugin: CodeMirrorPromptPlugin,
    public from: number,
    public to: number
  ) {
    super();

    plugin.lock();

    this.container = document.createElement("div");

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

    createRoot(this.container).render(<CodeMirrorPromptWidget />);
  }

  toDOM() {
    console.log("dom dom dom");
    return this.container;
  }

  destroy() {
    // Clean up when the widget is destroyed
    this.plugin.unlock();
    console.log("destroy");
  }

  ignoreEvent() {
    return false; // Allow interactions inside the widget
  }
}

export class CodeMirrorPromptPlugin {
  protected isOpen = false;

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

  public closePrompt() {
    this.view?.dispatch({
      effects: [effectHidePrompt.of(null)],
    });
  }

  protected openPrompt(v: EditorView) {
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
          // effectSelectedPromptLine.of(
          //   Array.from(
          //     { length: endLine.number - startLine.number + 1 },
          //     (_, i) => startLine.number + i
          //   )
          // ),
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
}
