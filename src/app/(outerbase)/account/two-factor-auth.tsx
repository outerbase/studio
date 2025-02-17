import { Button } from "@/components/orbit/button";
import { Input } from "@/components/orbit/input";
import { CountryCodePicker } from "@/components/picker/country-code-picker";
import { Label } from "@/components/ui/label";
import {
  deleteOuterbaseTwoFactorAuth,
  requestOuterbase2FAPhone,
  requestOuterbaseTwoFactorAuth,
  verifyOuterbase2FAOTP,
} from "@/outerbase-cloud/api-account";
import { CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useSession } from "../session-provider";

interface HasOTPProps {
  loading?: boolean;
  onDelete: () => void;
}
function HasOTP({ onDelete, loading }: HasOTPProps) {
  return (
    <div className="flex flex-col items-start gap-5">
      <div>Authentication App</div>
      <p className="text-base">
        Verification codes will be generated by the authentication app you
        configured.
      </p>
      <Button loading={loading} onClick={onDelete} title="Disable" size="lg" />
    </div>
  );
}

interface VerifyCodeInputProps {
  loading: boolean;
  code: string;
  disabled?: boolean;
  onCancel?: () => void;
  onSave: () => void;
  onChange: (v: string) => void;
}
function VerifyCodeInput({
  code,
  onChange,
  onSave,
  disabled,
  loading,
  onCancel,
}: VerifyCodeInputProps) {
  return (
    <>
      <div className="flex flex-col gap-2">
        <Label className="text-primary font-semibold">
          Enter verification code
          <span className="text-red-500">*</span>
        </Label>
        <Input value={code} onValueChange={onChange} className="w-[250px]" />
      </div>
      <div className="flex flex-row gap-5">
        <Button
          disabled={disabled}
          onClick={onSave}
          variant="primary"
          title="Save"
          shape="base"
          loading={loading}
          className="rounded-4xl"
        />

        <Button title="Cancel" onClick={onCancel} className="bg-gray-600" />
      </div>
    </>
  );
}

type TwoFactorAuthType = "otp" | "phone";
interface QRCode {
  base32: string;
  id: string;
  image: string;
}

