"use client";

import { Loader2 } from "lucide-react";

interface ToolInvocation {
  toolName: string;
  args: Record<string, unknown>;
  state: "partial-call" | "call" | "result";
  result?: unknown;
}

interface ToolInvocationBadgeProps {
  toolInvocation: ToolInvocation;
}

export function getLabel(toolName: string, args: Record<string, unknown>): string {
  const file =
    typeof args.path === "string" && args.path
      ? args.path.split("/").pop()!
      : "";
  const suffix = file ? ` ${file}` : "";

  if (toolName === "str_replace_editor") {
    switch (args.command) {
      case "create":     return `Creating${suffix}`;
      case "str_replace":
      case "insert":     return `Editing${suffix}`;
      case "view":       return `Reading${suffix}`;
      case "undo_edit":  return `Undoing edit in${suffix}`;
    }
  }

  if (toolName === "file_manager") {
    switch (args.command) {
      case "delete": return `Deleting${suffix}`;
      case "rename": return `Renaming${suffix}`;
    }
  }

  return toolName;
}

export function ToolInvocationBadge({ toolInvocation }: ToolInvocationBadgeProps) {
  const { toolName, args, state, result } = toolInvocation;
  const isDone = state === "result" && Boolean(result);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isDone ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">{getLabel(toolName, args)}</span>
    </div>
  );
}
