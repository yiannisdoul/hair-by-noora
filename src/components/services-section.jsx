
import React from "react"
import { motion } from "framer-motion"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { 
  Scissors, 
  Paintbrush,
  Wand2,
  Sparkles,
  Palette,
  Heart,
  Baby,
  Users
} from "lucide-react"

const serviceCategories = {
  haircuts: {
    icon: Scissors,
    title: "Haircuts",
    services: [
      { title: "Ladies dry trim no wash & dry off", price: "$45" },
      { title: "Ladies wash trim & dry off", price: "$60" },
      { title: "Ladies wash trim & blow wave", price: "$67" },
      { title: "Ladies wash restyle & blow wave", price: "$77" },
      { title: "Fringe trim", price: "$10" },
      { title: "Men's trim no wash", price: "$25" },
      { title: "Men's wash trim & style", price: "$30" },
      { title: "Men's beard cut", price: "$10" }
    ]
  },
  blowWave: {
    icon: Wand2,
    title: "Blow Wave & Styling",
    services: [
      { title: "Short blow wave", price: "$35" },
      { title: "Medium blow wave", price: "$45" },
      { title: "Long blow wave", price: "$55" },
      { title: "Extra blow wave", price: "$59" },
      { title: "Extra Curlies GHT", price: "$10" },
      { title: "Wash & dry off only", price: "$20" }
    ]
  },
  colouring: {
    icon: Palette,
    title: "Colouring",
    services: [
      { title: "Hairline colour", price: "$45" },
      { title: "Roots only", price: "$60" },
      { title: "Root stretch", price: "$85" },
      { title: "Root + colour gloss through ends/short", price: "$125" },
      { title: "Root + colour gloss through ends/med", price: "$130" },
      { title: "Root + colour gloss through ends/long", price: "$135" }
    ]
  },
  foils: {
    icon: Sparkles,
    title: "Foils & Balayage",
    services: [
      { title: "1/4 head foils", price: "$70" },
      { title: "1/2 head foils", price: "$100" },
      { title: "3/4 head foils", price: "$115" },
      { title: "Full head of foils", price: "$140" },
      { title: "1/4 head balayage", price: "$80" },
      { title: "1/2 head balayage", price: "$110" },
      { title: "3/4 head balayage", price: "$135" },
      { title: "Full head of balayage", price: "$160" },
      { title: "Ombre with extra colour", price: "$200" }
    ]
  },
  treatments: {
    icon: Paintbrush,
    title: "Lightening & Treatments",
    services: [
      { title: "Tip cap", price: "$100" },
      { title: "Scalp lighten", price: "$120" },
      { title: "Bond protective treatment/one shot", price: "$25" },
      { title: "Moisturising treatments", price: "$15" },
      { title: "Keratin treatment", price: "From $120" }
    ]
  },
  waxing: {
    icon: Heart,
    title: "Waxing",
    services: [
      { title: "Arms + legs waxing", price: "$40-$80" },
      { title: "Facial waxing", price: "$40" },
      { title: "Under arm waxing", price: "$20" }
    ]
  },
  kids: {
    icon: Baby,
    title: "Kids & Student Cuts",
    services: [
      { title: "Kids Cuts 0-6", price: "$15-$20" },
      { title: "Kids Cuts 7-15", price: "$17-$22" },
      { title: "Professional blow wave", price: "$12" },
      { title: "Student ladies cuts", price: "$35-$60" },
      { title: "Student men's cuts", price: "$20-$25" }
    ]
  },
  seniors: {
    icon: Users,
    title: "Senior Cuts",
    services: [
      { title: "Senior ladies trim, no wash & dry off", price: "$25-30" },
      { title: "Senior ladies wash, trim & dry off", price: "$40" },
      { title: "Senior ladies wash, trim & blow wave", price: "$45" },
      { title: "Senior men's wash & trim", price: "$20" },
      { title: "Senior men's buzz cut", price: "$15" }
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
                    Book Now
                  </Button>
                </motion.div>
              ))}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  )
}
