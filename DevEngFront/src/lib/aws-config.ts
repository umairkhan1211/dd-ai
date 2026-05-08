import { S3Client } from "@aws-sdk/client-s3";

export const S3_BUCKET = import.meta.env.VITE_S3_BUCKET_NAME!;
const REGION = import.meta.env.VITE_S3_REGION!;
const ACCESS_KEY = import.meta.env.VITE_S3_ACCESS_KEY!;
const SECRET_KEY = import.meta.env.VITE_S3_SECRET_KEY!;

export const s3Client = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_KEY,
  },
});
