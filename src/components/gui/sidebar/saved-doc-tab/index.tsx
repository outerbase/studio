import { openTab } from "@/messages/open-tab";
import { Separator } from "@/components/ui/separator";
import { useDatabaseDriver } from "@/context/driver-provider";
import {
  SavedDocData,
  SavedDocNamespace,
} from "@/drivers/saved-doc/saved-doc-driver";
import { ListView, ListViewItem } from "@/listview";
import { LucideCode, LucideFolderGit, LucideTrash } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import CreateNamespaceButton from "./create-namespace-button";

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

  return (
    <ListView
      items={docList}
      full
      onSelectChange={setSelected}
      selectedKey={selected}
      onContextMenu={(item) => {
        return [
          {
            title: "Remove",
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
  );
}

export default function SavedDocTab() {
  const { docDriver } = useDatabaseDriver();
  const [selectedNamespace, setSelectedNamespace] = useState<string>();
  const [namespaceList, setNamespaceList] = useState<
    ListViewItem<SavedDocNamespace>[]
  >([]);

  useEffect(() => {
    if (docDriver) {
      docDriver.getNamespaces().then((r) => {
        setNamespaceList(r.map(mapNamespace));
        const firstNamespaceId = r[0].id;
        setSelectedNamespace(firstNamespaceId);
        docDriver.setCurrentNamespace(firstNamespaceId);
      });
    }
  }, [docDriver]);

  const onNamespaceCreated = useCallback(
    (createdNamespace: SavedDocNamespace) => {
      if (docDriver) {
        docDriver.getNamespaces().then((r) => {
          setNamespaceList(r.map(mapNamespace));
          setSelectedNamespace(createdNamespace.id);
          docDriver.setCurrentNamespace(createdNamespace.id);
        });
      }
    },
    [docDriver]
  );

  return (
    <div className="flex flex-col grow">
      <div>
        <ListView
          items={namespaceList}
          selectedKey={selectedNamespace}
          onSelectChange={setSelectedNamespace}
          onContextMenu={(item) => {
            return [
              { title: "Rename" },
              {
                title: "Remove",
                icon: LucideTrash,
                destructive: true,
                disabled: !item,
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
  );
}
