export const serviceCategories = {
  haircuts: {
    title: "Ladies Hair Services",
    services: [
      {
        title: "Dry Cut (no wash/blowdry)",
        price: "From $35",
        duration: 30,
        options: ["Short – $35", "Medium – $40", "Long – $45"]
      },
      {
        title: "Cut, Wash & Blow Wave",
        price: "From $60",
        duration: 60,
        options: ["Short – $60", "Medium – $70", "Long – $80"]
      },
      { 
        title: "Colour – Roots Touch-Up", 
        price: "From $70",
        duration: 90
      },
      { 
        title: "Full Colour", 
        price: "From $110",
        duration: 120
      }
    ]
  },
  foils: {
    title: "Foil Highlights",
    services: [
      {
        title: "Full Head Foils",
        price: "From $190",
        duration: 180,
        options: ["Short – $190", "Medium – $210", "Long – $240"]
      },
      {
        title: "½ Head Foils",
        price: "From $160",
        duration: 150,
        options: ["Short – $160", "Medium – $175", "Long – $190"]
      },
      {
        title: "¼ Head Foils",
        price: "From $130",
        duration: 120,
        options: ["Short – $130", "Medium – $145", "Long – $160"]
      }
    ]
  },
  waxing: {
    title: "Waxing Services",
    services: [
      { title: "Full Face", price: "$40", duration: 30 },
      { title: "Eyebrow Wax & Restyling", price: "$25", duration: 20 },
      { title: "Chin & Upper Lip", price: "$20", duration: 15 },
      { title: "Legs", price: "$40", duration: 45 },
      { title: "Hands", price: "$40", duration: 30 },
      { title: "Underarms", price: "$25", duration: 15 }
    ]
  },
  keratin: {
    title: "Keratin & Nanoplasty",
    services: [
      {
        title: "Keratin/Nanoplasty",
        price: "From $180",
        duration: 180,
        options: ["Short – $180", "Medium – $300", "Long – $420"]
      }
    ]
  },
  hairMakeup: {
    title: "Hair Up & Makeup",
    services: [
      {
        title: "Hair Up & Makeup Combo",
        price: "From $160",
        duration: 120,
        options: ["Short – $160", "Medium – $170", "Long – $180"]
      },
      { title: "Makeup Only", price: "$85", duration: 60 },
      { title: "Hair Up Only", price: "$85", duration: 60 }
    ]
  },
  grooming: {
    title: "Men's Grooming",
    services: [
      {
        title: "Men's Cut",
        price: "From $28",
        duration: 30,
        options: ["Basic Cut – $28", "Fade – $33", "Wash/Cut – $35"]
      },
      { title: "Beards", price: "$10", duration: 15 },
      { title: "Boys/Kids Cut", price: "$25", duration: 25 }
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
