import { motion, useAnimate } from "motion/react";
import { useEffect } from "react";

interface TypewriterSequence {
  text: string;
  deleteAfter?: boolean;
  pauseAfter?: number;
}

interface TypewriterTitleProps {
  sequences?: TypewriterSequence[];
  typingSpeed?: number;
  startDelay?: number;
  autoLoop?: boolean;
  loopDelay?: number;
}

export default function TypewriterTitle({
  sequences = [
    { text: "Typewriter", deleteAfter: true },
    { text: "Multiple Words", deleteAfter: true },
    { text: "Auto Loop", deleteAfter: false },
  ],
  typingSpeed = 50,
  startDelay = 500,
  autoLoop = true,
  loopDelay = 2000,
}: TypewriterTitleProps) {
  const [scope, animate] = useAnimate();

  useEffect(() => {
    let isActive = true;

    const typeText = async () => {
      const titleElement = scope.current.querySelector("[data-typewriter]");
      if (!titleElement) return;

      while (isActive) {
        await animate(scope.current, { opacity: 1 });
        titleElement.textContent = "";

        await new Promise((resolve) => setTimeout(resolve, startDelay));

        for (const sequence of sequences) {
          if (!isActive) break;

          for (let i = 0; i < sequence.text.length; i++) {
            if (!isActive) break;
            titleElement.textContent = sequence.text.slice(0, i + 1);
            await new Promise((resolve) => setTimeout(resolve, typingSpeed));
          }

          if (sequence.pauseAfter) {
            await new Promise((resolve) =>
              setTimeout(resolve, sequence.pauseAfter)
            );
          }

          if (sequence.deleteAfter) {
            await new Promise((resolve) => setTimeout(resolve, 500));

            for (let i = sequence.text.length; i > 0; i--) {
              if (!isActive) break;
              titleElement.textContent = sequence.text.slice(0, i);
              await new Promise((resolve) =>
                setTimeout(resolve, typingSpeed / 2)
              );
            }
          }
        }

        if (!(autoLoop && isActive)) break;

        await new Promise((resolve) => setTimeout(resolve, loopDelay));
      }
    };

    typeText();

    return () => {
      isActive = false;
    };
  }, [sequences, typingSpeed, startDelay, autoLoop, loopDelay, animate, scope]);

  return (
    <div className="relative mx-auto w-full max-w-4xl">
      <div
        className="relative z-10 flex flex-col items-center justify-center text-center"
        ref={scope}
      >
        <motion.div
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 font-mono text-4xl text-secondary tracking-tight md:text-6xl"
          initial={{ opacity: 0 }}
        >
          <span
            className="inline-block animate-cursor border-accent border-r-2 pr-1"
            data-typewriter
          >
            {sequences[0].text}
          </span>
        </motion.div>
      </div>
    </div>
  );
}
