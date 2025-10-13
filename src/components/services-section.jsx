import React from "react"
import { motion } from "framer-motion"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  Scissors,
  Sparkles,
  Heart,
  Paintbrush,
  Wand2,
  User
} from "lucide-react"

const serviceCategories = {
  haircuts: {
    icon: Scissors,
    title: "Ladies Hair Services",
    services: [
      {
        title: "Dry Cut (no wash/blowdry)",
        price: "From $45.09", // Original: From $35
        options: ["Short – $45.09", "Medium – $50.69", "Long – $56.28"] // Original: ["Short – $35", "Medium – $40", "Long – $45"]
      },
      {
        title: "Cut, Wash & Blow Wave",
        price: "From $67.48", // Original: From $60
        options: ["Short – $67.48", "Medium – $78.68", "Long – $89.87"] // Original: ["Short – $60", "Medium – $70", "Long – $80"]
      },
      { 
        title: "Colour – Roots Touch-Up", 
        price: "$78.68" // Original: From $70
      },
      { 
        title: "Full Colour", 
        price: "From $134.66", // Original: From $110
        options: ["Short – $134.66", "Medium – $157.05", "Long – $179.44"] // Original: No options in this file
      }
    ]
  },
  foils: {
    icon: Sparkles,
    title: "Foil Highlights",
    services: [
      {
        title: "Full Head Foils",
        price: "From $213.03", // Original: From $190
        options: ["Short – $213.03", "Medium – $246.62", "Long – $280.20"] // Original: ["Short – $190", "Medium – $210", "Long – $240"]
      },
      {
        title: "½ Head Foils",
        price: "From $190.64", // Original: From $160
        options: ["Short – $190.64", "Medium – $224.22", "Long – $257.81"] // Original: ["Short – $160", "Medium – $175", "Long – $190"]
      },
      {
        title: "¼ Head Foils",
        price: "From $145.85", // Original: From $130
        options: ["Short – $145.85", "Medium – $162.65", "Long – $179.44"] // Original: ["Short – $130", "Medium – $145", "Long – $160"]
      }
    ]
  },
  waxing: {
    icon: Heart,
    title: "Waxing Services",
    services: [
      { title: "Full Face", price: "$45.09" }, // Original: $40
      { title: "Eyebrow Wax & Restyling", price: "$28.30" }, // Original: $25
      { title: "Chin & Upper Lip", price: "$22.70" }, // Original: $20
      { title: "Legs", price: "$45.09" }, // Original: $40
      { title: "Hands", price: "$45.09" }, // Original: $40
      { title: "Underarms", price: "$28.30" } // Original: $25
    ]
  },
  keratin: {
    icon: Paintbrush,
    title: "Keratin & Nanoplasty",
    services: [
      {
        title: "Keratin/Nanoplasty",
        price: "From $201.83", // Original: From $180
        options: ["Short – $201.83", "Medium – $336.18", "Long – $470.53"] // Original: ["Short – $180", "Medium – $300", "Long – $420"]
      }
    ]
  },
  hairMakeup: {
    icon: Wand2,
    title: "Hair Up & Makeup",
    services: [
      {
        title: "Hair Up & Makeup Combo",
        price: "From $190.64", // Original: From $160
        options: ["Short – $190.64", "Medium – $201.83", "Long – $213.03"] // Original: ["Short – $160", "Medium – $170", "Long – $180"]
      },
      { title: "Makeup Only", price: "$101.07" }, // Original: $85
      { title: "Hair Up Only", price: "$101.07" } // Original: $85
    ]
  },
  grooming: {
    icon: User,
    title: "Men's Grooming",
    services: [
      {
        title: "Men's Cut",
        price: "From $33.89", // Original: From $28
        options: ["Basic Cut – $33.89", "Fade – $39.49", "Wash/Cut – $45.09"] // Original: ["Basic Cut – $28", "Fade – $33", "Wash/Cut – $35"]
      },
      { title: "Beards", price: "$11.50" }, // Original: $10
      { title: "Boys/Kids Cut", price: "$28.30" } // Original: $25
    ]
  }
}

export function ServicesSection({ onServiceClick }) {
  return (
    <section className="px-4 py-16">
      <div className="container max-w-xl mx-auto">
        <motion.h2
          className="text-2xl font-bold mb-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Our Services
        </motion.h2>

        <Tabs defaultValue="haircuts" className="w-full">
          <TabsList className="w-full h-auto flex flex-wrap justify-center gap-2 bg-transparent">
            {Object.entries(serviceCategories).map(([key, category]) => (
              <TabsTrigger
                key={key}
                value={key}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <category.icon className="w-4 h-4 mr-2" />
                {category.title}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(serviceCategories).map(([key, category]) => (
            <TabsContent key={key} value={key} className="space-y-4">
              {category.services.map((service, index) => (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="service-card p-6 rounded-xl shadow-lg flex items-center justify-between cursor-pointer hover:shadow-xl transition-shadow"
                  onClick={() => onServiceClick({ ...service, category: category.title })}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 text-primary rounded-lg">
                      <category.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{service.title}</h3>
                      <p className="text-sm text-muted-foreground">{service.price}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    Book
                  </Button>
                </motion.div>
              ))}
            </TabsContent>
          ))}
        </Tabs>

        <p className="text-center text-xs text-muted-foreground mt-6 italic">
          ⚠️ Final price may vary based on hair length, thickness, and service complexity.
        </p>
      </div>
    </section>
  )
}