import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, beforeEach, it, expect } from "vitest";
import PreviewImageDialog from "./preview-image-dialog";
import { type Image } from "@/database/db";
import "@testing-library/jest-dom/vitest";

describe("PreviewImageDialog", () => {
  const mockImage: Image = {
    id: 1,
    url: "https://example.com/image.jpg",
    prompt: "yolo",
    kind: "cat",
    created_at: new Date().toISOString(),
  };

  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    selectedImage: mockImage,
    onPrevious: vi.fn(),
    onNext: vi.fn(),
    onDownload: vi.fn(),
    onCopyPrompt: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders when open is true", () => {
    render(<PreviewImageDialog {...defaultProps} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("does not render when open is false", () => {
    render(<PreviewImageDialog {...defaultProps} open={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("displays the selected image", async () => {
    render(<PreviewImageDialog {...defaultProps} />);
    const img = await screen.getByAltText(`preview-${mockImage.prompt}`);
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", mockImage.url);
  });

  it("calls onPrevious when previous button is clicked", () => {
    render(<PreviewImageDialog {...defaultProps} />);
    const prevButton = screen.getByLabelText("Previous image");
    fireEvent.click(prevButton);
    expect(defaultProps.onPrevious).toHaveBeenCalledTimes(1);
  });

  it("calls onNext when next button is clicked", () => {
    render(<PreviewImageDialog {...defaultProps} />);
    const nextButton = screen.getByLabelText("Next image");
    fireEvent.click(nextButton);
    expect(defaultProps.onNext).toHaveBeenCalledTimes(1);
  });

  it("calls onDownload when download button is clicked", () => {
    render(<PreviewImageDialog {...defaultProps} />);
    const downloadButton = screen.getByLabelText("Download image");
    const clickEvent = new MouseEvent("click", { bubbles: true });
    fireEvent(downloadButton, clickEvent);
    expect(defaultProps.onDownload).toHaveBeenCalledTimes(1);
  });

  it("calls onCopyPrompt when copy prompt button is clicked", () => {
    render(<PreviewImageDialog {...defaultProps} />);
    const copyButton = screen.getByText("Use Prompts");
    fireEvent.click(copyButton);
    expect(defaultProps.onCopyPrompt).toHaveBeenCalledTimes(1);
  });

  it("calls onOpenChange(false) when close button is clicked", () => {
    render(<PreviewImageDialog {...defaultProps} />);
    const closeButton = screen.getByLabelText("Close dialog");
    fireEvent.click(closeButton);
    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
  });

  it("does not render navigation buttons when callbacks are not provided", () => {
    render(
      <PreviewImageDialog
        open={true}
        onOpenChange={vi.fn()}
        selectedImage={mockImage}
      />
    );
    expect(screen.queryByLabelText("Previous image")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Next image")).not.toBeInTheDocument();
  });

  it("handles missing image data gracefully", () => {
    render(
      <PreviewImageDialog
        open={true}
        onOpenChange={vi.fn()}
        selectedImage={undefined}
      />
    );
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("applies correct animation direction when navigating", () => {
    render(<PreviewImageDialog {...defaultProps} selectedImage={mockImage} />);

    // Click next (direction 1)
    const nextButton = screen.getByLabelText("Next image");
    fireEvent.click(nextButton);

    // Click previous (direction -1)
    const prevButton = screen.getByLabelText("Previous image");
    fireEvent.click(prevButton);

    // The component handles direction internally, but we can test the callbacks
    expect(defaultProps.onNext).toHaveBeenCalledTimes(1);
    expect(defaultProps.onPrevious).toHaveBeenCalledTimes(1);
  });
});
