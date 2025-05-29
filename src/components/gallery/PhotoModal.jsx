import React, { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const PhotoModal = ({ photo, onClose }) => {
  const handleKeyDown = useCallback((e) => {
    if (e.key === "Escape") {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    if (photo) {
      document.body.style.overflow = "hidden";
    }
    
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [photo, handleKeyDown]);

  return (
    <AnimatePresence>
      {photo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
            className="relative max-w-4xl w-full bg-white rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <img 
                src={photo.src} 
                alt={photo.alt} 
                className="w-full h-auto max-h-[80vh] object-contain"
              />
              <button
                onClick={onClose}
                className="absolute top-4 right-4 bg-white/80 p-2 rounded-full text-gray-800 hover:bg-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">{photo.alt}</h3>
                <span className={`text-xs font-medium py-1 px-2 rounded-full capitalize 
                  ${photo.category === "haircut" ? "bg-blue-500" : 
                    photo.category === "hairstyle" ? "bg-purple-500" : 
                    photo.category === "makeup" ? "bg-pink-500" : 
                    "bg-gray-500"} 
                  text-white`}
                >
                  {photo.category}
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PhotoModal;