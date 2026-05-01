import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(64, 'Password cannot exceed 64 characters')
  .regex(/[a-z]/, 'Password must include a lowercase letter')
  .regex(/[A-Z]/, 'Password must include an uppercase letter')
  .regex(/\d/, 'Password must include a number')
  .regex(/[^A-Za-z0-9]/, 'Password must include a special character');

const emailSchema = z.string().trim().email().transform((value) => value.toLowerCase());

export const registerBodySchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: emailSchema,
  password: passwordSchema,
});

export const loginBodySchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(64),
});

export type RegisterInput = z.infer<typeof registerBodySchema>;
export type LoginInput = z.infer<typeof loginBodySchema>;
