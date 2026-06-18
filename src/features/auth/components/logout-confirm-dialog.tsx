import { Button } from "@/components/ui/button";
import { Loader2, X, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { createPortal } from "react-dom";
import { useEffect } from "react";

interface LogoutConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
}

export function LogoutConfirmDialog({ isOpen, onClose, onConfirm, isPending }: LogoutConfirmDialogProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

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
            className="fixed inset-0 bg-black/40 z-50"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-white border border-zinc-150 rounded-2xl w-full max-w-sm shadow-xl relative"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                disabled={isPending}
                className="absolute top-4.5 right-4.5 p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer disabled:opacity-50"
              >
                <X className="size-4.5" />
              </button>

              {/* Dialog Content */}
              <div className="p-6 text-center space-y-4">
                {/* Logout Icon Banner */}
                <div className="mx-auto size-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-500">
                  <LogOut className="size-5.5" />
                </div>

                <div className="space-y-1.5 text-center">
                  <h3 className="text-lg font-bold text-zinc-900">Sign Out</h3>
                  <p className="text-xs text-zinc-500 max-w-[280px] mx-auto leading-relaxed">
                    Apakah Anda yakin ingin keluar? Anda harus masuk kembali untuk mengakses akun Anda.
                  </p>
                </div>

                {/* Dialog Footer Actions */}
                <div className="flex items-center gap-3 pt-4 border-t border-zinc-100 mt-6 select-none">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={isPending}
                    className="flex-1 rounded-xl h-10 border border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900 transition-all font-medium text-xs cursor-pointer"
                  >
                    Batal
                  </Button>
                  
                  <Button
                    onClick={onConfirm}
                    disabled={isPending}
                    className="flex-1 rounded-xl h-10 bg-red-600 hover:bg-red-700 text-white font-medium text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="size-3.5 animate-spin" />
                        <span>Keluar...</span>
                      </>
                    ) : (
                      <span>Keluar</span>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
