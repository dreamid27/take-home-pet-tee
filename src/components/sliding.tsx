import { useState } from "react";
import { motion } from "framer-motion";
import type { Image } from "@/database/db";

const getIndex = (index: number, total: number) => (index + total) % total;

const ImageSlider = ({
  images,
  selectedImage,
}: {
  images: Image[];
  selectedImage?: Image;
}) => {
  const [index, setIndex] = useState(0);
  const total = images.length;
  const [direction, setDirection] = useState(0);

  const handleNext = () => {
    setDirection(-1);
    setIndex((prev) => getIndex(prev + 1, total));
  };

  const handlePrev = () => {
    setDirection(1);
    setIndex((prev) => getIndex(prev - 1, total));
  };

  return (
    <div className="relative w-full max-w-xl mx-auto overflow-hidden h-64 rounded-lg">
      <motion.div
        className="flex w-full h-full"
        initial={{ x: `0%` }}
        animate={{ x: `${index * 100 * -1}%` }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        {images.map((image) => (
          <img
            key={image.id}
            src={image?.url || ""}
            alt={`Slide ${image.id}`}
            className="w-full flex-shrink-0 object-cover h-64"
          />
        ))}
      </motion.div>

      {/* Controls */}
      <div className="absolute top-1/2 left-0 right-0 flex justify-between px-4 -translate-y-1/2">
        <button
          onClick={handlePrev}
          className="bg-black/50 text-white px-4 py-2 rounded"
        >
          Prev
        </button>
        <button
          onClick={handleNext}
          className="bg-black/50 text-white px-4 py-2 rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ImageSlider;
