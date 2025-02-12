import { requestOuterbase } from "./api";

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
