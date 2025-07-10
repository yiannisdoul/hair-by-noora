import { createBooking } from '../firebase/bookings.js';
import { GoogleCalendarService } from '../services/google-calendar.js';

export async function handleManualBooking({ request, env }) {
  try {
    // CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };
  
  // Handle OPTIONS (preflight) requests
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

    const bookingData = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'phone', 'service', 'date', 'time'];
    for (const field of requiredFields) {
      if (!bookingData[field]) {
        return new Response(
          JSON.stringify({ error: `Missing required field: ${field}` }),
          { 
            status: 400,
            headers: { 
              ...corsHeaders,  // Add the CORS headers here
              'Content-Type': 'application/json' 
            }
          }
        );
      }
    }

    // Create manual booking object
    const booking = {
      name: bookingData.name,
      email: bookingData.email,
      phone: bookingData.phone,
      service: bookingData.service,
      option: bookingData.option || '',
      date: bookingData.date,
      time: bookingData.time,
      guests: parseInt(bookingData.guests || '1'),
      durationMinutes: parseInt(bookingData.durationMinutes || '30'),
      notes: bookingData.notes || '',
      createdAt: new Date().toISOString(),
      status: 'confirmed',
      manual: true, // Flag for manual bookings
      paymentIntentId: null,
      amount: 0
    };

    console.log('Creating manual booking:', booking);

    // Save to Firestore
    const result = await createBooking(booking, env);
    
    if (!result.success) {
      console.error('Failed to create manual booking:', result.message);
      return new Response(
        JSON.stringify({ error: result.message }),
        { 
          status: 500,
          headers: { 
            ...corsHeaders,  // Add the CORS headers here
            'Content-Type': 'application/json' 
          }
        }
      );
    }

    console.log('Manual booking created successfully:', result.id);

    // Add to Google Calendar
    console.log('📅 Creating Google Calendar event for manual booking');
    const calendarService = new GoogleCalendarService(env);
    const bookingWithId = { ...booking, id: result.id };
    const calendarResult = await calendarService.createCalendarEvent(bookingWithId);
    
    if (calendarResult.success) {
      console.log('✅ Calendar event created successfully:', calendarResult.eventId);

    } else {
      console.error('❌ Failed to create calendar event:', calendarResult.error);
    }

    // Optionally send confirmation email for manual bookings
    if (bookingData.sendEmail) {
      try {
        const { sendBookingEmail } = await import('./stripe-webhook.js');
        const emailResult = await sendBookingEmail(bookingWithId, env);
        console.log('Email result for manual booking:', emailResult);
      } catch (emailError) {
        console.error('Failed to send email for manual booking:', emailError);
        // Don't fail the booking creation if email fails
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        bookingId: result.id,
        message: 'Manual booking created successfully',
        calendarEventCreated: calendarResult.success,
        calendarEventId: calendarResult.eventId
      }),
      { 
        status: 201,
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
       } 
      }
    );

  } catch (error) {
    console.error('Manual booking error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        } 
      }
    );
  }
}