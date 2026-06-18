import { apiFetch } from "@/lib/http";
import type {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  User,
  SalaryDayInput,
} from "./auth.contract";

export async function registerUser(payload: RegisterInput) {
  return await apiFetch<User>("/auth/register", {
    method: "POST",
    json: payload,
  });
}

export async function loginUser(payload: LoginInput) {
  return await apiFetch<User>("/auth/login", {
    method: "POST",
    json: payload,
  });
}

export async function logoutUser() {
  return await apiFetch("/auth/logout", {
    method: "DELETE",
  });
}

export async function forgotPassword(payload: ForgotPasswordInput) {
  return await apiFetch<null>("/auth/forgot-password", {
    method: "POST",
    json: payload,
  });
}

export async function resetPassword(payload: ResetPasswordInput) {
  return await apiFetch<null>("/auth/reset-password", {
    method: "POST",
    json: payload,
  });
}

export async function getUserinfo() {
  return await apiFetch<User>("/auth/userinfo", {
    method: "GET",
  });
}

export async function updateSalaryDay(payload: SalaryDayInput) {
  return await apiFetch<User>("/auth/salary-day", {
    method: "PUT",
    json: payload,
  });
}
