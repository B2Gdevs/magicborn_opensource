// components/ui/SidebarNav.tsx
// Reusable sidebar navigation component for forms and dialogs

"use client";

import { ReactNode, useState } from "react";
import { ChevronDown, ChevronRight, type LucideIcon } from "lucide-react";

export interface SidebarNavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  onClick?: () => void;
  badge?: ReactNode;
}

export interface SidebarNavGroup {
  id: string;
  label: string;
  items: SidebarNavItem[];
  defaultExpanded?: boolean;
  collapsible?: boolean;
}

export interface SidebarNavProps {
  items: (SidebarNavItem | SidebarNavGroup)[];
  activeId: string;
  onItemClick: (id: string) => void;
  width?: "sm" | "md" | "lg" | "xs";
  showBorder?: boolean;
  showBackground?: boolean;
  sticky?: boolean;
  size?: "sm" | "md";
  className?: string;
  renderExtra?: (activeId: string) => ReactNode;
  activeClassName?: string; // Custom class for active items (overrides default)
  inactiveClassName?: string; // Custom class for inactive items (overrides default)
}

const widthClasses = {
  xs: "w-28",
  sm: "w-36",
  md: "w-64",
  lg: "w-72",
};

const sizeClasses = {
  sm: {
    text: "text-xs",
    icon: "w-3.5 h-3.5",
    padding: "px-2.5 py-2",
    gap: "gap-2",
  },
  md: {
    text: "text-sm font-medium",
    icon: "w-4 h-4",
    padding: "px-3 py-2",
    gap: "gap-3",
  },
};

export function SidebarNav({
  items,
  activeId,
  onItemClick,
  width = "md",
  showBorder = false,
  showBackground = false,
  sticky = true,
  size = "md",
  className = "",
  renderExtra,
  activeClassName,
  inactiveClassName,
}: SidebarNavProps) {
  const sizeConfig = sizeClasses[size];
  const widthClass = widthClasses[width];

  // Helper to check if an item is a group
  const isGroup = (item: SidebarNavItem | SidebarNavGroup): item is SidebarNavGroup => {
    return "items" in item;
  };

  // Manage expanded state for collapsible groups
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    const groups = items.filter(isGroup);
    return new Set(
      groups
        .filter((g) => g.defaultExpanded !== false && g.collapsible !== false)
        .map((g) => g.id)
    );
  });

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev: Set<string>) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  const renderItem = (item: SidebarNavItem, isNested = false) => {
    const isActive = activeId === item.id;
    const Icon = item.icon;

    // Use custom classes if provided, otherwise use defaults
    const activeClass = activeClassName || "bg-deep text-ember-glow";
    const inactiveClass = inactiveClassName || "text-text-muted hover:text-text-primary hover:bg-deep/50";

    return (
      <button
        key={item.id}
        onClick={() => {
          item.onClick?.();
          onItemClick(item.id);
        }}
        className={`w-full flex items-center ${sizeConfig.gap} ${sizeConfig.padding} rounded-lg transition-colors ${
          isActive ? activeClass : inactiveClass
        } ${isNested ? "pl-6" : ""}`}
      >
        <Icon className={sizeConfig.icon} />
        <span className={sizeConfig.text}>{item.label}</span>
        {item.badge && <span className="ml-auto">{item.badge}</span>}
      </button>
    );
  };

  const renderGroup = (group: SidebarNavGroup) => {
    const isExpanded = expandedGroups.has(group.id);
    const hasItems = group.items && group.items.length > 0;
    const isCollapsible = group.collapsible !== false;

    if (!isCollapsible) {
      return (
        <div key={group.id} className="space-y-1">
          {hasItems && group.items.map((item) => renderItem(item))}
        </div>
      );
    }

    return (
      <div key={group.id} className="mt-4 pt-4 border-t border-border">
        <button
          onClick={() => toggleGroup(group.id)}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-deep/50 transition-colors"
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
          <span className="text-xs font-semibold uppercase tracking-wide">{group.label}</span>
        </button>
        {isExpanded && hasItems && (
          <div className="mt-1 space-y-1">
            {group.items.map((item) => renderItem(item, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      className={`${widthClass} flex-shrink-0 ${showBorder ? "border-r border-border" : ""} ${
        showBackground ? "bg-shadow" : ""
      } ${className}`}
    >
      <nav className={`p-4 space-y-1 ${sticky ? "sticky top-0" : ""}`}>
        {items.map((item) => {
          if (isGroup(item)) {
            return renderGroup(item);
          } else {
            return renderItem(item);
          }
        })}
        {renderExtra && renderExtra(activeId)}
      </nav>
    </aside>
  );
}

