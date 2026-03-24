import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

let _r2: S3Client | null = null;

function getR2() {
  if (!_r2) {
    _r2 = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
  }
  return _r2;
}

export async function uploadToR2(
  file: Buffer,
  filename: string,
  contentType: string = 'audio/mpeg'
): Promise<string> {
  const bucket = process.env.R2_BUCKET_NAME || 'ai-records-music';
  const publicUrl = process.env.R2_PUBLIC_URL!;
  const key = `tracks/${Date.now()}-${filename}`;

  await getR2().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: file,
      ContentType: contentType,
    })
  );

  return `${publicUrl}/${key}`;
}

export async function deleteFromR2(url: string): Promise<void> {
  const bucket = process.env.R2_BUCKET_NAME || 'ai-records-music';
  const publicUrl = process.env.R2_PUBLIC_URL!;
  const key = url.replace(`${publicUrl}/`, '');

  await getR2().send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );
}

export function isR2Configured(): boolean {
  return !!(
    process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_PUBLIC_URL
  );
}
