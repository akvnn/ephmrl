import { useEffect, useRef } from "react";
import { useThemeStore } from "@/hooks/use-theme";

interface DataStreamConfig {
  blockSize: number;
  color: string;
  baseColor: string;
  gridColor: string;
  scanColor: string;
  speed: number;
  streamCount: number;
}

interface CanvasDimensions {
  width: number;
  height: number;
}

interface DataStream {
  x: number;
  y: number;
  speed: number;
  length: number;
  streamWidth: number;
  opacity: number;
}

const createDataStream = (
  width: number,
  height: number,
  config: DataStreamConfig
): DataStream => {
  return {
    x:
      Math.floor(Math.random() * (width / config.blockSize)) * config.blockSize,
    y: Math.random() * height * -1,
    speed: Math.random() * 3 + 2,
    length: Math.random() * 20 + 5,
    streamWidth: Math.random() > 0.8 ? config.blockSize * 3 : config.blockSize,
    opacity: Math.random() * 0.5 + 0.2,
  };
};

const updateDataStream = (
  stream: DataStream,
  height: number,
  width: number,
  config: DataStreamConfig
): DataStream => {
  const newY = stream.y + stream.speed;

  if (newY > height + 100) {
    return createDataStream(width, height, config);
  }

  return { ...stream, y: newY };
};

const drawDataStream = (
  stream: DataStream,
  ctx: CanvasRenderingContext2D,
  config: DataStreamConfig
): void => {
  ctx.fillStyle = config.color;

  for (let i = 0; i < stream.length; i++) {
    const yPos = stream.y - i * config.blockSize;
    const fade = 1 - i / stream.length;
    const glitchX = Math.random() > 0.95 ? Math.random() * 10 - 5 : 0;

    ctx.globalAlpha = stream.opacity * fade;
    ctx.fillRect(
      stream.x + glitchX,
      yPos,
      stream.streamWidth - 1,
      config.blockSize - 1
    );
  }
  ctx.globalAlpha = 1.0;
};

interface DataStreamCanvasProps {
  config?: Partial<DataStreamConfig>;
  className?: string;
}

export function DataStreamCanvas({
  config: customConfig,
  className = "",
}: DataStreamCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamsRef = useRef<DataStream[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const dimensionsRef = useRef<CanvasDimensions>({ width: 0, height: 0 });
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme);

  const isDark = resolvedTheme === "dark";

  const config: DataStreamConfig = {
    blockSize: 10,
    color: isDark ? "#89b18a" : "#2d5a2e",
    baseColor: isDark ? "#000000" : "#f8faf8",
    gridColor: isDark ? "#111" : "#e0e8e0",
    scanColor: isDark ? "rgba(0, 220, 130, 0.1)" : "rgba(0, 180, 100, 0.15)",
    speed: 2,
    streamCount: 15,
    ...customConfig,
  };

  const initializeStreams = (width: number, height: number): void => {
    const calculatedStreams = Math.floor(width / 30);
    streamsRef.current = Array.from({ length: calculatedStreams }, () =>
      createDataStream(width, height, config)
    );
  };

  const resize = (): void => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.parentElement) return;

    const width = canvas.parentElement.offsetWidth;
    const height = canvas.parentElement.offsetHeight;

    canvas.width = width;
    canvas.height = height;

    dimensionsRef.current = { width, height };
    initializeStreams(width, height);
  };

  const animate = (): void => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = dimensionsRef.current;

    ctx.fillStyle = config.baseColor;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = config.gridColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x < width; x += 40) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    ctx.stroke();

    streamsRef.current = streamsRef.current.map((stream) => {
      const updated = updateDataStream(stream, height, width, config);
      drawDataStream(updated, ctx, config);
      return updated;
    });

    const time = Date.now() * 0.002;
    const scanY = (Math.sin(time) * 0.5 + 0.5) * height;
    ctx.fillStyle = config.scanColor;
    ctx.fillRect(0, scanY, width, 2);

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    resize();
    animate();

    const handleResize = (): void => resize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [resolvedTheme]);

  return <canvas ref={canvasRef} className={className} />;
}
