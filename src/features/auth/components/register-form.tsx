import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { registerSchema } from "../api/auth.contract";
import { useRegisterMutation } from "../api/auth.mutations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

export function RegisterForm() {
  const registerMutation = useRegisterMutation();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone_number: "",
      password: "",
      confirm_password: "",
    },
    validators: {
      onChange: registerSchema,
    },
    onSubmit: async ({ value }) => {
      registerMutation.mutate(value);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-4 text-left"
    >
      {/* Row 1: Full Name & Phone Number (2 columns) */}
      <div className="grid grid-cols-2 gap-4">
        <form.Field
          name="name"
          children={(field) => {
            const hasError = field.state.meta.isTouched && field.state.meta.errors.length > 0;
            return (
              <div className="space-y-1.5">
                <Label htmlFor={field.name} className="text-sm font-medium text-zinc-500">
                  Full name
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Daffa Abdullah"
                  className={cn(
                    "rounded-xl border border-zinc-200 bg-white h-11 px-4 text-sm w-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 focus-visible:border-zinc-950 shadow-sm",
                    hasError && "border-destructive focus-visible:ring-destructive"
                  )}
                />
                <AnimatePresence>
                  {hasError && (
                    <motion.p
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="text-xs text-destructive font-medium mt-1 px-1"
                    >
                      {field.state.meta.errors
                        .map((err: unknown) =>
                          err && typeof err === "object" && "message" in err
                            ? (err as { message: string }).message
                            : String(err)
                        )
                        .join(", ")}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            );
          }}
        />

        <form.Field
          name="phone_number"
          children={(field) => {
            const hasError = field.state.meta.isTouched && field.state.meta.errors.length > 0;
            return (
              <div className="space-y-1.5">
                <Label htmlFor={field.name} className="text-sm font-medium text-zinc-500">
                  Phone number
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="62851..."
                  className={cn(
                    "rounded-xl border border-zinc-200 bg-white h-11 px-4 text-sm w-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 focus-visible:border-zinc-950 shadow-sm",
                    hasError && "border-destructive focus-visible:ring-destructive"
                  )}
                />
                <AnimatePresence>
                  {hasError && (
                    <motion.p
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="text-xs text-destructive font-medium mt-1 px-1"
                    >
                      {field.state.meta.errors
                        .map((err: unknown) =>
                          err && typeof err === "object" && "message" in err
                            ? (err as { message: string }).message
                            : String(err)
                        )
                        .join(", ")}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            );
          }}
        />
      </div>

      {/* Row 2: Email address (full width) */}
      <form.Field
        name="email"
        children={(field) => {
          const hasError = field.state.meta.isTouched && field.state.meta.errors.length > 0;
          return (
            <div className="space-y-1.5">
              <Label htmlFor={field.name} className="text-sm font-medium text-zinc-500">
                Email address
              </Label>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Email address"
                type="email"
                className={cn(
                  "rounded-xl border border-zinc-200 bg-white h-11 px-4 text-sm w-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 focus-visible:border-zinc-950 shadow-sm",
                  hasError && "border-destructive focus-visible:ring-destructive"
                )}
              />
              <AnimatePresence>
                {hasError && (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="text-xs text-destructive font-medium mt-1 px-1"
                  >
                    {field.state.meta.errors
                      .map((err: unknown) =>
                        err && typeof err === "object" && "message" in err
                          ? (err as { message: string }).message
                          : String(err)
                      )
                      .join(", ")}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          );
        }}
      />

      {/* Row 3: Password & Confirm Password (2 columns) */}
      <div className="grid grid-cols-2 gap-4">
        <form.Field
          name="password"
          children={(field) => {
            const hasError = field.state.meta.isTouched && field.state.meta.errors.length > 0;
            return (
              <div className="space-y-1.5">
                <Label htmlFor={field.name} className="text-sm font-medium text-zinc-500">
                  Password
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Password"
                  type={showPassword ? "text" : "password"}
                  className={cn(
                    "rounded-xl border border-zinc-200 bg-white h-11 px-4 text-sm w-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 focus-visible:border-zinc-950 shadow-sm",
                    hasError && "border-destructive focus-visible:ring-destructive"
                  )}
                />
                <AnimatePresence>
                  {hasError && (
                    <motion.p
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="text-xs text-destructive font-medium mt-1 px-1"
                    >
                      {field.state.meta.errors
                        .map((err: unknown) =>
                          err && typeof err === "object" && "message" in err
                            ? (err as { message: string }).message
                            : String(err)
                        )
                        .join(", ")}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            );
          }}
        />

        <form.Field
          name="confirm_password"
          children={(field) => {
            const hasError = field.state.meta.isTouched && field.state.meta.errors.length > 0;
            return (
              <div className="space-y-1.5">
                <Label htmlFor={field.name} className="text-sm font-medium text-zinc-500">
                  Confirm your password
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Confirm password"
                  type={showPassword ? "text" : "password"}
                  className={cn(
                    "rounded-xl border border-zinc-200 bg-white h-11 px-4 text-sm w-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 focus-visible:border-zinc-950 shadow-sm",
                    hasError && "border-destructive focus-visible:ring-destructive"
                  )}
                />
                <AnimatePresence>
                  {hasError && (
                    <motion.p
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="text-xs text-destructive font-medium mt-1 px-1"
                    >
                      {field.state.meta.errors
                        .map((err: unknown) =>
                          err && typeof err === "object" && "message" in err
                            ? (err as { message: string }).message
                            : String(err)
                        )
                        .join(", ")}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            );
          }}
        />
      </div>

      {/* Helper text */}
      <p className="text-xs text-zinc-400 mt-1 select-none">
        Use 8 or more characters with a mix of letters, numbers & symbols
      </p>

      {/* Show password checkbox */}
      <div className="flex items-center space-x-2 py-1 select-none">
        <input
          type="checkbox"
          id="show-password-reg"
          checked={showPassword}
          onChange={(e) => setShowPassword(e.target.checked)}
          className="accent-zinc-900 h-4.5 w-4.5 rounded border-zinc-300"
        />
        <label htmlFor="show-password-reg" className="text-sm font-medium text-zinc-800 cursor-pointer">
          Show password
        </label>
      </div>

      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
        children={([canSubmit, isSubmitting]) => (
          <div className="flex items-center justify-between pt-4 border-t border-zinc-100 mt-4">
            <Link
              to="/"
              search={{ mode: "login" }}
              className="text-sm font-medium text-zinc-900 underline underline-offset-4 hover:opacity-80"
            >
              log in instead
            </Link>
            <Button
              type="submit"
              className="rounded-full px-8 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-sm transition-all h-11 cursor-pointer"
              disabled={!canSubmit || isSubmitting || registerMutation.isPending}
            >
              {isSubmitting || registerMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Create an account"
              )}
            </Button>
          </div>
        )}
      />
    </form>
  );
}
