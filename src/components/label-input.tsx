import { Input, InputProps } from "./orbit/input";
import { Label } from "./orbit/label";

export default function LabelInput(
  props: InputProps & { label: string; requiredDescription?: string }
) {
  return (
    <div className="flex flex-col gap-2">
      <Label
        title={props.label}
        required={props.required}
        requiredDescription="required"
      >
        <Input {...props} />
      </Label>
    </div>
  );
}
