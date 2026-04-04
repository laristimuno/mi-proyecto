import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationBadge, getLabel } from "../ToolInvocationBadge";

afterEach(() => {
  cleanup();
});

// --- getLabel unit tests ---

test("getLabel: str_replace_editor create with path", () => {
  expect(getLabel("str_replace_editor", { command: "create", path: "src/components/App.tsx" })).toBe("Creating App.tsx");
});

test("getLabel: str_replace_editor str_replace with path", () => {
  expect(getLabel("str_replace_editor", { command: "str_replace", path: "src/Card.tsx" })).toBe("Editing Card.tsx");
});

test("getLabel: str_replace_editor insert with path", () => {
  expect(getLabel("str_replace_editor", { command: "insert", path: "src/index.tsx" })).toBe("Editing index.tsx");
});

test("getLabel: str_replace_editor view with path", () => {
  expect(getLabel("str_replace_editor", { command: "view", path: "src/App.tsx" })).toBe("Reading App.tsx");
});

test("getLabel: str_replace_editor undo_edit with path", () => {
  expect(getLabel("str_replace_editor", { command: "undo_edit", path: "src/App.tsx" })).toBe("Undoing edit in App.tsx");
});

test("getLabel: file_manager delete with path", () => {
  expect(getLabel("file_manager", { command: "delete", path: "src/Button.tsx" })).toBe("Deleting Button.tsx");
});

test("getLabel: file_manager rename with path", () => {
  expect(getLabel("file_manager", { command: "rename", path: "src/OldName.tsx" })).toBe("Renaming OldName.tsx");
});

test("getLabel: unknown tool falls back to tool name", () => {
  expect(getLabel("some_other_tool", { command: "run" })).toBe("some_other_tool");
});

test("getLabel: missing path omits filename", () => {
  expect(getLabel("str_replace_editor", { command: "create" })).toBe("Creating");
});

test("getLabel: empty path omits filename", () => {
  expect(getLabel("str_replace_editor", { command: "str_replace", path: "" })).toBe("Editing");
});

// --- ToolInvocationBadge render tests ---

test("shows spinner when state is call", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{ toolName: "str_replace_editor", args: { command: "create", path: "App.tsx" }, state: "call" }}
    />
  );
  expect(screen.getByText("Creating App.tsx")).toBeDefined();
  // Spinner is present (no green dot)
  expect(document.querySelector(".bg-emerald-500")).toBeNull();
  expect(document.querySelector(".animate-spin")).toBeDefined();
});

test("shows spinner when state is partial-call", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{ toolName: "str_replace_editor", args: { command: "str_replace", path: "Card.tsx" }, state: "partial-call" }}
    />
  );
  expect(document.querySelector(".animate-spin")).toBeDefined();
  expect(document.querySelector(".bg-emerald-500")).toBeNull();
});

test("shows green dot when state is result with result", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{ toolName: "str_replace_editor", args: { command: "create", path: "App.tsx" }, state: "result", result: "Success" }}
    />
  );
  expect(screen.getByText("Creating App.tsx")).toBeDefined();
  expect(document.querySelector(".bg-emerald-500")).toBeDefined();
  expect(document.querySelector(".animate-spin")).toBeNull();
});

test("shows spinner when state is result but result is missing", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{ toolName: "str_replace_editor", args: { command: "create", path: "App.tsx" }, state: "result" }}
    />
  );
  expect(document.querySelector(".animate-spin")).toBeDefined();
  expect(document.querySelector(".bg-emerald-500")).toBeNull();
});

test("renders file_manager delete label", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{ toolName: "file_manager", args: { command: "delete", path: "src/Button.tsx" }, state: "result", result: "ok" }}
    />
  );
  expect(screen.getByText("Deleting Button.tsx")).toBeDefined();
});

test("renders unknown tool name as fallback", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{ toolName: "unknown_tool", args: {}, state: "call" }}
    />
  );
  expect(screen.getByText("unknown_tool")).toBeDefined();
});
