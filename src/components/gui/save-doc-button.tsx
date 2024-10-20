import {
  SavedDocData,
  SavedDocInput,
  SavedDocNamespace,
} from "@/drivers/saved-doc/saved-doc-driver";
import { Button } from "../ui/button";
import { useDatabaseDriver } from "@/context/driver-provider";
import { useCallback, useState } from "react";
import { LucideFolderGit, LucideLoader, LucideSave } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface Props {
  docId?: string;
  onPrepareContent: () => SavedDocInput;
  onComplete: (item: SavedDocData) => void;
}

export default function SaveDocButton({
  docId,
  onComplete,
  onPrepareContent,
}: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { docDriver } = useDatabaseDriver();
  const [namespaceList, setNamespaceList] = useState<SavedDocNamespace[]>([]);

  const onSaveQuery = useCallback(
    (namespaceId?: string) => {
      if (docDriver) {
        if (docId) {
          setLoading(true);
          docDriver.updateDoc(docId, onPrepareContent()).finally(() => {
            setLoading(false);
          });
        } else {
          if (namespaceId) {
            setLoading(true);
            docDriver
              .createDoc("sql", namespaceId, onPrepareContent())
              .then(onComplete)
              .finally(() => {
                setLoading(false);
              });
          } else {
            docDriver.getNamespaces().then((n) => {
              if (n.length === 1) {
                setLoading(true);
                docDriver
                  .createDoc("sql", n[0].id, onPrepareContent())
                  .then(onComplete)
                  .finally(() => {
                    setLoading(false);
                  });
              } else {
                setNamespaceList(n);
                setOpen(true);
              }
            });
          }
        }
      }
    },
    [docDriver, onPrepareContent, docId, onComplete]
  );

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(openState) => {
        if (!openState) setOpen(false);
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          onClick={() => onSaveQuery()}
          disabled={loading}
          variant={"secondary"}
        >
          {loading ? (
            <LucideLoader className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <></>
          )}
          Save
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Where do you want to save to?</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {namespaceList.map((n) => {
          return (
            <DropdownMenuItem
              key={n.id}
              onClick={() => {
                onSaveQuery(n.id);
              }}
            >
              <LucideFolderGit className="w-4 h-4 mr-2" /> {n.name}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
