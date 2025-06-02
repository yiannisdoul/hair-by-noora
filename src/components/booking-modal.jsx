import React, { useState, useEffect } from "react";
import { format, isToday } from "date-fns";
import { Calendar } from "./ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import { createCheckoutSession } from "@/stripe/stripe";

export function BookingModal({ isOpen, onClose, service }) {
  const [step, setStep] = useState(1);
  const [selectedOption, setSelectedOption] = useState("");
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState("");
  const [guests, setGuests] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      if (!service?.options || service.options.length === 0) {
        setStep(2);
      } else {
        setStep(1);
      }
    } else {
      setStep(1);
      setSelectedOption("");
      setDate(new Date());
      setTime("");
      setGuests(1);
      setName("");
      setEmail("");
      setPhone("");
    }
  }, [isOpen, service]);

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    const onlyDigits = value.replace(/[^\d]/g, "");
    setPhone(onlyDigits.slice(0, 10));
  };

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00",
  "11:30", "13:00", "13:30", "14:00", "14:30"
];


  const getFilteredTimeSlots = () => {
    const duration = guests * 30;
    const now = new Date();
    return timeSlots.map((slot) => {
      const [h, m] = slot.split(":").map(Number);
      const slotDate = new Date(date);
      slotDate.setHours(h, m, 0, 0);

      const start = h * 60 + m;
      const end = start + duration;
      const endOfDay = 15 * 60;

      const isPast = isToday(date) && slotDate < now;
      const isOutOfBounds = end > endOfDay;

      return {
        time: slot,
        disabled: isPast || isOutOfBounds,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (phone.length !== 10 || !phone.startsWith("0")) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid Australian mobile number starting with 0",
        variant: "destructive",
      });
      return;
    }

    if (!time) {
      toast({
        title: "Select a time",
        description: "Please select a time before continuing.",
        variant: "destructive",
      });
      return;
    }

    const bookingData = {
      name,
      email,
      phone,
      service: service?.title || "",
      option: selectedOption || "",
      date: format(date, "dd-MM-yyyy"),
      time,
      guests,
      durationMinutes: guests * 30,
      price: service?.price || 50,
    };

    try {
      await createCheckoutSession(bookingData);
      toast({
        title: "Redirecting to payment...",
        description: "Please complete your booking by making the deposit payment.",
      });
    } catch (error) {
      console.error("Booking error:", error);
      toast({
        title: "Booking failed",
        description: "Please try again later or contact us directly.",
        variant: "destructive",
      });
    }
  };

  const filteredSlots = getFilteredTimeSlots();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`${
          step === 1 ? "max-w-[300px] h-[40vh]" : "max-w-[420px] h-[90vh]"
        } p-4 pt-3 space-y-3 overflow-y-auto flex flex-col items-center text-center`}
      >
        <DialogHeader className="space-y-1 text-center">
          <DialogTitle className="text-lg font-semibold leading-tight">
            {step === 1 ? "Choose Length/Type" : "Book an Appointment"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {step === 1
              ? "Select an option for this service."
              : "Enter your details to confirm booking."}
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <div className="grid gap-2 py-4 w-full">
            {service?.options?.map((option) => (
              <Button
                key={option}
                variant={selectedOption === option ? "default" : "outline"}
                onClick={() => setSelectedOption(option)}
                className="w-full"
              >
                {option}
              </Button>
            ))}
            <Button
              onClick={() => setStep(2)}
              disabled={!selectedOption}
              className="mt-4 w-full"
            >
              Continue
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-4 py-4 w-full">
            <div className="grid gap-2">
              <Label className="text-center">Selected Service</Label>
              <Input
                value={
                  selectedOption
                    ? `${service?.title} – ${selectedOption}`
                    : service?.title
                }
                disabled
                className="bg-muted text-center"
              />
            </div>

            <div className="grid gap-2">
              <Label className="text-center">Booking For</Label>
              <select
                value={guests}
                onChange={(e) => setGuests(parseInt(e.target.value))}
                className="text-center border rounded-md p-2 w-36 mx-auto"
              >
                <option value={1}>Myself</option>
                <option value={2}>2 People</option>
                <option value={3}>3 People</option>
              </select>
            </div>

            <div className="grid gap-2">
              <Label className="text-center">Select Date</Label>
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border"
                  disabled={(d) => d < new Date().setHours(0, 0, 0, 0)}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="text-center">Select Time</Label>
              <div className="flex justify-center">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {filteredSlots.map(({ time: slot, disabled }) => (
                    <Button
                      key={slot}
                      type="button"
                      variant={time === slot && !disabled ? "default" : "outline"}
                      onClick={() => !disabled && setTime(slot)}
                      disabled={disabled}
                      className={`text-sm ${disabled ? "line-through opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {slot}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="text-center">Contact Information</Label>
              <Input
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="text-center"
              />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-center"
              />
              <Input
                type="tel"
                placeholder="Phone Number e.g. 0412345678"
                value={phone}
                onChange={handlePhoneChange}
                required
                className="text-center"
                pattern="0\d{9}"
                title="Please enter a valid Australian mobile number starting with 0"
              />
            </div>

            <Button type="submit" className="w-full mt-6" disabled={!time}>
              Confirm & Pay Deposit
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
