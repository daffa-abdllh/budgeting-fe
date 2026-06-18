import { useEffect, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { salaryDaySchema, type User } from "../api/auth.contract";
import { useUpdateSalaryDayMutation } from "../api/auth.mutations";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, X, AlertCircle, Calendar, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { createPortal } from "react-dom";

interface DayPickerProps {
  value: number;
  onChange: (val: number) => void;
}

function DayPicker({ value, onChange }: DayPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between gap-2.5 rounded-xl border border-zinc-200 bg-white h-11 px-4 text-sm w-full text-left focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 shadow-sm transition-all cursor-pointer select-none",
          isOpen && "ring-1 ring-zinc-950 border-zinc-950"
        )}
      >
        <div className="flex items-center gap-2.5 truncate">
          <Calendar className="size-4 text-zinc-400 shrink-0 pointer-events-none" />
          <span className="font-semibold text-zinc-900">{value}</span>
        </div>
        <ChevronDown className={cn("size-4 text-zinc-400 shrink-0 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-45 cursor-default" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 top-12.5 z-50 bg-white border border-zinc-150 rounded-2xl p-4 shadow-lg flex flex-col gap-3 select-none w-72 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-center pb-1.5 border-b border-zinc-100">
              <span className="font-bold text-sm text-zinc-800">Select Day</span>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {days.map((day) => {
                const isSelected = value === day;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => {
                      onChange(day);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "size-8 text-xs font-semibold rounded-lg flex items-center justify-center transition-all cursor-pointer border-0",
                      isSelected
                        ? "bg-zinc-900 text-white shadow-sm hover:bg-zinc-850"
                        : "text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 bg-transparent"
                    )}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

interface SalaryDayDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export function SalaryDayDialog({ isOpen, onClose, user }: SalaryDayDialogProps) {
  const updateSalaryDayMutation = useUpdateSalaryDayMutation();
  const isPending = updateSalaryDayMutation.isPending;

  // Lock scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const form = useForm({
    defaultValues: {
      salary_day: user?.salary_day || 1,
    },
    validators: {
      onChange: salaryDaySchema,
    },
    onSubmit: async ({ value }) => {
      updateSalaryDayMutation.mutate(value, {
        onSuccess: () => {
          onClose();
        },
      });
    },
  });

  // Pre-fill form when user details load or change
  useEffect(() => {
    if (isOpen && user) {
      form.setFieldValue("salary_day", user.salary_day || 1);
    }
  }, [isOpen, user, form]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-white border border-zinc-150 rounded-2xl w-full max-w-md shadow-xl relative"
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
                  Settings
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Update your monthly salary day to align your budget cycle
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
                {/* Salary Day Input Field */}
                <form.Field
                  name="salary_day"
                  children={(field) => {
                    const hasError = field.state.meta.isTouched && field.state.meta.errors.length > 0;
                    return (
                      <div className="space-y-1.5">
                        <Label htmlFor={field.name} className="text-xs font-semibold text-zinc-500 tracking-wide uppercase select-none font-medium">
                          Salary Day of Month
                        </Label>
                        <DayPicker
                          value={field.state.value}
                          onChange={field.handleChange}
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

                {/* Helpful Explanatory Box */}
                <div className="p-3.5 bg-zinc-50 border border-zinc-150 rounded-xl flex gap-2.5 text-zinc-650 text-xs leading-relaxed">
                  <AlertCircle className="size-4 shrink-0 mt-0.5 text-zinc-400" />
                  <div>
                    <span className="font-bold text-zinc-800">Budget Cycle:</span> Setting this to <span className="font-semibold text-zinc-800">25</span> means your monthly budget and dashboard cycle begins on the 25th of the target month and ends on the 24th of the following month. Setting it to <span className="font-semibold text-zinc-800">1</span> aligns your cycle with the standard calendar month.
                  </div>
                </div>

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
                            <span>Saving...</span>
                          </>
                        ) : (
                          <span>Save Settings</span>
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
    </AnimatePresence>,
    document.body
  );
}
