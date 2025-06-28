import { useState, useEffect } from "react";
import { Skeleton } from "../ui/skeleton";
import { Copy } from "lucide-react";
import { Tooltip, TooltipContent } from "../ui/tooltip";
import { TooltipTrigger } from "@radix-ui/react-tooltip";
import { toast } from "sonner";
import { format } from "date-fns";

const ImageCardLoading = ({ isLoading }: { isLoading: boolean }) => {
  const [loadingTime, setLoadingTime] = useState(0);

  useEffect(() => {
    let animationFrame: number;

    if (isLoading) {
      const start = Date.now();

      const updateTimer = () => {
        const elapsed = (Date.now() - start) / 1000; // Convert to seconds
        setLoadingTime(Number(elapsed.toFixed(1))); // Keep one decimal place
        animationFrame = requestAnimationFrame(updateTimer);
      };

      animationFrame = requestAnimationFrame(updateTimer);

      return () => {
        if (animationFrame) cancelAnimationFrame(animationFrame);
      };
    }

    return () => {};
  }, [isLoading]);

  return (
    <div className="aspect-square bg-muted overflow-hidden relative">
      {isLoading && (
        <>
          <Skeleton className="absolute inset-0 w-full h-full" />
          <div className="absolute bottom-2 right-2 bg-foreground/20 text-xs px-2 py-1 rounded">
            {loadingTime}s
          </div>
        </>
      )}
    </div>
  );
};

const ImageCard = ({
  image,
  onClick,
}: {
  image: { id: number; url: string; prompt: string; created_at: string };
  onClick: (open: boolean) => void;
}) => {
  const [isLoading, setIsLoading] = useState(true);

  const handleCopy = () => {
    navigator.clipboard.writeText(image.prompt);
    toast("Copied to clipboard");
  };

  return (
    <div className="aspect-square bg-muted  overflow-hidden relative">
      {isLoading && <Skeleton className="absolute inset-0 w-full h-full" />}
      <img
        src={image.url}
        alt={image.prompt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
        onClick={() => onClick(true)}
        onLoad={() => setIsLoading(false)}
        onError={() => setIsLoading(false)}
      />
      <div className="absolute text-white top-2 left-2 bg-foreground/20 text-xs px-2 py-1 rounded flex items-center gap-1 cursor-pointer hover:bg-foreground/30 transition-colors">
        <span>created: {format(image.created_at, "yyyy-MM-dd")}</span>
      </div>
      <div className="absolute bottom-2 right-2 text-white bg-foreground/20 text-xs px-2 py-1 rounded flex items-center gap-1 cursor-pointer hover:bg-foreground/30 transition-colors">
        <span>prompt: {image.prompt}</span>
        <Tooltip>
          <TooltipTrigger>
            {" "}
            <Copy onClick={handleCopy} className="w-3 h-3 hidden md:block" />
          </TooltipTrigger>
          <TooltipContent>Copy Prompt</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};

export { ImageCard, ImageCardLoading };
