import { useState, useEffect } from "react";
import { Info, X, Search, MousePointer, Navigation } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function InfoButton() {
  const [open, setOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("info-toast-dismissed");
    if (!dismissed) {
      const timer = setTimeout(() => setShowToast(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismissToast = () => {
    setShowToast(false);
    sessionStorage.setItem("info-toast-dismissed", "1");
  };

  return (
    <>
      {/* Info button */}
      <button
        onClick={() => { setOpen(true); dismissToast(); }}
        className="glass-panel p-2.5 rounded-full hover:scale-110 transition-all duration-200 hover:shadow-lg"
        aria-label="How to use"
      >
        <Info className="h-5 w-5 text-primary" />
      </button>

      {/* Welcome toast */}
      <AnimatePresence>
        {showToast && !open && (
          <motion.div
            initial={{ opacity: 0, y: 10, x: 0 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-14 right-0 glass-panel px-4 py-3 w-64 shadow-lg"
          >
            <button onClick={dismissToast} className="absolute top-2 right-2 text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
            <p className="text-sm font-medium">Welcome! 👋</p>
            <p className="text-xs text-muted-foreground mt-1">
              New here? Tap the <Info className="inline h-3.5 w-3.5 text-primary" /> button to learn how to explore the world map.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info modal */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[3000] flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-panel w-[340px] p-6 relative z-10"
            >
              <button
                onClick={() => setOpen(false)}
                className="absolute top-3 right-3 rounded-full p-1.5 hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>

              <h2 className="text-lg font-bold mb-4">How to Use</h2>

              <div className="space-y-4">
                <Step
                  icon={<MousePointer className="h-4 w-4" />}
                  title="Click a Country"
                  desc="Click any country on the map to see its details — capital, population, continent, and fun facts."
                />
                <Step
                  icon={<Search className="h-4 w-4" />}
                  title="Search"
                  desc="Use the search bar to find any country by name. The map will fly to it automatically."
                />
                <Step
                  icon={<Navigation className="h-4 w-4" />}
                  title="Explore Neighbors"
                  desc="When a country card opens, click on any neighboring country chip to navigate there."
                />
              </div>

              <p className="text-[10px] text-muted-foreground text-center mt-5">
                Scroll & zoom the map to explore freely
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

function Step({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
