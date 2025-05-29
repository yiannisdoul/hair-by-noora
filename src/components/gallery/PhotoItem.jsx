import React from "react";
import { motion } from "framer-motion";

const PhotoItem = ({ photo, onClick }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-4 relative group cursor-pointer"
      onClick={onClick}
    >
      <div className="overflow-hidden rounded-lg">
        <img
          src={photo.src}
          alt={photo.alt}
          className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
      </div>
      <div className="absolute top-3 left-3">
        <span className={`text-xs font-medium py-1 px-2 rounded-full capitalize 
          ${photo.category === "haircut" ? "bg-blue-500/80" : 
            photo.category === "hairstyle" ? "bg-purple-500/80" : 
            photo.category === "makeup" ? "bg-pink-500/80" : 
            "bg-gray-500/80"} 
          text-white`}
        >
          {photo.category}
        </span>
      </div>
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-lg">
        <span className="text-white font-medium">View</span>
      </div>
    </motion.div>
  );
};

export default PhotoItem;