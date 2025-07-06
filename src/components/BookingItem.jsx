import React from 'react';

const BookingItem = ({ booking }) => {
  return (
    <div className={`p-4 rounded-lg shadow-sm border-l-4 ${
      booking.manual 
        ? 'bg-blue-50 border-blue-500' 
        : 'bg-green-50 border-green-500'
    }`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="font-medium text-gray-900">{booking.name}</div>
          <div className="text-sm text-gray-600 mt-1">
            {booking.service} {booking.option && `- ${booking.option}`}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            📅 {booking.date} at {booking.time}
          </div>
          <div className="text-sm text-gray-500">
            ⏱️ {booking.durationMinutes} minutes
          </div>
          <div className="text-sm text-gray-500">
            📧 {booking.email} | 📞 {booking.phone}
          </div>
          {booking.guests > 1 && (
            <div className="text-sm text-gray-500">
              👥 {booking.guests} guests
            </div>
          )}
          {booking.notes && (
            <div className="text-xs text-gray-600 mt-2 p-2 bg-gray-100 rounded">
              <strong>Notes:</strong> {booking.notes}
            </div>
          )}
          {booking.calendarEventId && (
            <div className="text-xs text-green-600 mt-1 flex items-center">
              📅 <span className="ml-1">Synced to Google Calendar</span>
            </div>
          )}
        </div>
        
        <div className="flex flex-col items-end gap-2">
          {booking.manual ? (
            <div className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded font-medium">
              Manual Booking
            </div>
          ) : (
            <div className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded font-medium">
              Paid Online
            </div>
          )}
          
          <div className="text-xs text-gray-500">
            {booking.manual ? 'No payment' : `$${(booking.amount / 100).toFixed(2)}`}
          </div>
          
          <div className="text-xs text-gray-400">
            Created: {new Date(booking.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingItem;
