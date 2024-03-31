import { env } from "@/env";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

export const R2Client = new S3Client({
  region: "auto",
  endpoint: env.R2_URL ?? "",
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY ?? "",
    secretAccessKey: env.R2_SECRET_ACCESS_KEY ?? "",
  },
});

async function upload({
  buffer,
  userId,
  filename,
  contentType,
}: {
  buffer: Buffer | Uint8Array;
  userId: string;
  filename: string;
  contentType: string;
}) {
  const key = `u-${userId}/${filename}`;

  await R2Client.send(
    new PutObjectCommand({
      Key: key,
      ContentType: contentType,
      Body: buffer,
      Bucket: env.R2_BUCKET,
    }),
  );

  const url = new URL(key, env.R2_PUBLIC_URL);

  return {
    key,
    url: url.toString(),
  };
}

export const R2 = {
  ...R2Client,
  upload,
};
