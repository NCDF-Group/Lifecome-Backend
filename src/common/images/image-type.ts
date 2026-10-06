export type AvatarContentType = 'image/jpeg' | 'image/png' | 'image/webp';

/** Checks a file's leading "magic" bytes against its declared type, so a renamed file can't slip in. */
export function matchesImageType(image: Buffer, contentType: AvatarContentType): boolean {
  switch (contentType) {
    case 'image/jpeg':
      return image.length > 3 && image[0] === 0xff && image[1] === 0xd8 && image[2] === 0xff;
    case 'image/png':
      return image.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    case 'image/webp':
      return image.length > 12 && image.toString('ascii', 0, 4) === 'RIFF' && image.toString('ascii', 8, 12) === 'WEBP';
  }
}
