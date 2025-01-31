import { ToolbarFiller } from "@/components/gui/toolbar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LucideLoader } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import DataCatalogDriver, { DataCatalogTermDefinition } from "./driver";

interface Props {
  driver?: DataCatalogDriver;
  open: boolean;
  onSuccess: () => void;
  onClose: (open: boolean) => void;
  selectedTermDefinition?: DataCatalogTermDefinition;
}

export function DataCatalogEntryModal({
  open,
  onClose,
  driver,
  onSuccess,
  selectedTermDefinition,
}: Props) {
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<DataCatalogTermDefinition>({
    id: "",
    name: "",
    otherName: "",
    definition: "",
  });

  const clear = useCallback(() => {
    setLoading(false);
    setDeleting(false);
    onClose(false);
    setFormData({
      id: "",
      name: "",
      otherName: "",
      definition: "",
    });
  }, [onClose]);

  useEffect(() => {
    if (selectedTermDefinition) {
      setFormData(selectedTermDefinition);
    } else {
      clear();
    }
  }, [selectedTermDefinition, clear]);

  const saveTermDefinition = useCallback(() => {
    setLoading(true);
    const data = {
      ...formData,
      id: selectedTermDefinition?.id || String(Date.now() * 1000), // Use existing ID if editing
    };

    driver
      ?.updateTermDefinition(data)
      .then(() => onSuccess())
      .finally(() => clear());
  }, [formData, driver, onSuccess, clear, selectedTermDefinition]);

  function onDelete() {
    if (!selectedTermDefinition) return;

    setDeleting(true);
    driver
      ?.deleteTermDefinition(selectedTermDefinition.id)
      .then(() => onSuccess())
      .finally(() => clear());
  }

  const onChangeValue = useCallback(
    (value: string, key: keyof DataCatalogTermDefinition) => {
      setFormData((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    []
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {selectedTermDefinition ? "Edit Term" : "Add Term"}
          </DialogTitle>
          <DialogDescription>
            {selectedTermDefinition
              ? "Modify the existing term definition."
              : "Add terms to your Data Dictionary to help your team and AI understand important business terminology."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="items-center gap-4">
            <Label className="text-right text-xs">
              Dictionary Term <span className="text-red-400">*</span>
            </Label>
            <Input
              value={formData.name}
              placeholder="Add a name"
              className="col-span-3"
              onChange={(e) => onChangeValue(e.currentTarget.value, "name")}
            />
          </div>
          <div className="items-center gap-4">
            <Label className="text-right text-xs">Other Names</Label>
            <Input
              value={formData.otherName}
              className="col-span-3"
              placeholder="Add other names"
              onChange={(e) =>
                onChangeValue(e.currentTarget.value, "otherName")
              }
            />
          </div>
          <div className="items-center gap-4">
            <Label className="text-right text-xs">
              Definition <span className="text-red-400">*</span>
            </Label>
            <Textarea
              rows={4}
              value={formData.definition}
              className="col-span-3"
              placeholder="Add a definition"
              onChange={(e) =>
                onChangeValue(e.currentTarget.value, "definition")
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            disabled={loading || !formData.name || !formData.definition}
            onClick={saveTermDefinition}
            type="submit"
          >
            {loading && <LucideLoader className="mr-1 h-4 w-4 animate-spin" />}
            {selectedTermDefinition ? "Save Change" : "Add Entry"}
          </Button>
          {selectedTermDefinition && (
            <Button
              disabled={deleting}
              onClick={onDelete}
              variant="destructive"
            >
              {deleting && (
                <LucideLoader className="mr-1 h-4 w-4 animate-spin" />
              )}
              Delete
            </Button>
          )}
          <ToolbarFiller />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
