import { uploadFile as uploadUserFile } from "@/lib/file-upload";

export async function uploadFile(file: File) {
  const { data, error } = await uploadUserFile(file);

  if (error) {
    // handle error here, throwing is okay here, it will be caught by the block editor
    // TODO: we should toast the error message
    console.error(error);
    throw new Error(error.message);
  }

  return data.url;
}
