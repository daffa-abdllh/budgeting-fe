import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().min(1, "Full name is required"),
    email: z.string().email("Invalid email format"),
    phone_number: z.string().min(10, "Phone number must be at least 10 digits"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z.string().min(8, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Confirm password does not match",
    path: ["confirm_password"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
  remember_me: z.boolean(),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format"),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    password: z.string().min(8, "New password must be at least 8 characters"),
    confirm_password: z.string().min(8, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Confirm password does not match",
    path: ["confirm_password"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export type User = {
  id: string;
  name: string;
  email: string;
  phone_number: string;
};
