import React from "react";

type Tab = { id: string; title: string; content: React.ReactNode };

export function Tabs({
  tabs,
  activeId,
  onChange
}: {
  tabs: Tab[];
  activeId: string;
  onChange: (id: string) => void;
}) {
  return (
    <>
      <div className="tabbar" role="tablist" aria-label="Dashboard Sections">
        {tabs.map(t => {
          const tabId = `tab-${t.id}`;
          const panelId = `panel-${t.id}`;
          const isActive = activeId === t.id;
          return (
            <button
              key={t.id}
              id={tabId}
              role="tab"
              aria-selected={isActive}
              aria-controls={panelId}
              className="tab"
              onClick={() => onChange(t.id)}
            >
              {t.title}
            </button>
          );
        })}
      </div>

      {tabs.map(t => {
        const tabId = `tab-${t.id}`;
        const panelId = `panel-${t.id}`;
        const isActive = activeId === t.id;
        return (
          <div
            key={t.id}
            id={panelId}
            role="tabpanel"
            aria-labelledby={tabId}
            hidden={!isActive}
          >
            {isActive && t.content}
          </div>
        );
      })}
    </>
  );
}
