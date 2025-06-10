import { createWriteStream } from 'fs';
import https from 'https';
import http from 'http';
import path from 'path';
import fs from 'fs';

const downloadImage = async (url: string, localPath: string): Promise<void> => {
  const client = url.startsWith('https') ? https : http;

  await new Promise<void>((resolve, reject) => {
    client
      .get(url, res => {
        if (res.statusCode !== 200) return reject(new Error(`Failed to get '${url}' (${res.statusCode})`));
        const fileStream = createWriteStream(localPath);
        res.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          resolve();
        });
      })
      .on('error', reject);
  });
};

export const ensureImageDownloaded = async (
  imageUrl: string,
  postId: string,
): Promise<{ fileName: string; localPath: string }> => {
  const fileName = path.basename(new URL(imageUrl).pathname);
  const dirPath = path.join(process.cwd(), 'public/posts', postId, 'images');
  const localPath = path.join(dirPath, fileName);

  !fs.existsSync(dirPath) && fs.mkdirSync(dirPath, { recursive: true });
  !fs.existsSync(localPath) && (await downloadImage(imageUrl, localPath));

  return {
    fileName: fileName,
    localPath: `/posts/${postId}/images/${fileName}`,
  };
};
