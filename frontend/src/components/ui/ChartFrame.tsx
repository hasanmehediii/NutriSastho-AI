"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

type ChartSize = {
  width: number;
  height: number;
};

type ChartFrameProps = {
  children: (size: ChartSize) => ReactNode;
  className?: string;
};

export function ChartFrame({ children, className = "" }: ChartFrameProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState<ChartSize | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const updateSize = () => {
      const rect = element.getBoundingClientRect();
      const width = Math.floor(rect.width);
      const height = Math.floor(rect.height);

      if (width > 0 && height > 0) {
        setSize((current) =>
          current?.width === width && current.height === height
            ? current
            : { width, height },
        );
      }
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {size ? children(size) : null}
    </div>
  );
}
