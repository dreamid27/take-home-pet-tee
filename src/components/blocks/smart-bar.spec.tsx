import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { vi, describe, beforeEach, it, expect } from "vitest";
import SmartBar from "./smart-bar";
import "@testing-library/jest-dom/vitest";

describe("SmartBar", () => {
  const mockAnimals = [
    { label: "Cat", value: "cat" },
    { label: "Dog", value: "dog" },
  ];

  const defaultProps = {
    isLoading: false,
    values: {
      prompt: "",
      animal: "",
    },
    onChange: vi.fn(),
    onSubmit: vi.fn(),
    animals: mockAnimals,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with all required elements", () => {
    render(<SmartBar {...defaultProps} />);
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("applies custom className when provided", () => {
    const customClass = "custom-class";
    render(<SmartBar {...defaultProps} className={customClass} />);
    expect(screen.getByLabelText("wrapper-container")).toHaveClass(customClass);
  });

  it("updates selected animal value on change", () => {
    render(<SmartBar {...defaultProps} />);
    const select = screen.getByRole("combobox");
    fireEvent.click(select);
    const option = screen.getByText("Cat");
    fireEvent.click(option);
    expect(defaultProps.onChange).toHaveBeenCalledWith(
      expect.objectContaining({ animal: "cat" })
    );
  });

  it("disables select when loading", () => {
    render(<SmartBar {...defaultProps} isLoading={true} />);
    const select = screen.getByRole("combobox");
    expect(select).toHaveAttribute("disabled");
  });

  it("updates prompt value on change", () => {
    render(<SmartBar {...defaultProps} />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "test prompt" } });
    expect(defaultProps.onChange).toHaveBeenCalledWith(
      expect.objectContaining({ prompt: "test prompt" })
    );
  });

  it("disables textarea when loading", () => {
    render(<SmartBar {...defaultProps} isLoading={true} />);
    const textarea = screen.getByRole("textbox");
    expect(textarea).toBeDisabled();
  });

  it("submits form on Enter key press when not loading", () => {
    render(
      <SmartBar {...defaultProps} values={{ prompt: "test", animal: "cat" }} />
    );
    const textarea = screen.getByRole("textbox");
    fireEvent.keyDown(textarea, { key: "Enter", code: "Enter" });
    expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1);
  });

  it("does not submit form on Enter key press when loading", () => {
    render(
      <SmartBar
        {...defaultProps}
        isLoading={true}
        values={{ prompt: "test", animal: "cat" }}
      />
    );
    const textarea = screen.getByRole("textbox");
    fireEvent.keyDown(textarea, { key: "Enter", code: "Enter" });
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  it("renders with loading state", () => {
    render(<SmartBar {...defaultProps} isLoading={true} />);
    const button = screen.getByRole("button");
    expect(button).toContainHTML("animate-spin");
  });

  it("is disabled when loading", () => {
    render(<SmartBar {...defaultProps} isLoading={true} />);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("is disabled when prompt is empty", () => {
    render(
      <SmartBar
        {...defaultProps}
        values={{ ...defaultProps.values, animal: "cat" }}
      />
    );
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("is disabled when animal is not selected", () => {
    render(
      <SmartBar
        {...defaultProps}
        values={{ ...defaultProps.values, prompt: "test" }}
      />
    );
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("calls onSubmit when clicked", () => {
    render(
      <SmartBar {...defaultProps} values={{ prompt: "test", animal: "cat" }} />
    );
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1);
  });

  it("displays error message when error prop is provided", () => {
    const errorMessage = "An error occurred";
    render(<SmartBar {...defaultProps} error={errorMessage} />);
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toHaveClass("text-destructive");
  });

  it("does not display error message when error is not provided", () => {
    render(<SmartBar {...defaultProps} error={undefined} />);
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
  });

  it("handles empty animals array", () => {
    render(<SmartBar {...defaultProps} animals={[]} />);
    const select = screen.getByRole("combobox");
    fireEvent.click(select);
    expect(screen.queryByRole("option")).not.toBeInTheDocument();
  });
});
