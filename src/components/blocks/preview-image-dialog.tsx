import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight, Download, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { type Image } from "@/database/db";

const PreviewImageDialog = ({
  open,
  onOpenChange,
  selectedImage,
  onPrevious,
  onNext,
  onDownload,
  onCopyPrompt,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedImage?: Image;
  onPrevious?: () => void;
  onNext?: () => void;
  onDownload?: () => void;
  onCopyPrompt?: () => void;
}) => {
  const [direction, setDirection] = useState(0);
  const [currentImage, setCurrentImage] = useState(selectedImage);

  // Update the displayed image with animation
  useEffect(() => {
    if (selectedImage !== currentImage) {
      setCurrentImage(selectedImage);
    }
  }, [selectedImage]);

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDownload?.();
  };
  const handleCopyPrompt = () => onCopyPrompt?.();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-4xl max-h-[90vh] p-0 bg-transparent border-none overflow-visible"
      >
        <div className="relative overflow-hidden bg-background">
          {/* Navigation Arrows */}
          {onPrevious && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/50 hover:bg-black/70 text-white z-10"
              onClick={(e) => {
                e.stopPropagation();
                setDirection(-1);
                onPrevious();
              }}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          )}

          {onNext && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/50 hover:bg-black/70 text-white z-10"
              onClick={(e) => {
                e.stopPropagation();
                setDirection(1);
                onNext();
              }}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          )}

          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 text-white z-10"
            onClick={(e) => {
              e.stopPropagation();
              onOpenChange(false);
            }}
          >
            <X className="h-5 w-5" />
          </Button>

          {/* Image with sliding animation */}
          <div className="flex items-center justify-center max-h-[70vh] overflow-hidden relative">
            <AnimatePresence custom={direction} mode="wait">
              {currentImage && (
                <motion.img
                  key={currentImage.id}
                  src={currentImage.url}
                  alt={currentImage.prompt}
                  animate={{
                    opacity: 1,
                  }}
                  initial={{
                    opacity: 0,
                  }}
                  exit={{
                    opacity: 0,
                  }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="max-h-full max-w-full object-contain"
                />
              )}
            </AnimatePresence>
          </div>

          {/* Action Buttons */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 px-4">
            <Button
              onClick={handleCopyPrompt}
              className="h-12 px-6 rounded-full bg-black/80 hover:bg-black text-white font-medium flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              Use Prompts
            </Button>
            <a
              href={selectedImage?.url}
              download={`pet-tee-${Date.now()}.webp`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleDownload}
              className="h-12 w-12 rounded-xl bg-white/90 hover:bg-white text-foreground flex items-center justify-center"
            >
              <Download className="h-5 w-5" />
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PreviewImageDialog;
