import { useEffect, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { walletSchema } from "../api/wallet.contract";
import { useCreateWalletMutation, useUpdateWalletMutation } from "../api/wallet.mutations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import type { Wallet } from "../api/wallet.contract";

interface WalletFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  wallet?: Wallet | null; // If provided, we are editing this wallet
}

export function WalletFormDialog({ isOpen, onClose, wallet }: WalletFormDialogProps) {
  const createWalletMutation = useCreateWalletMutation();
  const updateWalletMutation = useUpdateWalletMutation();

  const isEditing = !!wallet;
  const isPending = createWalletMutation.isPending || updateWalletMutation.isPending;

  // Local state for currency formatted display
  const [balanceInput, setBalanceInput] = useState("");

  const handleBalanceChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    handleChange: (v: number) => void
  ) => {
    const input = e.target;
    const rawVal = input.value;
    const selectionStart = input.selectionStart || 0;

    // Count non-digit characters before cursor
    const valBeforeCursor = rawVal.substring(0, selectionStart);
    const digitsBeforeCursor = valBeforeCursor.replace(/\D/g, "").length;

    // Clean all non-digits
    const cleanVal = rawVal.replace(/\D/g, "");
    const numericVal = cleanVal === "" ? null : Number(cleanVal);

    // Format with dots
    const formattedVal = cleanVal === "" ? "" : cleanVal.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    setBalanceInput(formattedVal);
    handleChange(numericVal as unknown as number);

    // Restore cursor position based on digit count
    requestAnimationFrame(() => {
      let newCursorPosition = 0;
      let digitCount = 0;
      for (let i = 0; i < formattedVal.length; i++) {
        if (digitCount === digitsBeforeCursor) {
          break;
        }
        if (/\d/.test(formattedVal[i])) {
          digitCount++;
        }
        newCursorPosition = i + 1;
      }
      input.setSelectionRange(newCursorPosition, newCursorPosition);
    });
  };

  // TanStack Form configuration
  const form = useForm({
    defaultValues: {
      name: "",
      balance: null as unknown as number,
    },
    validators: {
      onChange: walletSchema,
    },
    onSubmit: async ({ value }) => {
      if (isEditing && wallet) {
        updateWalletMutation.mutate(
          { walletId: wallet.id, payload: value },
          {
            onSuccess: () => {
              form.reset();
              onClose();
            },
          }
        );
      } else {
        createWalletMutation.mutate(value, {
          onSuccess: () => {
            form.reset();
            onClose();
          },
        });
      }
    },
  });

  // Reset or fill form values when wallet changes
  useEffect(() => {
    if (isOpen) {
      if (wallet) {
        form.setFieldValue("name", wallet.name);
        const bal = Math.round(Number(wallet.balance)) || 0;
        form.setFieldValue("balance", bal);
        setTimeout(() => {
          setBalanceInput(bal === 0 ? "0" : bal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."));
        }, 0);
      } else {
        form.reset();
        setTimeout(() => {
          setBalanceInput("");
        }, 0);
      }
    }
  }, [isOpen, wallet, form]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-40"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-white border border-zinc-150 rounded-2xl w-full max-w-md shadow-xl overflow-hidden relative"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4.5 right-4.5 p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer"
              >
                <X className="size-4.5" />
              </button>

              {/* Dialog Header */}
              <div className="px-6 pt-6 pb-4 border-b border-zinc-100 text-left">
                <h3 className="text-lg font-bold text-zinc-900">
                  {isEditing ? "Edit Wallet" : "Add New Wallet"}
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {isEditing ? "Modify your wallet details below" : "Create a new wallet to track your cashflow"}
                </p>
              </div>

              {/* Dialog Form Body */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  form.handleSubmit();
                }}
                className="p-6 space-y-4 text-left"
              >
                {/* Wallet Name Field */}
                <form.Field
                  name="name"
                  children={(field) => {
                    const hasError = field.state.meta.isTouched && field.state.meta.errors.length > 0;
                    return (
                      <div className="space-y-1.5">
                        <Label htmlFor={field.name} className="text-xs font-semibold text-zinc-500 tracking-wide uppercase select-none">
                          Wallet Name
                        </Label>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="e.g. Bank Jago, Cash, My Savings"
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

                {/* Wallet Balance Field */}
                <form.Field
                  name="balance"
                  children={(field) => {
                    const hasError = field.state.meta.isTouched && field.state.meta.errors.length > 0;
                    return (
                      <div className="space-y-1.5">
                        <Label htmlFor={field.name} className="text-xs font-semibold text-zinc-500 tracking-wide uppercase select-none">
                          {isEditing ? "Updated Balance" : "Initial Balance"}
                        </Label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-zinc-400 select-none">
                            Rp
                          </span>
                          <Input
                            id={field.name}
                            name={field.name}
                            type="text"
                            value={balanceInput}
                            onBlur={field.handleBlur}
                            onChange={(e) => handleBalanceChange(e, field.handleChange)}
                            placeholder="0"
                            className={cn(
                              "rounded-xl border border-zinc-200 bg-white h-11 pl-10 pr-4 text-sm w-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 focus-visible:border-zinc-950 shadow-sm",
                              hasError && "border-destructive focus-visible:ring-destructive"
                            )}
                          />
                        </div>
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

                {/* Actions Footer */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={isPending}
                    className="rounded-xl px-5 h-10 border border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900 transition-all font-medium text-xs cursor-pointer"
                  >
                    Cancel
                  </Button>
                  
                  <form.Subscribe
                    selector={(state) => [state.canSubmit]}
                    children={([canSubmit]) => (
                      <Button
                        type="submit"
                        disabled={!canSubmit || isPending}
                        className="rounded-xl px-6 h-10 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        {isPending ? (
                          <>
                            <Loader2 className="size-3.5 animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <span>{isEditing ? "Save Changes" : "Create Wallet"}</span>
                        )}
                      </Button>
                    )}
                  />
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
