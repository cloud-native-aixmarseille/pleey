import * as z from 'zod';

const avatarHeaderValueSchema = z.string().min(1);

export const avatarUserIdParamSchema = z.uuid({ version: 'v7' });
export type AvatarUserIdParam = z.infer<typeof avatarUserIdParamSchema>;

export const avatarGuestIdParamSchema = z.uuid({ version: 'v7' });
export type AvatarGuestIdParam = z.infer<typeof avatarGuestIdParamSchema>;

export const avatarSeedParamSchema = z.string().min(1);
export type AvatarSeedParam = z.infer<typeof avatarSeedParamSchema>;

export const avatarHttpResponseSchema = z.object({
  content: z.instanceof(Uint8Array),
  headers: z.object({
    cacheControl: avatarHeaderValueSchema,
    contentType: avatarHeaderValueSchema,
    expires: avatarHeaderValueSchema.optional(),
    pragma: avatarHeaderValueSchema.optional(),
  }),
});

export type AvatarHttpResponse = z.infer<typeof avatarHttpResponseSchema>;