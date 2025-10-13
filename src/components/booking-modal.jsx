import React, { useState, useEffect } from "react";
import { format } from "date-fns";
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
//import { createCheckoutSession } from "@/stripe/stripe";
import { createCheckoutSession } from '../stripe/index';

export function BookingModal({ isOpen, onClose, service }) {
  const [step, setStep] = useState(1);
  const [selectedOption, setSelectedOption] = useState("");
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState("");
  const [guests, setGuests] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      setIsSubmitting(false);
    }
  }, [isOpen, service]);

  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00",
    "11:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30"
  ];

  const getFilteredTimeSlots = () => {
    const duration = guests * 30;
    const endOfDay = 15 * 60;
    return timeSlots.filter((slot) => {
      const [h, m] = slot.split(":").map(Number);
      const start = h * 60 + m;
      const end = start + duration;
      return end <= endOfDay;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

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
      // Send email notification instead of creating Stripe session
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/notify-booking-attempt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        throw new Error(`Failed to send booking notification: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Show success popup message
        alert(`✅ Booking Confirmed!\n\nThank you ${name}! Your booking request has been sent.\n\nService: ${service?.title}${selectedOption ? ` - ${selectedOption}` : ''}\nDate: ${format(date, "dd MMM yyyy")}\nTime: ${time}\n\nFor any questions, please call us at 0432 772 818.`);
        
        // Show success toast
        toast({
          title: "Booking confirmed!",
          description: "Your booking request has been sent successfully.",
        });

        // Close the modal
        onClose();
      } else {
        throw new Error(result.message || 'Failed to send booking notification');
      }
    } catch (error) {
      console.error("Booking error:", error);
      
      // Enhanced error handling with specific error messages
      let errorMessage = "An unexpected error occurred during booking. Please try again.";
      let alertMessage = errorMessage; // For the alert display
      
      // Check for specific error types and customize messages
      if (error.message) {
        const errorText = error.message.toLowerCase();
        
        if (errorText.includes('duplicate') || errorText.includes('already booked')) {
          errorMessage = "This appointment time is already booked. Please select a different time.";
          alertMessage = "❌ Booking Conflict\n\nThis appointment time is already booked. Please select a different time slot.";
        } else if (errorText.includes('payment') || errorText.includes('stripe')) {
          errorMessage = "Payment processing failed. Please check your connection and try again.";
          alertMessage = "💳 Payment Error\n\nPayment processing failed. Please check your connection and try again.";
        } else if (errorText.includes('network') || errorText.includes('fetch') || errorText.includes('connection')) {
          errorMessage = "Network error. Please check your internet connection and try again.";
          alertMessage = "🌐 Connection Error\n\nNetwork error. Please check your internet connection and try again.";
        } else if (errorText.includes('validation') || errorText.includes('invalid')) {
          errorMessage = "Please check that all required fields are filled correctly.";
          alertMessage = "📝 Validation Error\n\nPlease check that all required fields are filled correctly.";
        } else if (errorText.includes('server') || errorText.includes('500')) {
          errorMessage = "Server error. Please try again in a few minutes or contact us directly.";
          alertMessage = "🔧 Server Error\n\nServer error. Please try again in a few minutes or contact us directly.";
        } else if (errorText.includes('unauthorized') || errorText.includes('403')) {
          errorMessage = "Authorization error. Please refresh the page and try again.";
          alertMessage = "🔒 Authorization Error\n\nAuthorization error. Please refresh the page and try again.";
        } else {
          // Use the original error message if it's descriptive
          errorMessage = error.message;
          alertMessage = `⚠️ Booking Error\n\n${error.message}`;
        }
      }
      
      // Network-specific error handling
      if (error.name === 'NetworkError' || error.code === 'NETWORK_ERROR') {
        errorMessage = "Network connection failed. Please check your internet and try again.";
        alertMessage = "🌐 Network Error\n\nConnection failed. Please check your internet and try again.";
      }
      
      // HTTP status code handling
      if (error.status) {
        switch (error.status) {
          case 400:
            errorMessage = "Invalid booking data. Please check your information and try again.";
            alertMessage = "📝 Invalid Data\n\nPlease check your booking information and try again.";
            break;
          case 401:
            errorMessage = "Session expired. Please refresh the page and try again.";
            alertMessage = "🔒 Session Expired\n\nPlease refresh the page and try again.";
            break;
          case 409:
            errorMessage = "This appointment time is no longer available. Please select a different time.";
            alertMessage = "⏰ Time Conflict\n\nThis appointment time is no longer available. Please select a different time.";
            break;
          case 429:
            errorMessage = "Too many requests. Please wait a moment and try again.";
            alertMessage = "⏳ Rate Limited\n\nToo many requests. Please wait a moment and try again.";
            break;
          case 500:
            errorMessage = "Server error. Please try again later or contact us directly.";
            alertMessage = "🔧 Server Error\n\nServer error. Please try again later or contact us directly.";
            break;
        }
      }
      
      // Display error in alert
      alert(alertMessage);
      
      // Also show toast notification
      toast({
        title: "Booking failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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
                disabled={isSubmitting}
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
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="text-center">Select Time</Label>
              <div className="flex justify-center">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {filteredSlots.map((slot) => (
                    <Button
                      key={slot}
                      type="button"
                      variant={time === slot ? "default" : "outline"}
                      onClick={() => setTime(slot)}
                      className="text-sm"
                      disabled={isSubmitting}
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
                disabled={isSubmitting}
              />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-center"
                disabled={isSubmitting}
              />
              <Input
                type="tel"
                placeholder="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="text-center"
                disabled={isSubmitting}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Confirming Booking...
                </>
              ) : (
                "Confirm Booking"
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
