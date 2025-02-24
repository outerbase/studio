import { ToolbarFiller } from "@/components/gui/toolbar";
import { Button } from "@/components/orbit/button";
import { Input } from "@/components/orbit/input";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCallback, useState } from "react";
import DataCatalogDriver, { DataCatalogTermDefinition } from "./driver";

interface Props {
  driver?: DataCatalogDriver;
  onClose: () => void;
  definition?: DataCatalogTermDefinition;
}

interface TermDefinitionInut extends Omit<DataCatalogTermDefinition, "id"> {
  id?: string;
}

export function DataCatalogEntryModal({ onClose, driver, definition }: Props) {
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<TermDefinitionInut>(
    () => definition
  );

  const saveTermDefinition = useCallback(() => {
    setLoading(true);

    if (formData.id) {
      driver
        ?.updateTermDefinition({ ...formData, id: formData.id })
        .then()
        .finally(() => onClose());
    } else {
      driver
        ?.addTermDefinition({
          name: formData.name,
          definition: formData.definition,
          otherNames: formData.otherNames,
        })
        .then()
        .finally(() => onClose());
    }
  }, [formData, driver, onClose]);

  function onDelete() {
    if (!definition) return;

    setDeleting(true);

    driver
      ?.deleteTermDefinition(definition.id!)
      .then()
      .finally(() => onClose());
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
    <>
      <DialogHeader>
        <DialogTitle>{definition ? "Edit Term" : "Add Term"}</DialogTitle>
      </DialogHeader>
      <DialogDescription className="text-base">
        {definition
          ? "Modify the existing term definition."
          : "Add terms to your Data Dictionary to help your team and AI understand important business terminology."}
      </DialogDescription>
      <div className="grid gap-4 py-4">
        <div className="gap-4">
          <div>
            <Label className="text-right text-sm">
              Dictionary Term <span className="text-red-400">*</span>
            </Label>
          </div>
          <Input
            value={formData?.name || ""}
            placeholder="Add a name"
            className="w-full"
            onValueChange={(value) => onChangeValue(value, "name")}
          />
        </div>
        <div className="gap-4">
          <div>
            <Label className="text-right text-sm">Other Names</Label>
          </div>
          <Input
            value={formData?.otherNames || ""}
            placeholder="Add other names"
            className="w-full"
            onChange={(e) => onChangeValue(e.currentTarget.value, "otherNames")}
          />
        </div>
        <div className="gap-4">
          <Label className="text-right text-sm">
            Definition <span className="text-red-400">*</span>
          </Label>
          <Textarea
            rows={4}
            value={formData?.definition || ""}
            className="text-base"
            placeholder="Add a definition"
            onChange={(e) => onChangeValue(e.currentTarget.value, "definition")}
          />
        </div>
      </div>
      <DialogFooter>
        <Button
          loading={loading}
          disabled={loading || !formData?.name || !formData?.definition}
          onClick={saveTermDefinition}
          title={definition ? "Save Change" : "Add Entry"}
          shape="base"
        />
        {definition && (
          <Button
            loading={deleting}
            disabled={deleting}
            onClick={onDelete}
            variant="destructive"
            title="Delete"
            shape="base"
          />
        )}
        <ToolbarFiller />
      </DialogFooter>
    </>
  );
}
