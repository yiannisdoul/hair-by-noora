import Stripe from 'stripe';
import axios from 'axios';
import { GoogleCalendarService } from '../services/google-calendar.js';
import { createBooking } from '../firebase/bookings.js';

export async function sendBookingEmail(booking, env) {
  const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
  const BREVO_API_KEY = env.BREVO_API_KEY;
  const BREVO_TEMPLATE_ID = parseInt(env.BREVO_TEMPLATE_ID || '1');

  // Dynamic email configuration
  const FROM_EMAIL = env.BREVO_FROM_EMAIL || 'bookings@hairbynoora.com.au';
  const FROM_NAME = env.BREVO_FROM_NAME || 'Hair by Noora';
  const BCC_EMAIL = env.BREVO_BCC_EMAIL || 'bookings@hairbynoora.com.au';


  // Add validation
  if (!BREVO_API_KEY) {
    console.error('BREVO_API_KEY environment variable is not set');
    return { success: false, error: 'BREVO_API_KEY not configured' };
  }

  try {
    
    const payload = {
      sender: {
        name: FROM_NAME,
        email: FROM_EMAIL
      },
      to: [{ email: booking.email, name: booking.name }],
      bcc: [{ email: BCC_EMAIL }],
      templateId: BREVO_TEMPLATE_ID,
      params: {
        name: booking.name,
        service: booking.service,
        option: booking.option || '',
        date: booking.date,
        time: booking.time,
        phone: booking.phone,
        email: booking.email,
        guests: booking.guests?.toString() || '1',
        duration: booking.durationMinutes?.toString() || '30'
      }
    };

    const headers = {
      'api-key': BREVO_API_KEY,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
 
    const response = await axios.post(BREVO_API_URL, payload, { 
      headers,
      timeout: 10000 // 10 second timeout
    });
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Failed to send email via template:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    
    // Try fallback simple email if template fails
    const fallbackResult = await sendSimpleBookingEmail(booking, env);
    
    if (fallbackResult.success) {
      console.log('✅ Fallback email sent successfully');
      return fallbackResult;
    }
    
    return { success: false, error: error.response?.data || error.message };
  }
}

async function sendSimpleBookingEmail(booking, env) {
  const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
  const BREVO_API_KEY = env.BREVO_API_KEY;

  if (!BREVO_API_KEY) {
    return { success: false, error: 'BREVO_API_KEY not configured' };
  }

  try {
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #e91e63;">Booking Confirmation - Hair by Noora</h2>
        <p>Dear ${booking.name},</p>
        <p>Your booking has been confirmed! Here are the details:</p>
        
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">Appointment Details</h3>
          <p><strong>Service:</strong> ${booking.service}${booking.option ? ` - ${booking.option}` : ''}</p>
          <p><strong>Date:</strong> ${booking.date}</p>
          <p><strong>Time:</strong> ${booking.time}</p>
          <p><strong>Duration:</strong> ${booking.durationMinutes} minutes</p>
          <p><strong>Phone:</strong> ${booking.phone}</p>
          ${booking.guests > 1 ? `<p><strong>Guests:</strong> ${booking.guests}</p>` : ''}
        </div>
        
        <p>Thank you for choosing Hair by Noora! We look forward to seeing you.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666;">
          <p>If you need to make any changes to your appointment, please contact us as soon as possible.</p>
          <p><strong>Hair by Noora</strong><br>
          Email: bookings@hairbynoora.com.au</p>
        </div>
      </div>
    `;

    const payload = {
      sender: {
        name: FROM_NAME,
        email: FROM_EMAIL
      },
      to: [{ email: booking.email, name: booking.name }],
      bcc: [{ email: BCC_EMAIL }],
      subject: 'Booking Confirmation - Hair by Noora',
      htmlContent: emailContent
    };

    const response = await axios.post(BREVO_API_URL, payload, {
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    return { success: true, data: response.data };

  } catch (error) {
    console.error('Fallback email also failed:', error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
}

export async function handleStripeWebhook({ request, env }) {
  
  try {
    const signature = request.headers.get('stripe-signature');
    console.log('Stripe signature present:', !!signature);
    
    if (!signature) {
      console.error('Missing Stripe signature');
      throw new Error('No Stripe signature found');
    }

    const body = await request.text();
    console.log('Request body length:', body.length);
    
    const stripe = new Stripe(env.STRIPE_SECRET_KEY);
    
    // Use constructEventAsync instead of constructEvent
    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        env.STRIPE_WEBHOOK_SECRET
      );
      console.log('✅ Webhook signature verified');
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err.message);
      throw new Error(`Webhook signature verification failed: ${err.message}`);
    }

    console.log('Processing webhook event:', event.type, 'ID:', event.id);

    if (event.type !== 'checkout.session.completed') {
      console.log('Ignoring event type:', event.type);
      return new Response(JSON.stringify({ received: true }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const session = event.data.object;
    console.log('Session metadata:', session.metadata);
    
    if (!session.metadata) {
      throw new Error('Missing metadata in session');
    }

    const booking = {
      name: session.metadata.name,
      email: session.metadata.email,
      phone: session.metadata.phone,
      service: session.metadata.service,
      option: session.metadata.option,
      date: session.metadata.date,
      time: session.metadata.time,
      guests: parseInt(session.metadata.guests || '1'),
      durationMinutes: parseInt(session.metadata.durationMinutes || '30'),
      paymentIntentId: session.payment_intent,
      createdAt: new Date().toISOString(),
      amount: session.amount_total,
      status: 'confirmed',
      manual: false
    };

    console.log('📝 Creating booking in Firestore');
    const firestoreResult = await createBooking(booking, env);
    
    if (!firestoreResult.success) {
      console.error('❌ Failed to create booking in Firestore:', firestoreResult.message);
      // Continue with email and calendar even if Firestore fails
    } else {
      console.log('✅ Booking created in Firestore with ID:', firestoreResult.id);
      booking.id = firestoreResult.id;
    }

    console.log('📧 Attempting to send confirmation email to:', booking.email);
    console.log('Email payload preview:', {
      to: booking.email,
      templateId: env.BREVO_TEMPLATE_ID,
      hasBrevoKey: !!env.BREVO_API_KEY,
      service: booking.service,
      date: booking.date,
      time: booking.time
    });
    
    const emailResult = await sendBookingEmail(booking, env);
    
    if (emailResult.success) {
      console.log('✅ Email sent successfully:', emailResult.data);
    } else {
      console.error('❌ Failed to send email:', emailResult.error);
      console.error('Email error details:', emailResult);
    }

    // Add booking to Google Calendar
    console.log('📅 Creating Google Calendar event');
    const calendarService = new GoogleCalendarService(env);
    const calendarResult = await calendarService.createCalendarEvent(booking);
    
    if (calendarResult.success) {
      console.log('✅ Calendar event created successfully:', calendarResult.eventId);
    } else {
      console.error('❌ Failed to create calendar event:', calendarResult.error);
    }

    console.log('=== Webhook Completed Successfully ===');
    return new Response(JSON.stringify({ 
      success: true, 
      emailSent: emailResult.success,
      calendarEventCreated: calendarResult.success,
      calendarEventId: calendarResult.eventId 
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('=== Webhook Error ===', {
      message: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    });
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}