import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { db, type Image } from "@/database/db";
import { useLiveQuery } from "dexie-react-hooks";
import PreviewImageDialog from "@/components/blocks/preview-image-dialog";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import SmartBar from "@/components/blocks/smart-bar";
import { toast } from "sonner";
import { ImageCard, ImageCardLoading } from "@/components/blocks/image-card";

const animalTypes = [
  {
    label: "Cat",
    value: "cat",
  },
  {
    label: "Dog",
    value: "dog",
  },
  {
    label: "Gorilla",
    value: "gorilla",
  },
];

export default function Index() {
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [state, setState] = useState({
    isLoading: false,
    imageUrl: null as string | null,
    error: null as string | null,
    prompt: "",
    animal: "",
    selectedImage: null as Image | null,
    selectedIndex: null as number | null,
    galleryImages: [] as Image[],
  });

  const images = useLiveQuery(() => db.images.reverse().toArray()) || [];

  const generateImage = async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch("/api/predictions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Prefer: "wait",
          Authorization: `Bearer ${import.meta.env.VITE_REPLICATE_API_TOKEN}`,
        },
        body: JSON.stringify({
          version:
            "bytedance/hyper-flux-8step:81946b1e09b256c543b35f37333a30d0d02ee2cd8c4f77cd915873a1ca622bad",
          input: {
            prompt: `a ${state.animal} smiling and looking directly at the camera, wearing a white t-shirt with the word "${state.prompt}" printed on it.`,
            num_outputs: 1,
            aspect_ratio: "1:1",
            output_format: "webp",
            guidance_scale: 3.5,
            output_quality: 80,
            num_inference_steps: 8,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.detail ||
          `API request failed with status ${response.status}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (data.output && data.output.length > 0) {
        await db.images.add({
          prompt: state.prompt,
          url: data.output[0],
          kind: state.animal,
          created_at: new Date().toISOString(),
        });
      } else {
        throw new Error("No image URL returned from API");
      }
    } catch (err) {
      console.error("Error generating image:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to generate image";
      setState((prev) => ({
        ...prev,
        error: errorMessage,
      }));
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleGenerateImage = async () => {
    generateImage();
  };

  const galleryImages = (index: number) => {
    return images;
  };

  const handlePreviewImage = (open: boolean, index?: number) => {
    if (!open) {
      setState((prev) => ({
        ...prev,
        selectedImage: null,
        selectedIndex: null,
      }));
    } else {
      setState((prev) => ({
        ...prev,
        galleryImages: galleryImages(index),
        selectedImage: images[index],
        selectedIndex: index,
      }));
    }
  };

  const handleImageNext = () => {
    if (state.selectedIndex !== null) {
      setState((prev) => ({
        ...prev,
        selectedImage: images[state.selectedIndex + 1],
        selectedIndex: state.selectedIndex + 1,
      }));
    }
  };

  const handleImagePrevious = () => {
    if (state.selectedIndex !== null) {
      setState((prev) => ({
        ...prev,
        selectedImage: images[state.selectedIndex - 1],
        selectedIndex: state.selectedIndex - 1,
      }));
    }
  };

  const handleDownload = async () => {
    if (!state.selectedImage) return;

    try {
      // Fetch the image as a blob
      const response = await fetch(state.selectedImage.url, {
        mode: "cors",
        credentials: "omit",
        cache: "no-cache",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      // Create a temporary anchor element
      const link = document.createElement("a");
      link.href = blobUrl;
      const name = `pet-tee-${Date.now()}.webp`;
      link.download = name;
      document.body.appendChild(link);

      // Trigger the download
      link.click();
      toast(`Downloaded ${name}`);
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      }, 100);
    } catch (error) {
      console.error("Download failed:", error);
      toast("Download failed");
    }
  };

  const handleCopyPrompt = () => {
    setState((prev) => ({
      ...prev,
      prompt: state.selectedImage?.prompt,
      animal: state.selectedImage?.kind,
      selectedImage: null,
    }));
  };

  if (images.length <= 0 && !state.isLoading) {
    return (
      <div className="w-full h-full min-h-screen bg-sidebar">
        <div className="container h-screen mx-auto px-4 flex items-center justify-center flex-col gap-8 bg-sidebar">
          <h2 className="text-2xl font-medium">
            Hi, Ready to generate pet tee ?
          </h2>
          <SmartBar
            isLoading={state.isLoading}
            values={{ prompt: state.prompt, animal: state.animal }}
            onChange={(values) => setState((prev) => ({ ...prev, ...values }))}
            onSubmit={handleGenerateImage}
            animals={animalTypes}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-screen bg-sidebar">
      <div className="container mx-auto p-4 pb-[200px]">
        <PreviewImageDialog
          selectedImage={state.selectedImage}
          open={!!state.selectedImage}
          onOpenChange={handlePreviewImage}
          onNext={handleImageNext}
          onPrevious={handleImagePrevious}
          onDownload={handleDownload}
          onCopyPrompt={handleCopyPrompt}
        />
        <div className="h-[48px] flex items-center justify-between">
          <h2 className="text-md font-medium">Pet Tee Generator</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsResetDialogOpen(true)}
            >
              Reset Images
            </Button>
            <AlertDialog
              open={isResetDialogOpen}
              onOpenChange={setIsResetDialogOpen}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all images from the database.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={async () => {
                      await db.images.clear();
                      setIsResetDialogOpen(false);
                    }}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete All Images
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <ModeToggle />
          </div>
        </div>

        <div className="w-full py-8">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-1">
            {state.isLoading && (
              <ImageCardLoading isLoading={state.isLoading} />
            )}
            {images.map((image, index) => (
              <ImageCard
                key={image.id}
                image={image}
                onClick={() => handlePreviewImage(true, index)}
              />
            ))}
          </div>
        </div>
        <div className="pointer-events-none bottom-11 fixed left-1/2 -translate-x-1/2 right-0 w-full px-3 flex justify-center items-center">
          <SmartBar
            className="pointer-events-auto"
            isLoading={state.isLoading}
            values={{ prompt: state.prompt, animal: state.animal }}
            onChange={(values) =>
              setState((prev) => ({ ...prev, ...values, error: null }))
            }
            onSubmit={handleGenerateImage}
            animals={animalTypes}
            error={state.error}
          />
        </div>
      </div>
    </div>
  );
}
