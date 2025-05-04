
import React, { useState } from "react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

export function BookingModal({ isOpen, onClose, service }) {
  const [date, setDate] = useState(new Date())
  const [time, setTime] = useState("")
  const [guests, setGuests] = useState(1)
  const { toast } = useToast()

  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00",
    "11:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30"
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    toast({
      title: "Booking Confirmed!",
      description: `Your appointment for ${service?.title} has been scheduled for ${format(date, "PPP")} at ${time}.`,
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book Appointment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Selected Service</Label>
            <Input 
              value={service?.title} 
              disabled 
              className="bg-muted"
            />
          </div>
          <div className="grid gap-2">
            <Label>Number of Guests</Label>
            <Input
              type="number"
              min="1"
              max="3"
              value={guests}
              onChange={(e) => setGuests(parseInt(e.target.value))}
            />
          </div>
          <div className="grid gap-2">
            <Label>Select Date</Label>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </div>
          <div className="grid gap-2">
            <Label>Select Time</Label>
            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map((slot) => (
                <Button
                  key={slot}
                  type="button"
                  variant={time === slot ? "default" : "outline"}
                  onClick={() => setTime(slot)}
                  className="text-sm"
                >
                  {slot}
                </Button>
              ))}
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Contact Information</Label>
            <Input placeholder="Full Name" required />
            <Input type="email" placeholder="Email" required />
            <Input type="tel" placeholder="Phone" required />
          </div>
          <Button type="submit" className="w-full">
            Confirm Booking
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
