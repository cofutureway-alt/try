import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Sparkles, CheckCircle2, Clock, ShieldAlert, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ExperimentalNoticeModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("fekrly_experimental_notice_dismissed");
    if (!dismissed) {
      // Small delay for smooth entry
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem("fekrly_experimental_notice_dismissed", "true");
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
            className="relative w-full max-w-2xl bg-slate-900 border-2 border-emerald-500/40 rounded-3xl shadow-2xl overflow-hidden p-6 md:p-8 text-right"
            dir="rtl"
          >
            {/* Top Badge */}
            <div className="flex items-center justify-between gap-3 mb-5 border-b border-slate-700/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <ShieldAlert className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
                    تنبيه وإشعار هام (نسخة تجريبية)
                  </h3>
                  <p className="text-xs md:text-sm text-slate-400 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    بيئة عمل استعراضية تجريبية مؤقتة
                  </p>
                </div>
              </div>

              <button
                onClick={handleDismiss}
                className="w-9 h-9 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                title="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Large Prominent Notice */}
            <div className="my-5 p-5 md:p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border-2 border-emerald-500/30 text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-bold mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                قاعدة التصميم والهوية البصرية
              </div>
              <p className="text-lg md:text-2xl font-black text-white leading-relaxed">
                “كل موقع له تصميمه الخاص والفريد. لا تستخدم جميع المواقع نفس التصميم.”
              </p>
              <p className="text-xs md:text-sm text-slate-400 font-medium">
                Every website has its own unique design. Not all websites use the same design.
              </p>
            </div>

            {/* Explanatory points */}
            <div className="space-y-3 bg-slate-800/50 rounded-2xl p-4 md:p-5 border border-slate-700/50 text-sm md:text-base leading-relaxed">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-slate-300">
                  <strong className="text-white font-bold">حالة الموقع التجريبي:</strong> هذا الموقع تجريبي للعرض فقط.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-slate-300">
                  <strong className="text-white font-bold">الحذف التلقائي بعد 24 ساعة:</strong> جميع البيانات والإضافات تُحذف تلقائياً بعد 24 ساعة.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-slate-300">
                  <strong className="text-white font-bold">بيانات تجربة المسؤول:</strong> يمكن تسجيل الدخول كمسؤول من صفحة الدخول للاطلاع على لوحة التحكم بالكامل.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
              <Button
                onClick={handleDismiss}
                className="w-full sm:w-auto flex-1 font-bold text-base h-12 shadow-lg hover:shadow-emerald-500/20 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                size="lg"
              >
                <CheckCircle2 className="w-5 h-5" />
                فهمت ومتابعة التصفح
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default ExperimentalNoticeModal;
