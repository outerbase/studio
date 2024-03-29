import { Textarea } from "@/components/ui/textarea";
import {
  DRIVER_DETAIL,
  SavedConnectionItemConfigConfig,
  SupportedDriver,
} from "./saved-connection-storage";
import { Input } from "@/components/ui/input";

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
  const authType = driver === "turso" ? "token" : "username";
  const endpointError = driverDetail.invalidateEndpoint(value.url);

  return (
    <>
      <div>
        <div className="text-xs mb-2 font-semibold">URL (*)</div>
        <Input
          autoFocus={autoFocus}
          placeholder={"URL"}
          value={value.url}
          onChange={(e) => {
            onChange({ ...value, url: e.currentTarget.value });
          }}
        />
        {endpointError && (
          <div className="text-xs mt-2 text-red-400">{endpointError}</div>
        )}
        <div className="text-xs mt-2">{driverDetail.endpointExample}</div>
      </div>

      {authType === "token" && (
        <div>
          <div className="text-xs mb-2 font-semibold">Token</div>
          <Textarea
            placeholder={
              showLockedCredential && !value.token ? "✱✱✱✱✱✱✱✱✱" : "Token"
            }
            className={
              showLockedCredential && !value.token ? "bg-secondary" : ""
            }
            value={value.token}
            onChange={(e) => {
              onChange({ ...value, token: e.currentTarget.value });
            }}
          />
        </div>
      )}

      {authType === "username" && (
        <>
          <div>
            <div className="text-xs mb-2 font-semibold">Username</div>
            <Input
              type="username"
              placeholder={
                showLockedCredential && !value.username
                  ? "✱✱✱✱✱✱✱✱✱"
                  : "Username"
              }
              className={
                showLockedCredential && !value.username ? "bg-secondary" : ""
              }
              value={value.username}
              onChange={(e) => {
                onChange({ ...value, username: e.currentTarget.value });
              }}
            />
          </div>
          <div>
            <div className="text-xs mb-2 font-semibold">Password</div>
            <Input
              type="password"
              placeholder={
                showLockedCredential && !value.password
                  ? "✱✱✱✱✱✱✱✱✱"
                  : "Password"
              }
              className={
                showLockedCredential && !value.password ? "bg-secondary" : ""
              }
              value={value.password}
              onChange={(e) => {
                onChange({ ...value, password: e.currentTarget.value });
              }}
            />
          </div>
        </>
      )}
    </>
  );
}
