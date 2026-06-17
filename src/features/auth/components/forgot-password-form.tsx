import { useForm } from "@tanstack/react-form";
import { forgotPasswordSchema } from "../api/auth.contract";
import { useForgotPasswordMutation } from "../api/auth.mutations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

export function ForgotPasswordForm() {
  const forgotPasswordMutation = useForgotPasswordMutation();

  const form = useForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onChange: forgotPasswordSchema,
    },
    onSubmit: async ({ value }) => {
      forgotPasswordMutation.mutate(value);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-5 text-left"
    >
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

      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
        children={([canSubmit, isSubmitting]) => (
          <div className="flex items-center justify-between pt-4 border-t border-zinc-100 mt-4">
            <Link
              to="/"
              search={{ mode: "login" }}
              className="text-sm font-medium text-zinc-900 underline underline-offset-4 hover:opacity-80"
            >
              Back to sign in
            </Link>
            <Button
              type="submit"
              className="rounded-full px-8 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-sm transition-all h-11 cursor-pointer"
              disabled={!canSubmit || isSubmitting || forgotPasswordMutation.isPending}
            >
              {isSubmitting || forgotPasswordMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </div>
        )}
      />
    </form>
  );
}