interface ISMS {
  id: string;
  number_masked: string;
  user_id: string;
}
export default function TwoFactorAuth() {
  const { session, refreshSession } = useSession();
  const [twoFactorType, setTwoFactorType] =
    useState<TwoFactorAuthType>("phone");
  const [add, setAdd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [prefix, setPrefix] = useState("+1");
  const [phone, setPhone] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [sms, setSMS] = useState<ISMS>();
  const [qrcode, setQrcode] = useState<QRCode>();
  const [deleting, setDeleting] = useState(false);

  const onClear = () => {
    setDeleting(false);
    setQrcode(undefined);
    setDeleting(false);
    setVerifyCode("");
    setAdd(false);
    setTwoFactorType("phone");
  };

  const onRefreshSession = useCallback(
    (msg: string) => {
      refreshSession().then(() => {
        onClear();
        toast.success(msg);
      });
    },
    [refreshSession]
  );

  const onSendRequestPhone2FA = useCallback(() => {
    setLoading(true);
    requestOuterbaseTwoFactorAuth("phone", {
      number: prefix + phone,
    })
      .then((r) => {
        setLoading(false);
        setSMS(r as ISMS);
        requestOuterbase2FAPhone((r as ISMS).id).then(() => {});
      })
      .catch()
      .finally();
  }, [prefix, phone]);

  const onRequestOuterbaseTwoFactorAuth = useCallback(
    (type: TwoFactorAuthType) => {
      setTwoFactorType(type);
      if (type === "otp" && !qrcode) {
        requestOuterbaseTwoFactorAuth(type, {})
          .then((r) => {
            if (type === "otp") {
              setQrcode(r as QRCode);
            }
          })
          .catch()
          .finally();
      }
    },
    [qrcode]
  );

  const onVerifyOuterbaseOTP = useCallback(() => {
    if (!qrcode?.id) return;
    setLoading(true);
    verifyOuterbase2FAOTP({
      otp_id: qrcode.id,
      token: verifyCode,
    })
      .then(() => {
        onRefreshSession("2FA enabled");
      })
      .catch((error) => {
        setLoading(false);
        toast.error(error.message);
      });
  }, [qrcode, verifyCode, onRefreshSession]);

  const onDeleteTwoFactor = useCallback(() => {
    setDeleting(true);
    deleteOuterbaseTwoFactorAuth()
      .then(() => {
        onRefreshSession("2FA disabled");
      })
      .catch((error) => {
        setDeleting(false);
        toast.error(error.message);
      });
  }, [onRefreshSession]);

  const disabled = twoFactorType === "otp" && verifyCode.length < 6;

  if (session?.user.has_otp) {
    return <HasOTP loading={deleting} onDelete={onDeleteTwoFactor} />;
  }

  let footer = (
    <Button
      onClick={() => setAdd(true)}
      title="Add 2FA Device"
      size="lg"
      className="mt-10"
    />
  );
  if (add) {
    footer = (
      <div className="mt-10 flex flex-col gap-5">
        <div className="flex flex-row items-center gap-5">
          <Button
            onClick={() => onRequestOuterbaseTwoFactorAuth("phone")}
            title="SMS"
            size="lg"
            variant={twoFactorType === "phone" ? "primary" : "secondary"}
            className="w-[170px] justify-center"
          />
          <Button
            onClick={() => onRequestOuterbaseTwoFactorAuth("otp")}
            title="Authentication App"
            size="lg"
            variant={twoFactorType === "otp" ? "primary" : "secondary"}
            className="w-[170px] justify-center"
          />
        </div>
        <div className="mt-5 flex flex-col gap-2">
          {twoFactorType === "otp" ? (
            <>
              <Label className="text-primary font-semibold">
                Scan the QR code
              </Label>
              <div className="text-sm">
                Use an authentication app like Google Authenticator, 1Password
                or Authy.
              </div>{" "}
              <div className="relative h-[180px] w-[180px] rounded bg-white">
                {qrcode && (
                  <Image
                    src={qrcode?.image}
                    alt="qr-code"
                    fill
                    className="rounded object-fill"
                  />
                )}
              </div>
            </>
          ) : (
            <>
              <Label className="text-primary font-semibold">
                Country or region code <span className="text-red-500">*</span>
              </Label>
              <div className="w-[250px]">
                <CountryCodePicker
                  onChange={(c) => {
                    setPrefix(c.code);
                  }}
                  className="w-[250px]"
                />
              </div>
            </>
          )}
        </div>
        {twoFactorType === "phone" && (
          <div className="flex flex-col gap-2">
            <Label className="text-primary font-semibold">
              Your phone number
              <span className="text-red-500">*</span>
            </Label>
            <Input
              value={phone}
              onValueChange={setPhone}
              className="w-[250px]"
            />
            <div className="mt-5 flex flex-row gap-5">
              <Button
                disabled={!!sms || phone.length === 0}
                variant="primary"
                title="Sent Code"
                shape="base"
                loading={loading}
                className="rounded-4xl"
                onClick={onSendRequestPhone2FA}
              />
              {sms && (
                <div className="text-primary flex flex-row items-center gap-2 text-base">
                  <CheckCircle2 className="h-4 w-4" color="green" />
                  SMS sent
                </div>
              )}
            </div>
          </div>
        )}

        <VerifyCodeInput
          disabled={disabled}
          code={verifyCode}
          loading={loading}
          onChange={setVerifyCode}
          onSave={onVerifyOuterbaseOTP}
          onCancel={onClear}
        />
      </div>
    );
  }
  return (
    <div className="mt-6 flex flex-col items-start gap-2">
      <h2 className="text-xl font-medium text-balance text-neutral-800 dark:text-neutral-100">
        Two-factor authentication
      </h2>
      <span className="text-accent-foreground text-base dark:text-neutral-400">
        Requiring more than just a password to sign in to your account, giving
        your Outerbase account an additional layer of security.
      </span>
      {footer}
    </div>
  );
}
