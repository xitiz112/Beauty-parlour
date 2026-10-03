"use client";

import { useId, useRef, useState, type ReactNode } from "react";

type SlideDownProps = {
  className: string;
  triggerClassName?: string;
  trigger: ReactNode | { open: ReactNode; closed: ReactNode };
  duration?: number;
  children: ReactNode;
};

export function SlideDown({ className, triggerClassName, trigger, duration = 420, children }: SlideDownProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<Animation | null>(null);

  function toggle() {
    const panel = panelRef.current;
    if (!panel) return;

    const nextOpen = !open;
    const fromHeight = panel.getBoundingClientRect().height;
    const toHeight = nextOpen ? panel.scrollHeight : 0;
    const fromOpacity = Number(getComputedStyle(panel).opacity);
    const toOpacity = nextOpen ? 1 : 0;

    animationRef.current?.cancel();
    panel.style.visibility = "visible";
    panel.style.height = `${toHeight}px`;
    panel.style.opacity = String(toOpacity);
    setOpen(nextOpen);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      panel.style.height = nextOpen ? "auto" : "0px";
      panel.style.opacity = String(toOpacity);
      panel.style.visibility = nextOpen ? "visible" : "hidden";
      return;
    }

    animationRef.current = panel.animate(
      [
        { height: `${fromHeight}px`, opacity: fromOpacity },
        { height: `${toHeight}px`, opacity: toOpacity },
      ],
      { duration, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "both" },
    );
    animationRef.current.onfinish = () => {
      panel.style.visibility = nextOpen ? "visible" : "hidden";
      animationRef.current?.cancel();
      animationRef.current = null;
    };
  }

  return (
    <div className={`${className}${open ? " is-open" : ""}`}>
      <button
        className={triggerClassName}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={toggle}
      >
        {typeof trigger === "object" && trigger !== null && "open" in trigger
          ? open ? trigger.open : trigger.closed
          : trigger}
      </button>
      <div
        className="slide-down-panel"
        id={panelId}
        ref={panelRef}
        aria-hidden={!open}
        inert={!open}
      >
        <div className="slide-down-inner">{children}</div>
      </div>
    </div>
  );
}
