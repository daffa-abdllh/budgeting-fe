import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "react-toastify";
import { loginUser, registerUser, logoutUser, forgotPassword, resetPassword, updateSalaryDay } from "./auth.api";
import { USERINFO_QUERY_KEY } from "./auth.queries";
import type { LoginInput, RegisterInput, ForgotPasswordInput, ResetPasswordInput, SalaryDayInput } from "./auth.contract";

export function useLoginMutation() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: LoginInput) => loginUser(payload),
    onSuccess: (response) => {
      queryClient.setQueryData(USERINFO_QUERY_KEY, response.data);
      toast.success(response.message || "Login successful!");
      navigate({ to: "/dashboard" });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to log in. Please try again.");
    },
  });
}

export function useRegisterMutation() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: RegisterInput) => registerUser(payload),
    onSuccess: (response) => {
      toast.success(response.message || "Registration successful! Please log in.");
      navigate({ to: "/" });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to register. Please try again.");
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => logoutUser(),
    onSuccess: () => {
      queryClient.setQueryData(USERINFO_QUERY_KEY, null);
      queryClient.clear();
      toast.success("Successfully logged out.");
      navigate({ to: "/" });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to log out.");
    },
  });
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: (payload: ForgotPasswordInput) => forgotPassword(payload),
    onSuccess: (response) => {
      toast.success(response.message || "A password reset link has been sent to your email.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to request password reset.");
    },
  });
}

export function useResetPasswordMutation() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: ResetPasswordInput) => resetPassword(payload),
    onSuccess: (response) => {
      toast.success(response.message || "Password reset successfully. Please log in.");
      navigate({ to: "/" });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to reset password.");
    },
  });
}

export function useUpdateSalaryDayMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SalaryDayInput) => updateSalaryDay(payload),
    onSuccess: (response) => {
      queryClient.setQueryData(USERINFO_QUERY_KEY, response.data);
      toast.success(response.message || "Salary day updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update salary day. Please try again.");
    },
  });
}
