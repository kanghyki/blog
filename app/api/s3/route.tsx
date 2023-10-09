import * as AWS from '@aws-sdk/client-s3';
import { NextRequest } from 'next/server';

function generateRamdomId(): string {
  return `${Math.floor(Math.random() * 100000000)}`;
}

async function s3IsExistObject(
  s3: AWS.S3Client,
  option: { bucketName: string | undefined; key: string },
): Promise<boolean> {
  try {
    const getObjectCommnad = new AWS.GetObjectCommand({
      Bucket: option.bucketName,
      Key: option.key,
    });
    await s3.send(getObjectCommnad);
  } catch (error) {
    return false;
  }
  return true;
}

export async function POST(request: NextRequest) {
  const bucketName = process.env.AWS_S3_BUCKET_NAME;
  const s3 = new AWS.S3Client({
    credentials: {
      accessKeyId: `${process.env.AWS_ACCESS_KEY_ID}`,
      secretAccessKey: `${process.env.AWS_SECRET_ACCESS_KEY}`,
    },
    region: `${process.env.AWS_REGION}`,
  });

  let randomKey = generateRamdomId();
  while (await s3IsExistObject(s3, { bucketName: bucketName, key: randomKey })) randomKey = generateRamdomId();

  const blob = await request.blob();
  const buffer = new Uint8Array(await blob.arrayBuffer());
  const putObjectCommand = new AWS.PutObjectCommand({
    Bucket: bucketName,
    Key: randomKey,
    Body: buffer,
    ContentType: blob.type,
  });
  await s3.send(putObjectCommand);

  return Response.json({ ok: true, key: randomKey, now: Date.now() });
}
