import { Globe } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

interface SearchButtonProps {
  isActive: boolean;
  onToggle: (active: boolean) => void;
}

export default function SearchButton({
  isActive,
  onToggle,
}: SearchButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onToggle(!isActive)}
      className={cn(
        "rounded-full transition-all flex items-center gap-2 px-1.5 py-1 border h-8 cursor-pointer",
        isActive
          ? "bg-sky-500/15 border-sky-400 text-sky-500"
          : "bg-background border-border/60 text-muted-foreground hover:text-foreground hover:border-border/80"
      )}
    >
      <div className="w-4 h-4 flex items-center justify-center shrink-0">
        <motion.div
          animate={{
            rotate: isActive ? 180 : 0,
            scale: isActive ? 1.1 : 1,
          }}
          whileHover={{
            rotate: isActive ? 180 : 15,
            scale: 1.1,
            transition: {
              type: "spring",
              stiffness: 300,
              damping: 10,
            },
          }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 25,
          }}
        >
          <Globe
            className={cn(
              "w-4 h-4",
              isActive ? "text-sky-500" : "text-inherit"
            )}
          />
        </motion.div>
      </div>
      <AnimatePresence>
        {isActive && (
          <motion.span
            initial={{ width: 0, opacity: 0 }}
            animate={{
              width: "auto",
              opacity: 1,
            }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="text-sm overflow-hidden whitespace-nowrap text-sky-500 shrink-0"
          >
            Search
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
