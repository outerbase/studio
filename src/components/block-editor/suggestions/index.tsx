import {
  BlockNoteEditor,
  filterSuggestionItems,
} from "@blocknote/core";
import {
  SuggestionMenuController,
  getDefaultReactSlashMenuItems,
} from "@blocknote/react";
import { insertCodeBlock } from "./insert-code-block";


// How we want to display the suggestions group
// lower number will be displayed first
const GROUP_ORDER = {
  Headings: 1,
  "Basic Blocks": 2,
  Media: 3,
  Advanced: 4,
} as Record<string, number>;

// Put all custom suggestions here
const CUSTOM_SUGGESTIONS = [insertCodeBlock];

// utility function to get all custom suggestions
function getCustomSlashMenuItems(editor: BlockNoteEditor<any>) {
  return CUSTOM_SUGGESTIONS.map((item) => item(editor));
}

export const SuggestionMenu = ({
  editor,
}: {
  editor: BlockNoteEditor<any>;
}) => {
  return (
    <SuggestionMenuController
      triggerCharacter={"/"}
      getItems={async (query) => {
        // get all default and custom suggestions
        const allItem = [
          ...getDefaultReactSlashMenuItems(editor),
          ...getCustomSlashMenuItems(editor),
        ];

        // sort the suggestions by group
        const sortedItems = allItem.toSorted((a, b) => {
          const aOrder = GROUP_ORDER[a.group || ""] || 5;
          const bOrder = GROUP_ORDER[b.group || ""] || 5;
          return aOrder - bOrder;
        });

        // filter the suggestions based on the query
        return filterSuggestionItems(sortedItems, query);
      }}
    />
  );
};
