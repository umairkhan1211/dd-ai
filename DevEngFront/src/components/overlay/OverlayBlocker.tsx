import React, { useEffect } from "react";

type OverlayBlockerProps = {
  targetSelector: string;
};

export function OverlayBlocker({ targetSelector }: OverlayBlockerProps) {
  useEffect(() => {
    const overlay = document.getElementById("walkthrough-overlay");
    if (!overlay) return;

    // Block all clicks on overlay except the target and its children
    const onClick = (e: MouseEvent) => {
      const targetEl = document.querySelector(targetSelector);
      if (!targetEl) return;

      if (
        e.target instanceof Node &&
        !targetEl.contains(e.target) &&
        e.target !== targetEl
      ) {
        e.stopPropagation();
        e.preventDefault();
      }
    };

    overlay.addEventListener("click", onClick, true);
    return () => {
      overlay.removeEventListener("click", onClick, true);
    };
  }, [targetSelector]);

  return (
    <div
      id="walkthrough-overlay"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.5)",
        pointerEvents: "auto",
        zIndex: 9999,
      }}
    />
  );
}
