import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function defaultBucket(): string | undefined {
  return (
    process.env.AWS_S3_BUCKET ??
    process.env.PDF_ASSETS_BUCKET ??
    process.env.S3_BUCKET ??
    undefined
  );
}

/**
 * Short-lived signed GET URL for a private object in S3.
 */
export async function presignGetObject(params: {
  bucket: string;
  key: string;
  expiresIn?: number;
}): Promise<string> {
  const region = process.env.AWS_REGION ?? process.env.AWS_DEFAULT_REGION;
  if (!region?.trim()) {
    throw new Error("Set AWS_REGION for S3 presigned URLs.");
  }

  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  const client = new S3Client({
    region,
    ...(accessKeyId && secretAccessKey
      ? { credentials: { accessKeyId, secretAccessKey } }
      : {}),
  });

  const command = new GetObjectCommand({
    Bucket: params.bucket,
    Key: params.key,
  });

  return getSignedUrl(client, command, { expiresIn: params.expiresIn ?? 120 });
}

export function resolveAssetBucket(storedBucket: string | null): string {
  const b = storedBucket?.trim();
  if (b) return b;
  const fallback = defaultBucket()?.trim();
  if (!fallback) {
    throw new Error(
      "Set s3_bucket on the tracked_assets row or set AWS_S3_BUCKET / PDF_ASSETS_BUCKET."
    );
  }
  return fallback;
}
