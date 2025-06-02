import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { initFirebase } from './init.js';

export async function createBooking(bookingData, env) {
  try {
    const db = initFirebase(env);
    const bookingsRef = collection(db, 'bookings');

    const duration = bookingData.durationMinutes || 30;
    const sameDayBookingsQuery = query(
      bookingsRef,
      where('date', '==', bookingData.date)
    );
    const snapshot = await getDocs(sameDayBookingsQuery);

    const [newStartH, newStartM] = bookingData.time.split(':').map(Number);
    const newStart = newStartH * 60 + newStartM;
    const newEnd = newStart + duration;

    for (let doc of snapshot.docs) {
      const existing = doc.data();
      const [existH, existM] = existing.time.split(':').map(Number);
      const existStart = existH * 60 + existM;
      const existEnd = existStart + (existing.durationMinutes || 30);

      const overlap =
        Math.max(newStart, existStart) < Math.min(newEnd, existEnd);

      if (overlap) {
        console.warn('Overlap with existing booking:', existing);
        return { success: false, message: 'Time slot already booked' };
      }
    }

    const bookingToSave = {
      ...bookingData,
      durationMinutes: duration,
    };

    await addDoc(bookingsRef, bookingToSave);

    return { success: true };
  } catch (error) {
    console.error('Error creating booking:', error);
    return { success: false, message: 'Something went wrong' };
  }
}