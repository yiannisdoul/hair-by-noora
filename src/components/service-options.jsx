import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export default function ServiceOptionsModal({ isOpen, onClose, service, onSelectOption }) {
  const [selectedOption, setSelectedOption] = useState("")

  const handleContinue = () => {
    if (!selectedOption) return
    onSelectOption({ ...service, selectedOption })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-sm bg-white shadow-xl rounded-md p-6 space-y-4 mx-auto relative"
        style={{ width: "33%", minWidth: "300px", backgroundColor: "rgba(255, 255, 255, 0.97)" }}
      >
        <DialogHeader>
          <DialogTitle className="text-center">Choose Length/Type</DialogTitle>
          <DialogDescription className="text-center">
            Please select your specific option for this service.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col space-y-2">
          {service?.options?.map((option) => (
            <Button
              key={option}
              variant={selectedOption === option ? "default" : "outline"}
              onClick={() => setSelectedOption(option)}
              className="w-full justify-center"
            >
              {option}
            </Button>
          ))}
        </div>

        <Button
          className="w-full bg-primary text-white mt-4 disabled:opacity-50"
          disabled={!selectedOption}
          onClick={handleContinue}
        >
          Continue
        </Button>
      </DialogContent>
    </Dialog>
  )
}
