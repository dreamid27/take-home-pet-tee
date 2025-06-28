import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, beforeEach, it, expect } from "vitest";
import { db } from "@/database/db";
import Index from "../index";
import { toast } from "sonner";
import "@testing-library/jest-dom/vitest";
import { useLiveQuery } from "dexie-react-hooks";

// Mock the database
vi.mock("@/database/db", () => ({
  db: {
    images: {
      toArray: vi.fn(),
      add: vi.fn(),
      clear: vi.fn(),
      reverse: vi.fn().mockReturnThis(),
    },
  },
}));

vi.mock("dexie-react-hooks", () => ({
  useLiveQuery: vi.fn(),
}));

// Mock the API call
vi.mock("../api/predictions", () => ({
  default: vi.fn(),
}));

// Mock the toast
vi.mock("sonner", () => ({
  toast: vi.fn(),
}));

describe("Index Page", () => {
  const mockImages = [
    {
      id: 1,
      url: "https://example.com/image1.jpg",
      prompt: "test prompt 1",
      kind: "cat",
      created_at: new Date().toISOString(),
    },
    {
      id: 2,
      url: "https://example.com/image2.jpg",
      prompt: "test prompt 2",
      kind: "dog",
      created_at: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // @ts-ignore
    useLiveQuery.mockReturnValue(mockImages);

    // @ts-ignore
    db.images.add.mockImplementation((image) => {
      return Promise.resolve({ ...image, id: Date.now() });
    });
  });

  it("renders empty state when no images exist", async () => {
    // @ts-ignore
    useLiveQuery.mockReturnValue([]);

    render(<Index />);

    expect(
      screen.getByText("Hi, Ready to generate pet tee ?")
    ).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("renders images when they exist", async () => {
    render(<Index />);

    // Wait for images to load
    await waitFor(() => {
      expect(screen.getByAltText(mockImages[0].prompt)).toBeInTheDocument();
      expect(screen.getByAltText(mockImages[1].prompt)).toBeInTheDocument();
    });
  });

  it("opens image preview when an image is clicked", async () => {
    render(<Index />);

    // Wait for images to load
    const firstImage = await screen.findByAltText(mockImages[0].prompt);
    fireEvent.click(firstImage);

    // Check if preview dialog is open
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Use Prompts")).toBeInTheDocument();
  });

  it("navigates between images in preview mode", async () => {
    render(<Index />);

    // Open preview for first image
    const firstImage = await screen.findByAltText(mockImages[0].prompt);
    fireEvent.click(firstImage);

    const previewImageDialog = await screen.findByRole("dialog");
    expect(previewImageDialog).toBeInTheDocument();

    // Click next button
    const nextButton = await screen.findByLabelText("Next image");
    fireEvent.click(nextButton);

    // Check if second image is displayed
    expect(
      await screen.findByAltText(`preview-${mockImages[1].prompt}`)
    ).toBeInTheDocument();

    // Click previous button
    const prevButton = await screen.findByLabelText("Previous image");
    fireEvent.click(prevButton);

    // Check if first image is displayed again
    expect(
      await screen.findByAltText(`preview-${mockImages[0].prompt}`)
    ).toBeInTheDocument();
  });

  it("handles image download", async () => {
    global.URL.createObjectURL = vi.fn();
    global.URL.revokeObjectURL = vi.fn();

    // Mock fetch
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      blob: () => Promise.resolve(new Blob()),
    });

    render(<Index />);

    // Open preview for first image
    const firstImage = await screen.findByAltText(mockImages[0].prompt);
    fireEvent.click(firstImage);

    // Click download button
    const downloadButton = screen.getByLabelText("Download image");
    fireEvent.click(downloadButton);

    // Check if download was initiated
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        mockImages[0].url,
        expect.any(Object)
      );
      expect(toast).toHaveBeenCalledWith(
        expect.stringContaining("Downloaded pet-tee-")
      );
    });
  });

  it("copies prompt to input fields", async () => {
    render(<Index />);

    // Open preview for first image
    const firstImage = await screen.findByAltText(mockImages[0].prompt);
    fireEvent.click(firstImage);

    // Click "Use Prompts" button
    const usePromptsButton = screen.getByText("Use Prompts");
    fireEvent.click(usePromptsButton);

    // Check if prompt and animal are set in the form
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    const select = screen.getByRole("combobox") as HTMLSelectElement;

    expect(textarea.value).toBe(mockImages[0].prompt);
    expect(select.textContent?.toLowerCase()).toContain(
      mockImages[0].kind.toLowerCase()
    );
  });

  it("resets all images when confirmed", async () => {
    // @ts-ignore
    db.images.clear.mockResolvedValueOnce(undefined);

    render(<Index />);

    // Click reset button
    const resetButton = screen.getByText("Reset Images");
    fireEvent.click(resetButton);

    // Click confirm button
    const confirmButton = screen.getByText("Delete All Images");
    fireEvent.click(confirmButton);

    // Check if clear was called
    await waitFor(() => {
      expect(db.images.clear).toHaveBeenCalled();
    });
  });

  it("handles API error during image generation", async () => {
    // Mock API error
    global.fetch = vi
      .fn()
      .mockRejectedValueOnce(new Error("something error when generate image"));

    render(<Index />);

    // Fill out the form
    const textarea = screen.getByRole("textbox");
    const select = screen.getByRole("combobox");
    const submitButton = screen.getByLabelText("submit-button");

    fireEvent.change(textarea, { target: { value: "test prompt" } });
    fireEvent.click(select);
    fireEvent.click(screen.getByText("Cat"));
    fireEvent.click(submitButton);

    // Check if error state is handled
    await waitFor(() => {
      expect(
        screen.getByText(/something error when generate image/i)
      ).toBeInTheDocument();
    });
  });
});
