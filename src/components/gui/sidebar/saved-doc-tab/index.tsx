import { closeTabs, openTab } from "@/messages/open-tab";
import { Separator } from "@/components/ui/separator";
import { useDatabaseDriver } from "@/context/driver-provider";
import {
  SavedDocData,
  SavedDocNamespace,
} from "@/drivers/saved-doc/saved-doc-driver";
import { ListView, ListViewItem } from "@/components/listview";
import { LucideCode, LucideFolderGit, LucideTrash } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import CreateNamespaceButton from "./create-namespace-button";
import RenameNamespaceDialog from "./rename-namespace-dialog";
import RemoveDocDialog from "./remove-doc-dialog";
import { TAB_PREFIX_SAVED_QUERY } from "@/const";
import RemoveNamespaceDialog from "./remove-namespace-dialog";

function mapNamespace(
  data: SavedDocNamespace
): ListViewItem<SavedDocNamespace> {
  return {
    data,
    key: data.id,
    icon: LucideFolderGit,
    name: data.name,
  };
}

function mapDoc(data: SavedDocData): ListViewItem<SavedDocData> {
  return {
    data,
    key: data.id,
    icon: LucideCode,
    iconColor: "text-orange-500",
    name: data.name,
  };
}

function SavedDocNamespaceDocList({
  namespaceData,
}: {
  namespaceData?: SavedDocNamespace;
}) {
  const { docDriver } = useDatabaseDriver();
  const [selected, setSelected] = useState<string>();
  const [docList, setDocList] = useState<ListViewItem<SavedDocData>[]>([]);
  const [docToRemove, setDocToRemove] = useState<SavedDocData | undefined>();

  useEffect(() => {
    const namespaceId = namespaceData?.id;

    if (docDriver && namespaceId) {
      docDriver.getDocs(namespaceId).then((r) => {
        setDocList(r.map(mapDoc));
      });

      const onDocChange = () => {
        docDriver?.getDocs(namespaceId).then((r) => {
          setDocList(r.map(mapDoc));
        });
      };

      docDriver.addChangeListener(onDocChange);
      return () => docDriver.removeChangeListener(onDocChange);
    }
  }, [docDriver, namespaceData]);

  let dialog: JSX.Element | null = null;

  if (docToRemove) {
    dialog = (
      <RemoveDocDialog
        doc={docToRemove}
        onClose={() => {
          setDocToRemove(undefined);
        }}
        onComplete={() => {
          const namespaceId = namespaceData?.id;
          if (docDriver && namespaceId) {
            docDriver.getDocs(namespaceId).then((r) => {
              setDocList(r.map(mapDoc));
            });
            closeTabs([TAB_PREFIX_SAVED_QUERY + docToRemove.id]);
          }
        }}
      />
    );
  }

  return (
    <>
      {dialog}
      <ListView
        items={docList}
        full
        onSelectChange={setSelected}
        selectedKey={selected}
        onContextMenu={(item) => {
          return [
            {
              title: "Remove",
              onClick: () => {
                if (item) {
                  setDocToRemove(item.data);
                }
              },
              icon: LucideTrash,
              destructive: true,
              disabled: !item,
            },
          ];
        }}
        onDoubleClick={(item: ListViewItem<SavedDocData>) => {
          openTab({
            type: "query",
            name: item.name,
            saved: {
              key: item.key,
              sql: item.data.content,
              namespaceName: namespaceData?.name,
            },
          });
        }}
      />
    </>
  );
}

export default function SavedDocTab() {
  const { docDriver } = useDatabaseDriver();
  const [selectedNamespace, setSelectedNamespace] = useState<string>();

  const [namespaceToRename, setNamespaceToRename] =
    useState<SavedDocNamespace>();
  const [namespaceToRemove, setNamespaceToRemove] =
    useState<SavedDocNamespace>();

  const [namespaceList, setNamespaceList] = useState<
    ListViewItem<SavedDocNamespace>[]
  >([]);

  useEffect(() => {
    if (docDriver) {
      docDriver.getNamespaces().then((r) => {
        setNamespaceList(r.map(mapNamespace));
        const firstNamespaceId = r[0].id;
        setSelectedNamespace(firstNamespaceId);
      });
    }
  }, [docDriver]);

  const onNamespaceCreated = useCallback(
    (createdNamespace: SavedDocNamespace) => {
      if (docDriver) {
        docDriver.getNamespaces().then((r) => {
          setNamespaceList(r.map(mapNamespace));
          setSelectedNamespace(createdNamespace.id);
        });
      }
    },
    [docDriver]
  );

  let dialog: JSX.Element | null = null;

  if (namespaceToRename) {
    dialog = (
      <RenameNamespaceDialog
        onClose={() => setNamespaceToRename(undefined)}
        onComplete={() => {
          if (docDriver) {
            docDriver.getNamespaces().then((r) => {
              setNamespaceList(r.map(mapNamespace));
            });
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
            closeTabs(docs.map((d) => TAB_PREFIX_SAVED_QUERY + d.id));

            // Refresh new namespace list
            docDriver
              .getNamespaces()
              .then((r) => {
                setNamespaceList(r.map(mapNamespace));

                if (selectedNamespace === namespaceToRemove.id) {
                  setSelectedNamespace(r[0].id);
                }
              })
              .catch(console.error);
          }
        }}
        value={namespaceToRemove}
      />
    );
  }

  return (
    <>
      {dialog}
      <div className="flex flex-col grow">
        <div>
          <ListView
            items={namespaceList}
            selectedKey={selectedNamespace}
            onSelectChange={setSelectedNamespace}
            onContextMenu={(item) => {
              return [
                {
                  title: "Rename",
                  disabled: !item,
                  onClick: () => {
                    if (item) setNamespaceToRename(item.data);
                  },
                },
                {
                  title: "Remove",
                  icon: LucideTrash,
                  destructive: true,
                  disabled: !item,
                  onClick: () => {
                    console.log("here");
                    if (item) setNamespaceToRemove(item.data);
                  },
                },
              ];
            }}
          />
          <CreateNamespaceButton onCreated={onNamespaceCreated} />
        </div>
        <Separator />
        <div className="grow overflow-hidden flex">
          <SavedDocNamespaceDocList
            namespaceData={
              namespaceList.find((n) => n.key === selectedNamespace)?.data
            }
          />
        </div>
      </div>
    </>
  );
}
