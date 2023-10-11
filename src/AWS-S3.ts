import * as AWS from '@aws-sdk/client-s3';

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

export async function uploadS3(blob: Blob, key: string): Promise<string> {
  const bucketName = process.env.AWS_S3_BUCKET_NAME;
  const s3 = new AWS.S3Client({
    credentials: {
      accessKeyId: `${process.env.AWS_ACCESS_KEY_ID}`,
      secretAccessKey: `${process.env.AWS_SECRET_ACCESS_KEY}`,
    },
    region: `${process.env.AWS_REGION}`,
  });

  key = process.env.AWS_S3_KEY_PREFIX + key;
  if (await s3IsExistObject(s3, { bucketName: bucketName, key: key })) return key;

  const buffer = new Uint8Array(await blob.arrayBuffer());
  const putObjectCommand = new AWS.PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: blob.type,
  });
  await s3.send(putObjectCommand);

  return key;
}
