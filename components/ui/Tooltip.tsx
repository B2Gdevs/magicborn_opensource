// components/ui/Tooltip.tsx
// Wrapper for react-tooltip v5

"use client";

import { ReactNode, useId } from "react";
import { Tooltip as ReactTooltip } from "react-tooltip";

interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: "top" | "bottom" | "left" | "right";
}

export function Tooltip({ content, children, position = "top" }: TooltipProps) {
  const id = useId().replace(/:/g, "-").replace(/\s/g, "-");

  return (
    <>
      <div 
        data-tooltip-id={id} 
        data-tooltip-content={content} 
        data-tooltip-place={position}
        className="inline-block"
      >
        {children}
      </div>
      <ReactTooltip
        id={id}
        place={position}
        className="!bg-void !border !border-border !text-text-primary !text-xs !rounded !px-2 !py-1 !shadow-lg"
        style={{
          zIndex: 9999,
          maxWidth: "300px",
        }}
        noArrow={false}
      />
    </>
  );
}
