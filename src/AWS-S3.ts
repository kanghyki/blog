import * as AWS from '@aws-sdk/client-s3';

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

export async function uploadS3(blob: Blob): Promise<string> {
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
  const key = process.env.AWS_S3_KEY_PREFIX + randomKey;

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
