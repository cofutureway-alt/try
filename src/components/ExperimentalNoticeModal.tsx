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
            className="relative w-full max-w-2xl bg-card border-2 border-primary/40 rounded-3xl shadow-2xl overflow-hidden p-6 md:p-8 text-right"
            dir="rtl"
          >
            {/* Top Badge */}
            <div className="flex items-center justify-between gap-3 mb-5 border-b border-border/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/30">
                  <ShieldAlert className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-black text-foreground flex items-center gap-2">
                    تنبيه وإشعار هام (نسخة تجريبية)
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    بيئة عمل استعراضية تجريبية مؤقتة
                  </p>
                </div>
              </div>

              <button
                onClick={handleDismiss}
                className="w-9 h-9 rounded-full bg-secondary/80 hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                title="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Large Prominent Notice */}
            <div className="my-5 p-5 md:p-6 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-2 border-primary/30 text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                قاعدة التصميم والهوية البصرية
              </div>
              <p className="text-lg md:text-2xl font-black text-foreground leading-relaxed">
                “كل موقع له تصميمه الخاص والفريد. لا تستخدم جميع المواقع نفس التصميم.”
              </p>
              <p className="text-xs md:text-sm text-muted-foreground font-medium">
                Every website has its own unique design. Not all websites use the same design.
              </p>
            </div>

            {/* Explanatory points */}
            <div className="space-y-3 bg-secondary/40 rounded-2xl p-4 md:p-5 border border-border/50 text-sm md:text-base leading-relaxed">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-muted-foreground">
                  <strong className="text-foreground font-bold">حالة الموقع التجريبي:</strong> هذا الموقع مخصص للعرض والاستكشاف والاختبار فقط.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-muted-foreground">
                  <strong className="text-foreground font-bold">الحذف التلقائي بعد 24 ساعة:</strong> جميع الإضافات والتعديلات والحسابات المنشأة سيتم مسحها بالكامل تلقائيًا بعد 24 ساعة.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <p className="text-muted-foreground">
                  <strong className="text-foreground font-bold">بيانات تجربة المسؤول:</strong> يمكنك تسجيل الدخول كمسؤول للاطلاع على لوحة التحكم بالكامل باستخدام البيانات الموضحة في صفحة الدخول.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
              <Button
                onClick={handleDismiss}
                className="w-full sm:w-auto flex-1 font-bold text-base h-12 shadow-lg hover:shadow-primary/20 gap-2"
                size="lg"
              >
                <CheckCircle2 className="w-5 h-5" />
                فهمت ذلك ومتابعة التصفح
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default ExperimentalNoticeModal;
