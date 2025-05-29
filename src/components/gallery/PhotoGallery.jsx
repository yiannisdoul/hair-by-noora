import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Masonry from "react-masonry-css";
import CategoryFilter from "./CategoryFilter";
import PhotoItem from "./PhotoItem";
import PhotoModal from "./PhotoModal";

const ITEMS_PER_PAGE = 6;

const PhotoGallery = ({ photos }) => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [visibleItems, setVisibleItems] = useState(ITEMS_PER_PAGE);
  const [randomizedPhotos, setRandomizedPhotos] = useState([]);
  const galleryRef = useRef(null);

  useEffect(() => {
    const shuffleArray = (array) => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    setRandomizedPhotos(shuffleArray(photos));
  }, [photos]);

  const categoryCounts = useMemo(() => {
    const counts = {
      all: photos.length,
      haircut: 0,
      hairstyle: 0,
      makeup: 0,
      other: 0
    };
    
    photos.forEach(photo => {
      counts[photo.category]++;
    });
    
    return counts;
  }, [photos]);

  const filteredPhotos = useMemo(() => {
    const sourcePhotos = activeCategory === "all" ? randomizedPhotos : photos;
    if (activeCategory === "all") {
      return sourcePhotos;
    }
    return sourcePhotos.filter(photo => photo.category === activeCategory);
  }, [randomizedPhotos, photos, activeCategory]);

  const currentPhotos = useMemo(() => {
    return filteredPhotos.slice(0, visibleItems);
  }, [filteredPhotos, visibleItems]);

  const handleLoadMore = () => {
    setVisibleItems(prev => prev + ITEMS_PER_PAGE);
  };

  const handleSeeLess = () => {
    setVisibleItems(ITEMS_PER_PAGE);
    const lastVisiblePhoto = galleryRef.current?.querySelector(`div[data-photo-index="${ITEMS_PER_PAGE - 1}"]`);
    if (lastVisiblePhoto) {
      lastVisiblePhoto.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const breakpointColumns = {
    default: 4,
    1280: 3,
    1024: 3,
    768: 2,
    640: 2,
    500: 1
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl font-bold mb-2 text-center">Our Work</h2>
        <p className="text-gray-600 mb-8 text-center max-w-xl mx-auto">
          Browse our extensive collection of haircuts, hairstyles, and makeup transformations
        </p>
        
        <CategoryFilter 
          activeCategory={activeCategory} 
          setActiveCategory={setActiveCategory}
          counts={categoryCounts}
        />
        
        <AnimatePresence mode="wait">
          <motion.div
            ref={galleryRef}
            key={activeCategory}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Masonry
              breakpointCols={breakpointColumns}
              className="flex w-auto -ml-4"
              columnClassName="pl-4 bg-clip-padding"
            >
              {currentPhotos.map((photo, index) => (
                <div key={photo.id} data-photo-index={index}>
                  <PhotoItem
                    photo={photo}
                    onClick={() => setSelectedPhoto(photo)}
                  />
                </div>
              ))}
            </Masonry>
          </motion.div>
        </AnimatePresence>
        
        {filteredPhotos.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500">No photos found in this category.</p>
          </div>
        ) : (
          <div className="text-center mt-8 space-x-4">
            {visibleItems < filteredPhotos.length && (
              <button
                onClick={handleLoadMore}
                className="bg-primary text-white px-6 py-2 rounded-full hover:bg-primary/90 transition-colors"
              >
                Load More
              </button>
            )}
            {visibleItems > ITEMS_PER_PAGE && (
              <button
                onClick={handleSeeLess}
                className="bg-gray-500 text-white px-6 py-2 rounded-full hover:bg-gray-600 transition-colors"
              >
                See Less
              </button>
            )}
          </div>
        )}
        
        <PhotoModal photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
      </motion.div>
    </div>
  );
};

export default PhotoGallery;