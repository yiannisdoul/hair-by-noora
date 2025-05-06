import { collection, addDoc, getDocs, query, where } from "firebase/firestore"
import { db } from "./init.js"

export async function createBooking(bookingData) {
  try {
    const bookingsRef = collection(db, "bookings")
    const sameDayBookingsQuery = query(bookingsRef, where("date", "==", bookingData.date))
    const snapshot = await getDocs(sameDayBookingsQuery)

    const [newStartH, newStartM] = bookingData.time.split(":").map(Number)
    const newStart = newStartH * 60 + newStartM
    const newEnd = newStart + bookingData.durationMinutes

    // Check for overlap
    for (let doc of snapshot.docs) {
      const existing = doc.data()
      const [existH, existM] = existing.time.split(":").map(Number)
      const existStart = existH * 60 + existM
      const existEnd = existStart + (existing.durationMinutes || 30) // default to 30 mins if missing

      const overlap = Math.max(newStart, existStart) < Math.min(newEnd, existEnd)
      if (overlap) {
        return { success: false, message: "Time slot already booked" }
      }
    }

    // No overlap – save booking
    await addDoc(bookingsRef, bookingData)
    return { success: true }
  } catch (error) {
    console.error("Error creating booking:", error)
    return { success: false, message: "Something went wrong" }
  }
}
