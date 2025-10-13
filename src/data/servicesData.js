export const serviceCategories = {
  haircuts: {
    title: "Ladies Hair Services",
    services: [
      {
        title: "Dry Cut (no wash/blowdry)",
        price: "From $45.09",
        duration: 30,
        options: ["Short – $45.09", "Medium – $50.69", "Long – $56.28"]
      },
      {
        title: "Cut, Wash & Blow Wave",
        price: "From $67.48",
        duration: 60,
        options: ["Short – $67.48", "Medium – $78.68", "Long – $89.87"]
      },
      { 
        title: "Colour – Roots Touch-Up", 
        price: "$78.68",
        duration: 90
      },
      { 
        title: "Full Colour", 
        price: "From $134.66",
        duration: 120,
        options: ["Short – $134.66", "Medium – $157.05", "Long – $179.44"]
      }
    ]
  },
  foils: {
    title: "Foil Highlights",
    services: [
      {
        title: "Full Head Foils",
        price: "From $213.03",
        duration: 180,
        options: ["Short – $213.03", "Medium – $246.62", "Long – $280.20"]
      },
      {
        title: "½ Head Foils",
        price: "From $190.64",
        duration: 150,
        options: ["Short – $190.64", "Medium – $224.22", "Long – $257.81"]
      },
      {
        title: "¼ Head Foils",
        price: "From $145.85",
        duration: 120,
        options: ["Short – $145.85", "Medium – $162.65", "Long – $179.44"]
      }
    ]
  },
  waxing: {
    title: "Waxing Services",
    services: [
      { title: "Full Face", price: "$45.09", duration: 30 },
      { title: "Eyebrow Wax & Restyling", price: "$28.30", duration: 20 },
      { title: "Chin & Upper Lip", price: "$22.70", duration: 15 },
      { title: "Legs", price: "$45.09", duration: 45 },
      { title: "Hands", price: "$45.09", duration: 30 },
      { title: "Underarms", price: "$28.30", duration: 15 }
    ]
  },
  keratin: {
    title: "Keratin & Nanoplasty",
    services: [
      {
        title: "Keratin/Nanoplasty",
        price: "From $201.83",
        duration: 180,
        options: ["Short – $201.83", "Medium – $336.18", "Long – $470.53"]
      }
    ]
  },
  hairMakeup: {
    title: "Hair Up & Makeup",
    services: [
      {
        title: "Hair Up & Makeup Combo",
        price: "From $190.64",
        duration: 120,
        options: ["Short – $190.64", "Medium – $201.83", "Long – $213.03"]
      },
      { title: "Makeup Only", price: "$101.07", duration: 60 },
      { title: "Hair Up Only", price: "$101.07", duration: 60 }
    ]
  },
  grooming: {
    title: "Men's Grooming",
    services: [
      {
        title: "Men's Cut",
        price: "From $33.89",
        duration: 30,
        options: ["Basic Cut – $33.89", "Fade – $39.49", "Wash/Cut – $45.09"]
      },
      { title: "Beards", price: "$11.50", duration: 15 },
      { title: "Boys/Kids Cut", price: "$28.30", duration: 25 }
    ]
  }
};

// Flatten all services for easy use in forms
export const allServices = Object.values(serviceCategories).reduce((acc, category) => {
  return acc.concat(category.services.map(service => ({
    ...service,
    category: category.title
  })));
}, []);