import Stripe from 'stripe';
import axios from 'axios';
import { GoogleCalendarService } from '../services/google-calendar.js';

async function sendBookingEmail(booking, env) {
  const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
  const BREVO_API_KEY = env.BREVO_API_KEY;
  const BREVO_TEMPLATE_ID = parseInt(env.BREVO_TEMPLATE_ID || '1');

  // Add validation
  if (!BREVO_API_KEY) {
    console.error('BREVO_API_KEY environment variable is not set');
    return { success: false, error: 'BREVO_API_KEY not configured' };
  }

  console.log('Environment check:', {
    hasBrevoKey: !!BREVO_API_KEY,
    templateId: BREVO_TEMPLATE_ID
  });

  try {
    console.log('Sending email with data:', booking);
    
    const payload = {
      sender: {
        name: 'Hair By Noora',
        email: 'bookings@hairbynoora.com.au'
      },
      to: [{ email: booking.email }],
      bcc: [{ email: 'bookings@hairbynoora.com.au' }],
      templateId: BREVO_TEMPLATE_ID,
      params: {
        name: booking.name,
        service: booking.service,
        date: booking.date,
        time: booking.time,
        phone: booking.phone,
        email: booking.email
      }
    };

    const headers = {
      'api-key': BREVO_API_KEY,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    console.log('Sending request to Brevo:', {
      url: BREVO_API_URL,
      templateId: BREVO_TEMPLATE_ID,
      payload
    });
    
    const response = await axios.post(BREVO_API_URL, payload, { headers });
    console.log('Brevo API response:', response.data);
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Failed to send email:', error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
}

export async function handleStripeWebhook({ request, env }) {
  console.log('=== Webhook Started ===');
  console.log('Environment check:', {
    hasStripeSecret: !!env.STRIPE_SECRET_KEY,
    hasWebhookSecret: !!env.STRIPE_WEBHOOK_SECRET,
    hasBrevoKey: !!env.BREVO_API_KEY,
    brevoTemplateId: env.BREVO_TEMPLATE_ID
  });

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
      status: 'confirmed'
    };

    console.log('📧 Attempting to send confirmation email to:', booking.email);
    const emailResult = await sendBookingEmail(booking, env);
    
    if (emailResult.success) {
      console.log('✅ Email sent successfully');
    } else {
      console.error('❌ Failed to send email:', emailResult.error);
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