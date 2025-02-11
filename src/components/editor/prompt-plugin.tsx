import { StateEffect, StateField } from "@codemirror/state";
import {
  Decoration,
  DecorationSet,
  EditorView,
  keymap,
  ViewPlugin,
  ViewUpdate,
  WidgetType,
} from "@codemirror/view";
import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

// Effect to add/remove prompt widget
const togglePromptEffect = StateEffect.define<{ pos: number | null }>();

// StateField to track prompt widget position
const promptField = StateField.define<{ pos: number | null }>({
  create: () => ({ pos: null }),
  update(value, tr) {
    for (let e of tr.effects) {
      if (e.is(togglePromptEffect)) {
        return { pos: e.value.pos }; // Update position
      }
    }
    return value;
  },
});

// React-based Widget for Inline Prompt
class PromptWidget extends WidgetType {
  constructor(
    public pos: number,
    public view: EditorView
  ) {
    super();
  }

  toDOM() {
    const container = document.createElement("span");
    createRoot(container).render(
      <InlinePrompt pos={this.pos} view={this.view} />
    );

    return container;
  }

  ignoreEvent() {
    return false; // Allow interactions inside the widget
  }
}

// React Component for the Inline Textbox
const InlinePrompt = ({ pos, view }: { pos: number; view: EditorView }) => {
  const [input, setInput] = useState("");

  useEffect(() => {
    // Focus the input when it appears
    const inputElement = document.getElementById("copilot-input");
    inputElement?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      console.log("User submitted prompt:", input);
      view.dispatch({ effects: togglePromptEffect.of({ pos: null }) }); // Remove the widget
    } else if (e.key === "Escape") {
      e.preventDefault();
      view.dispatch({ effects: togglePromptEffect.of({ pos: null }) }); // Cancel prompt
    }
  };

  return (
    <input
      id="copilot-input"
      type="text"
      value={input}
      onChange={(e) => setInput(e.target.value)}
      onKeyDown={handleKeyDown}
      style={{
        border: "1px solid gray",
        padding: "2px",
        borderRadius: "3px",
        fontSize: "14px",
        width: "150px",
      }}
    />
  );
};

// ViewPlugin to render the widget
const promptPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = this.getDecorations(view);
    }

    update(update: ViewUpdate) {
      if (
        update.docChanged ||
        update.transactions.some((tr) =>
          tr.effects.some((e) => e.is(togglePromptEffect))
        )
      ) {
        this.decorations = this.getDecorations(update.view);
      }
    }

    getDecorations(view: EditorView): DecorationSet {
      const { pos } = view.state.field(promptField);
      if (pos === null) return Decoration.none;

      const widgetDeco = Decoration.widget({
        widget: new PromptWidget(pos, view),
        side: 1, // Ensure it appears at the correct position
      });

      return Decoration.set([widgetDeco.range(pos)]);
    }
  },
  { decorations: (v) => v.decorations }
);

// Function to show/hide prompt
const togglePrompt = (view: EditorView) => {
  const state = view.state;
  const cursorPos = state.selection.main.head;
  view.dispatch({ effects: togglePromptEffect.of({ pos: cursorPos }) });
};

export const PromptPlugin = [
  promptField,
  promptPlugin,
  keymap.of([
    {
      key: "Ctrl-i",
      run: (v) => {
        togglePrompt(v);
        return true;
      },
    },
  ]),
];
