import { describe, test, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MainContent } from "../main-content";

// Mock providers and heavy child components
vi.mock("@/lib/contexts/file-system-context", () => ({
  FileSystemProvider: ({ children }: any) => <>{children}</>,
  useFileSystem: vi.fn(),
}));

vi.mock("@/lib/contexts/chat-context", () => ({
  ChatProvider: ({ children }: any) => <>{children}</>,
  useChat: vi.fn(),
}));

vi.mock("@/components/chat/ChatInterface", () => ({
  ChatInterface: () => <div data-testid="chat-interface" />,
}));

vi.mock("@/components/editor/FileTree", () => ({
  FileTree: () => <div data-testid="file-tree" />,
}));

vi.mock("@/components/editor/CodeEditor", () => ({
  CodeEditor: () => <div data-testid="code-editor" />,
}));

vi.mock("@/components/preview/PreviewFrame", () => ({
  PreviewFrame: () => <div data-testid="preview-frame" />,
}));

vi.mock("@/components/HeaderActions", () => ({
  HeaderActions: () => <div data-testid="header-actions" />,
}));

vi.mock("@/components/ui/resizable", () => ({
  ResizablePanelGroup: ({ children }: any) => <div>{children}</div>,
  ResizablePanel: ({ children }: any) => <div>{children}</div>,
  ResizableHandle: () => <div />,
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("MainContent toggle buttons", () => {
  test("shows preview view by default", () => {
    render(<MainContent />);

    expect(screen.getByTestId("preview-frame")).toBeInTheDocument();
    expect(screen.queryByTestId("code-editor")).not.toBeInTheDocument();
  });

  test("switches to code view when Code tab is clicked", () => {
    render(<MainContent />);

    const codeTab = screen.getByRole("tab", { name: /code/i });
    fireEvent.click(codeTab);

    expect(screen.getByTestId("code-editor")).toBeInTheDocument();
    expect(screen.queryByTestId("preview-frame")).not.toBeInTheDocument();
  });

  test("switches back to preview when Preview tab is clicked after Code", () => {
    render(<MainContent />);

    const codeTab = screen.getByRole("tab", { name: /code/i });
    fireEvent.click(codeTab);

    expect(screen.getByTestId("code-editor")).toBeInTheDocument();

    const previewTab = screen.getByRole("tab", { name: /preview/i });
    fireEvent.click(previewTab);

    expect(screen.getByTestId("preview-frame")).toBeInTheDocument();
    expect(screen.queryByTestId("code-editor")).not.toBeInTheDocument();
  });

  test("Preview tab is marked active by default", () => {
    render(<MainContent />);

    const previewTab = screen.getByRole("tab", { name: /preview/i });
    expect(previewTab).toHaveAttribute("data-state", "active");

    const codeTab = screen.getByRole("tab", { name: /code/i });
    expect(codeTab).toHaveAttribute("data-state", "inactive");
  });

  test("Code tab becomes active after clicking it", () => {
    render(<MainContent />);

    const codeTab = screen.getByRole("tab", { name: /code/i });
    fireEvent.click(codeTab);

    expect(codeTab).toHaveAttribute("data-state", "active");

    const previewTab = screen.getByRole("tab", { name: /preview/i });
    expect(previewTab).toHaveAttribute("data-state", "inactive");
  });
});
