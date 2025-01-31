import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCallback, useState } from "react";
import DataCatalogDriver, { DataCatalogTermDefinition } from "../driver";

interface Props {
  schemaName: string;
  driver?: DataCatalogDriver;
  open: boolean;
  onClose: (open: boolean) => void;
  selectedTermDefinition: string;
}

export function DataCatalogEntryModal({
  open,
  onClose,
  schemaName,
  driver,
  selectedTermDefinition,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<
    Exclude<DataCatalogTermDefinition, "id">
  >({
    id: "",
    name: "",
    otherName: "",
    definition: "",
  });

  const updateTermDefinition = useCallback(() => {
    setLoading(true);
    let data = {
      ...formData,
      id: String(Date.now() * 1000),
    };
    if (selectedTermDefinition) {
      data = formData;
    }
    driver
      ?.updateTermDefinition(schemaName, data)
      .then((r) => {
        console.log(r);
      })
      .catch(() => {
        setLoading(false);
      })
      .finally(() => {
        setLoading(false);
        onClose(false);
      });
  }, [formData, driver, onClose, selectedTermDefinition, schemaName]);

  const onChangeValue = useCallback(
    (value: string, key: keyof DataCatalogTermDefinition) => {
      setFormData(() => ({
        ...formData,
        [key]: value,
      }));
    },
    [formData]
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm">Add Entry</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Term</DialogTitle>
          <DialogDescription>
            Add terms to your Data Dictionary to help your team and AI
            understand important business terminology. For example Customer
            Acquisition Cost, Churn, Activation Rate.
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
              onChange={(e) => {
                onChangeValue(e.currentTarget.value, "name");
              }}
            />
          </div>
          <div className="items-center gap-4">
            <Label className="text-right text-xs">Other Names</Label>
            <Input
              value={formData.otherName}
              className="col-span-3"
              placeholder="Add other names"
              onChange={(e) => {
                onChangeValue(e.currentTarget.value, "otherName");
              }}
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
              placeholder="Add d definition"
              onChange={(e) => {
                onChangeValue(e.currentTarget.value, "definition");
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={updateTermDefinition} type="submit">
            Add Entry
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
