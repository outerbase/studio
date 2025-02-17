import { requestOuterbase } from "./api";
import { OuterbaseAPIResponse } from "./api-type";

export interface OuterbaseUserProfileInput {
  first_name: string;
  last_name: string;
}

export async function updateOuterbaseUserProfile(
  data: OuterbaseUserProfileInput
) {
  return await requestOuterbase(`/api/v1/me/profile`, "POST", data);
}

export async function updateOuterbaseUserPassword(data: {
  new_password: string;
  old_password: string;
}) {
  return await requestOuterbase(`/api/v1/me/profile/password`, "PUT", data);
}

export async function updateOuterbaseUserFlag(editor_theme: string) {
  return await requestOuterbase(`/api/v1/me/flag`, "POST", {
    editor_theme,
  });
}

export async function requestResetPassword(data: { email: string }) {
  return await requestOuterbase(
    `/api/v1/auth/password_reset/request`,
    "POST",
    data
  );
}

export async function resetPassword(data: {
  password: string;
  reset_token: string;
}) {
  return await requestOuterbase(
    `/api/v1/auth/password_reset/submit`,
    "POST",
    data
  );
}

export async function requestOuterbaseTwoFactorAuth(
  type: "otp" | "phone",
  data: {
    number?: string;
  }
) {
  return await requestOuterbase(`/api/v1/me/${type}`, "POST", data);
}

export async function verifyOuterbase2FAOTP(data: {
  otp_id: string;
  token: string;
}) {
  return await requestOuterbase<OuterbaseAPIResponse>(
    `/api/v1/me/otp/verify`,
    "POST",
    data
  );
}

export async function deleteOuterbaseTwoFactorAuth() {
  return await requestOuterbase<OuterbaseAPIResponse>(
    "/api/v1/me/otp",
    "DELETE"
  );
}

export async function requestOuterbase2FAPhone(id: string) {
  return await requestOuterbase(`/api/v1/me/phone/${id}/request`);
}

export async function verifyOuterbaseOTP(token: string) {
  return await requestOuterbase("/api/v1/auth/mfa/otp/verify", "POST", {
    token,
  });
}
