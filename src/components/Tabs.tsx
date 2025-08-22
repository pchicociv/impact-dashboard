import React from "react";

export function Tabs(props: {
  tabs: { id: string; title: string; content: React.ReactNode }[];
  activeId: string;
  onChange: (id: string) => void;
}) {
  return (
    <>
      <div className="tabbar" role="tablist" aria-label="Dashboard Sections">
        {props.tabs.map(t => (
          <button
            key={t.id}
            role="tab"
            aria-selected={props.activeId === t.id}
            className="tab"
            onClick={() => props.onChange(t.id)}
          >
            {t.title}
          </button>
        ))}
      </div>
      <div role="tabpanel" aria-labelledby={props.activeId}>
        {props.tabs.find(t => t.id === props.activeId)?.content}
      </div>
    </>
  );
}
