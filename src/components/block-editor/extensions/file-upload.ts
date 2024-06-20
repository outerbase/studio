import { uploadFile as uploadUserFile } from "./../../../lib/file-upload";
import { toast } from "sonner";

export async function uploadFile(file: File) {
  const { data, error } = await uploadUserFile(file);

  if (error) {
    toast.error("Upload failed!", {
      description: error.message,
    });
    throw new Error(error.message);
  }

  return data.url;
}
