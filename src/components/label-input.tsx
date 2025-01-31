import { Input, InputProps } from "./ui/input";
import { Label } from "./ui/label";

export default function LabelInput(props: InputProps & { label: string }) {
  return (
    <div className="flex flex-col gap-2">
      <Label>{props.label}</Label>
      <Input {...props} />
    </div>
  );
}
