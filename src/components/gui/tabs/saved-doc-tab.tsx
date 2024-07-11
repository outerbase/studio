import { openTab } from "@/messages/open-tab";
import { Separator } from "@/components/ui/separator";
import { useDatabaseDriver } from "@/context/driver-provider";
import {
  SavedDocData,
  SavedDocNamespace,
} from "@/drivers/saved-doc/saved-doc-driver";
import { ListView, ListViewItem } from "@/listview";
import { LucideALargeSmall } from "lucide-react";
import { useEffect, useState } from "react";

function mapNamespace(
  data: SavedDocNamespace
): ListViewItem<SavedDocNamespace> {
  return {
    data,
    key: data.id,
    icon: LucideALargeSmall,
    name: data.name,
  };
}

function mapDoc(data: SavedDocData): ListViewItem<SavedDocData> {
  return {
    data,
    key: data.id,
    icon: LucideALargeSmall,
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
      onSelectChange={setSelected}
      selectedKey={selected}
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

  return (
    <div className="grow">
      <div className="p-2">
        <ListView
          items={namespaceList}
          selectedKey={selectedNamespace}
          onSelectChange={setSelectedNamespace}
        />
      </div>
      <Separator />
      <div className="p-2">
        <SavedDocNamespaceDocList
          namespaceData={
            namespaceList.find((n) => n.key === selectedNamespace)?.data
          }
        />
      </div>
    </div>
  );
}
