import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { helpContent, type HelpKey } from "../data/metricHelp";

type HelpTarget = { key: HelpKey } | null;
type HelpCtx = { open: (key: HelpKey) => void; close: () => void; target: HelpTarget };

const HelpContext = createContext<HelpCtx | null>(null);

export function HelpDrawerProvider({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<HelpTarget>(null);
  const open = (key: HelpKey) => setTarget({ key });
  const close = () => setTarget(null);
  return (
    <HelpContext.Provider value={{ open, close, target }}>
      {children}
      <HelpDrawer />
    </HelpContext.Provider>
  );
}

export function useHelpDrawer() {
  const ctx = useContext(HelpContext);
  if (!ctx) throw new Error("useHelpDrawer must be used within HelpDrawerProvider");
  return ctx;
}

function HelpDrawer() {
  const { target, close } = useHelpDrawer();
  const isOpen = !!target;
  const info = target ? helpContent[target.key] : null;

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  return (
    <>
      {isOpen && <div className="drawer-backdrop" onClick={close} aria-hidden="true" />}
      <aside className="drawer" role="dialog" aria-modal="true" aria-label={info?.title ?? "Help"} data-open={isOpen || undefined}>
        <header className="drawer-head">
          <h3 className="drawer-title">{info?.title ?? "Help"}</h3>
          <button className="icon-btn" aria-label="Close help" onClick={close}>✕</button>
        </header>
        <div className="drawer-body">
          {info ? (
            <>
              <section><h4>What it is</h4><p>{info.what}</p></section>
              <section><h4>Why it matters</h4><p>{info.why}</p></section>
              <section><h4>How to read this chart</h4><p>{info.how}</p></section>
            </>
          ) : <p className="caption">No details available.</p>}
        </div>
      </aside>
    </>
  );
}
