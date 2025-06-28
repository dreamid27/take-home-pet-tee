import { Textarea } from "../ui/textarea";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ArrowUp } from "lucide-react";

const SmartBar = ({
  isLoading,
  values,
  onChange,
  onSubmit,
  animals,
  className,
  error,
}: {
  isLoading: boolean;
  values: {
    prompt: string;
    animal: string;
  };
  onChange: (values: { prompt: string; animal: string }) => void;
  onSubmit: () => void;
  animals: {
    label: string;
    value: string;
  }[];
  className?: string;
  error?: string | null;
}) => {
  return (
    <div
      className={cn(
        "glass-effect w-full max-w-full md:max-w-3xl p-4 shadow-2xl border-[2px] rounded-4xl bg-background/40",
        className
      )}
      aria-label="wrapper-container"
    >
      <div className="flex gap-2 flex-col w-full">
        <Select
          disabled={isLoading}
          onValueChange={(value) => onChange({ ...values, animal: value })}
          value={values.animal}
        >
          <SelectTrigger className="w-[180px] bg-background/30 border-none disabled:opacity-70 data-[placeholder]:text-muted-foreground data-[placeholder]:opacity-60 dark:data-[placeholder]:text-white dark:data-[placeholder]:opacity-70">
            <SelectValue placeholder="Animal Type" />
          </SelectTrigger>
          <SelectContent>
            {animals.map((d) => (
              <SelectItem key={d.value} value={d.value}>
                {d.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2 max-h-20 overflow-auto">
          <Textarea
            rows={1}
            cols={50}
            disabled={isLoading}
            value={values.prompt}
            onChange={(e) => onChange({ ...values, prompt: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isLoading) {
                e.preventDefault();
                onSubmit();
              }
            }}
            placeholder="Type your message here..."
            className="flex-1 placeholder:opacity-60 dark:placeholder:text-white dark:placeholder:opacity-70  focus-visible:ring-0 bg-background/30 focus-visible:ring-offset-0 border-0 resize-none disabled:opacity-70"
          />
        </div>
        <div className="flex justify-between gap-2">
          <div>
            {error && <p className="text-xs text-destructive px-2">{error}</p>}
          </div>
          <div className="flex flex-col gap-1">
            <Button
              type="button"
              size="icon"
              onClick={onSubmit}
              disabled={isLoading || !values.prompt || !values.animal}
              className="relative"
              variant={"default"}
              aria-label="submit-button"
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-background border-t-primary"></div>
              ) : (
                <ArrowUp />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartBar;
