
import { z } from 'zod';

export const RegisterSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});
export type RegisterFormData = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
    email: z.string().email({ message: "Invalid email address." }),
    password: z.string().min(1, { message: "Password is required." }),
});
export type LoginFormData = z.infer<typeof LoginSchema>;

export const ProfileSchema = z.object({
    username: z.string().min(3, { message: "Username must be at least 3 characters." }),
    firstName: z.string().min(1, { message: "First name is required." }),
    lastName: z.string().min(1, { message: "Last name is required." }),
    age: z.union([z.number().min(18, { message: 'You must be at least 18.' }).max(120), z.literal(""), z.null()]).transform(v => v === "" ? null : v).nullable(),
    avatar: z.string().url({ message: "Invalid avatar URL." }),
});
export type ProfileFormData = z.infer<typeof ProfileSchema>;
