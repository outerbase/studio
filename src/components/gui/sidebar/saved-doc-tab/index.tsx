import { ListView, ListViewItem } from "@/components/listview";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TAB_PREFIX_SAVED_QUERY } from "@/const";
import { useStudioContext } from "@/context/driver-provider";
import { OpenContextMenuList } from "@/core/channel-builtin";
import { scc } from "@/core/command";
import {
  SavedDocData,
  SavedDocGroupByNamespace,
  SavedDocNamespace,
} from "@/drivers/saved-doc/saved-doc-driver";
import { cn } from "@/lib/utils";
import { Binoculars, Folder, Plus } from "@phosphor-icons/react";
import { LucideTrash } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import CreateNamespaceDialog from "./create-namespace-button";
import RemoveDocDialog from "./remove-doc-dialog";
import RemoveNamespaceDialog from "./remove-namespace-dialog";
import RenameNamespaceDialog from "./rename-namespace-dialog";

type SavedDocListData =
  | {
      type: "namespace";
      data: SavedDocNamespace;
    }
  | {
      type: "doc";
      data: SavedDocData;
    };

function mapDoc(
  data: SavedDocGroupByNamespace[]
): ListViewItem<SavedDocListData>[] {
  return data.map((ns) => {
    return {
      data: { type: "namespace", data: ns.namespace },
      key: ns.namespace.id,
      icon: Folder,
      name: ns.namespace.name,
      children: ns.docs.map((d) => {
        return {
          key: d.id,
          data: { type: "doc", data: d },
          icon: Binoculars,
          name: d.name,
        };
      }) as ListViewItem<SavedDocListData>[],
    };
  });
}

export default function SavedDocTab() {
  const { docDriver } = useStudioContext();
  const [selected, setSelected] = useState<string>();
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const [namespaceCreating, setNamespaceCreating] = useState(false);
  const [namespaceToRename, setNamespaceToRename] =
    useState<SavedDocNamespace>();
  const [namespaceToRemove, setNamespaceToRemove] =
    useState<SavedDocNamespace>();
  const [docToRemove, setDocToRemove] = useState<SavedDocData | undefined>();

  const [docList, setDocList] = useState<ListViewItem<SavedDocListData>[]>([]);

  const refresh = useCallback(() => {
    if (docDriver) {
      docDriver
        .getDocs()
        .then((r) => setDocList(mapDoc(r)))
        .catch(console.error);
    }
  }, [docDriver]);

  useEffect(() => {
    refresh();

    if (docDriver) {
      const onDocChange = () => {
        refresh();
      };

      docDriver.addChangeListener(onDocChange);
      return () => docDriver.removeChangeListener(onDocChange);
    }
  }, [refresh, docDriver]);

  let dialog: JSX.Element | null = null;

  if (docToRemove) {
    dialog = (
      <RemoveDocDialog
        doc={docToRemove}
        onClose={() => {
          setDocToRemove(undefined);
        }}
        onComplete={() => {
          if (docDriver) {
            refresh();
            scc.tabs.close([TAB_PREFIX_SAVED_QUERY + docToRemove.id]);
          }
        }}
      />
    );
  }

  if (namespaceToRename) {
    dialog = (
      <RenameNamespaceDialog
        onClose={() => setNamespaceToRename(undefined)}
        onComplete={() => {
          if (docDriver) {
            docDriver
              .getDocs()
              .then((r) => setDocList(mapDoc(r)))
              .catch(console.error);
          }
        }}
        value={namespaceToRename}
      />
    );
  }

  if (namespaceToRemove) {
    dialog = (
      <RemoveNamespaceDialog
        onClose={() => setNamespaceToRemove(undefined)}
        onComplete={(docs) => {
          if (docDriver) {
            scc.tabs.close(docs.map((d) => TAB_PREFIX_SAVED_QUERY + d.id));
            refresh();
          }
        }}
        value={namespaceToRemove}
      />
    );
  }

  if (namespaceCreating) {
    dialog = (
      <CreateNamespaceDialog
        onCreated={refresh}
        onClose={() => setNamespaceCreating(false)}
      />
    );
  }

  return (
    <>
      {dialog}

      <div className="flex grow flex-col">
        <div className="mx-2 mb-5 flex items-center justify-between px-2 pt-4">
          <h1 className="text-primary text-xl font-medium">Queries</h1>

          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  buttonVariants({
                    size: "icon",
                  }),
                  "h-8 w-8 rounded-full bg-neutral-800 dark:bg-neutral-200"
                )}
              >
                <Plus size={16} weight="bold" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setNamespaceCreating(true)}>
                New Folder
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  scc.tabs.openBuiltinQuery({});
                }}
              >
                New Query
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <ListView
          full
          items={docList}
          selectedKey={selected}
          onSelectChange={setSelected}
          collapsedKeys={collapsed}
          onCollapsedChange={setCollapsed}
          onDoubleClick={(item: ListViewItem<SavedDocListData>) => {
            if (item.data.type === "doc") {
              scc.tabs.openBuiltinQuery({
                name: item.name,
                saved: {
                  key: item.key,
                  sql: item.data.data.content,
                  namespaceName: item.data.data.namespace.name,
                },
              });
            }
          }}
          onContextMenu={(item) => {
            let menu: OpenContextMenuList = [];

            if (item?.data.type === "namespace") {
              menu = [
                ...menu,
                {
                  title: "Rename",
                  disabled: !item,
                  onClick: () => {
                    if (item) setNamespaceToRename(item.data.data);
                  },
                },
                {
                  title: "Remove",
                  icon: LucideTrash,
                  destructive: true,
                  disabled: !item,
                  onClick: () => {
                    if (item) setNamespaceToRemove(item.data.data);
                  },
                },
              ];
            } else if (item?.data.type === "doc") {
              menu = [
                ...menu,
                {
                  title: "Remove",
                  onClick: () => {
                    if (item) {
                      setDocToRemove(item.data.data as SavedDocData);
                    }
                  },
                  icon: LucideTrash,
                  destructive: true,
                  disabled: !item,
                },
              ];
            }

            return menu;
          }}
        />
      </div>
    </>
  );
}
