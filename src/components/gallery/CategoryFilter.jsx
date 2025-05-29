import React from "react";
import { motion } from "framer-motion";

const CategoryFilter = ({ activeCategory, setActiveCategory, counts }) => {
  const categories = [
    { value: "all", label: "All" },
    { value: "hairstyle", label: "Hairstyles" },
    { value: "makeup", label: "Makeup" },
    { value: "other", label: "Other" }
  ];

  return (
    <div className="flex flex-wrap justify-center gap-2 mb-8">
      {categories.map((category) => (
        <button
          key={category.value}
          onClick={() => setActiveCategory(category.value)}
          className={`relative px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
            activeCategory === category.value
              ? "text-white"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          {activeCategory === category.value && (
            <motion.div
              layoutId="activePill"
              className="absolute inset-0 bg-primary rounded-full"
              initial={false}
              transition={{ type: "spring", duration: 0.6 }}
            />
          )}
          <span className="relative z-10">
            {category.label} ({counts[category.value]})
          </span>
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;