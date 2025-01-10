import { Textarea } from "@/components/ui/textarea";
import {
  DRIVER_DETAIL,
  SavedConnectionItemConfigConfig,
  SupportedDriver,
} from "./saved-connection-storage";
import { Input } from "@/components/ui/input";
import FileHandlerPicker from "@/components/filehandler-picker";
import { CommonDialogProvider } from "@/components/common-dialog";

export default function ConnectionStringInput({
  value,
  onChange,
  driver,
  showLockedCredential,
  autoFocus,
}: Readonly<{
  value: SavedConnectionItemConfigConfig;
  onChange: (value: SavedConnectionItemConfigConfig) => void;
  driver: SupportedDriver;
  showLockedCredential?: boolean;
  autoFocus?: boolean;
}>) {
  const driverDetail = DRIVER_DETAIL[driver];

  return (
    <>
      {driverDetail.fields.map((field, idx) => {
        let inputDom = <div></div>;
        const error = field.invalidate
          ? field.invalidate(value[field.name] ?? "")
          : null;

        if (field.type === "text" || field.type === "password") {
          inputDom = (
            <Input
              type={field.type}
              placeholder={
                showLockedCredential && !value[field.name]
                  ? "✱✱✱✱✱✱✱✱✱"
                  : field.placeholder
              }
              className={
                showLockedCredential && !value[field.name] ? "bg-secondary" : ""
              }
              autoFocus={autoFocus && idx === 0}
              value={value[field.name]}
              onChange={(e) => {
                onChange({ ...value, [field.name]: e.currentTarget.value });
              }}
            />
          );
        } else if (field.type === "textarea") {
          inputDom = (
            <Textarea
              placeholder={
                showLockedCredential && !value[field.name]
                  ? "✱✱✱✱✱✱✱✱✱"
                  : "Token"
              }
              className={
                showLockedCredential && !value[field.name] ? "bg-secondary" : ""
              }
              value={value[field.name]}
              onChange={(e) => {
                onChange({ ...value, [field.name]: e.currentTarget.value });
              }}
            />
          );
        } else if (field.type === "filehandler") {
          inputDom = (
            <CommonDialogProvider>
              <FileHandlerPicker
                value={value[field.name]}
                onChange={(fileId) => {
                  onChange({ ...value, [field.name]: fileId });
                }}
              />
            </CommonDialogProvider>
          );
        }

        return (
          <div key={field.name}>
            <div className="text-xs mb-2 font-semibold">
              {field.title} {field.required && <span>(*)</span>}
            </div>
            {inputDom}
            {error && <div className="text-xs mt-2 text-red-400">{error}</div>}
            {field.description && (
              <div className="text-xs mt-2">{field.description}</div>
            )}
          </div>
        );
      })}
    </>
  );
}
