import { z } from 'zod';

import { createZodDto } from '../validation/zod-dto';

/** Max decoded size of a profile photo. The apps send a downsized image, well under this. */
export const MAX_AVATAR_BYTES = 512 * 1024;

/** `PUT .../avatar` - base64 in JSON rather than multipart, since the payload is small and this keeps
 * the API on one body format (no @fastify/multipart dependency for one route). */
export const UploadAvatarSchema = z.object({
  contentType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
  // base64 is ~4/3 of the byte length; the decoded size is checked again in the service.
  data: z.base64().max(Math.ceil((MAX_AVATAR_BYTES * 4) / 3) + 4),
});
export class UploadAvatarDto extends createZodDto(UploadAvatarSchema) {}
