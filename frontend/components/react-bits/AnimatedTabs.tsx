"use client";

import React from "react";

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

interface AnimatedTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
  size?: "sm" | "md";
}

export default function AnimatedTabs({
  tabs,
  activeTab,
  onChange,
  className = "",
  size = "md",
}: AnimatedTabsProps) {
  const paddingClass = size === "sm" ? "p-0.5" : "p-1";
  const itemPadding = size === "sm" ? "px-2.5 py-1 text-xs" : "px-3.5 py-1.5 text-xs sm:text-sm";

  return (
    <div
      className={`inline-flex items-center rounded-xl border border-slate-800/90 bg-slate-950/80 backdrop-blur-md ${paddingClass} ${className}`}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`relative flex items-center gap-1.5 rounded-lg font-medium transition-all duration-200 cursor-pointer ${itemPadding} ${
              isActive
                ? "bg-slate-800 text-white shadow-sm border border-slate-700/60 font-semibold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
            }`}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-mono font-bold ${
                  isActive ? "bg-slate-700 text-slate-100" : "bg-slate-800/80 text-slate-400"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
