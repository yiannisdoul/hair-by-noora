import Stripe from 'stripe';
import axios from 'axios';
import { GoogleCalendarService } from '../services/google-calendar.js';
import { createBooking } from '../firebase/bookings.js';

export async function sendBookingEmail(booking, env, isAttempt = false) {
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
    // Always send to customer email and BCC to notification email
    const recipients = [{ email: booking.email, name: booking.name }]; // Customer email
    const bccRecipients = [{ email: BCC_EMAIL, name: "Hair by Noora" }]; // Your notification email

    // Create subject based on context
    let subject;
    if (isAttempt === true) {
      subject = `🆕 NEW BOOKING ATTEMPT! - ${booking.name}`;
    } else if (isAttempt === false) {
      subject = `✅ CONFIRMED BOOKING! - ${booking.name}`;
    } else {
      subject = `Booking Confirmation - Hair by Noora`;
    }

    // For notification emails (attempt or confirmation), use simple email
    if (isAttempt !== undefined) {
      const statusMessage = isAttempt
        ? "Status: Proceeding to payment..." 
        : "Status: Payment completed! 💰";

      const statusEmoji = isAttempt ? "🆕" : "✅";
      const statusText = isAttempt ? "NEW BOOKING ATTEMPT!" : "CONFIRMED BOOKING!";

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: ${isAttempt ? '#ff6b35' : '#28a745'}; text-align: center; font-size: 24px; margin-bottom: 30px;">
              ${statusEmoji} ${statusText}
            </h1>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #333; font-size: 18px; margin-bottom: 15px;">👤 Customer Details:</h2>
              <p><strong>Name:</strong> ${booking.name}</p>
              <p><strong>💇‍♀️ Service:</strong> ${booking.service}${booking.option ? ` - ${booking.option}` : ''}</p>
              <p><strong>📅 Date:</strong> ${booking.date}</p>
              <p><strong>⏰ Time:</strong> ${booking.time}</p>
              <p><strong>📱 Phone:</strong> ${booking.phone}</p>
              <p><strong>📧 Email:</strong> ${booking.email}</p>
              <p><strong>👥 Guests:</strong> ${booking.guests || '1'}</p>
              <p><strong>⏱️ Duration:</strong> ${booking.durationMinutes || '30'} minutes</p>
            </div>

            <div style="text-align: center; padding: 15px; background-color: ${isAttempt ? '#fff3cd' : '#d4edda'}; border-radius: 8px; margin-top: 20px;">
              <p style="margin: 0; font-weight: bold; color: ${isAttempt ? '#856404' : '#155724'};">
                ${statusMessage}
              </p>
            </div>
          </div>
        </div>
      `;

      const payload = {
        sender: {
          name: FROM_NAME,
          email: FROM_EMAIL
        },
        to: recipients,
        bcc: bccRecipients,
        subject: subject,
        htmlContent: htmlContent
      };

      const response = await axios.post(BREVO_API_URL, payload, {
        headers: {
          'api-key': BREVO_API_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      return { success: true, messageId: response.data.messageId };
    }

    // For customer emails, use the template
    const payload = {
      sender: {
        name: FROM_NAME,
        email: FROM_EMAIL
      },
      to: recipients,
      bcc: bccRecipients,
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
      timeout: 10000
    });
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Failed to send email:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    
    // Try fallback simple email if template fails and this is a customer email
    if (isAttempt === undefined) {
      const fallbackResult = await sendSimpleBookingEmail(booking, env);
      
      if (fallbackResult.success) {
        console.log('✅ Fallback email sent successfully');
        return fallbackResult;
      }
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
  console.log('=== WEBHOOK RECEIVED ===');

  try {
    const signature = request.headers.get('stripe-signature');
    console.log('Stripe signature present:', !!signature);
    
     // Log all request headers for debugging
    console.log('Request headers:');
    for (const [key, value] of request.headers.entries()) {
      console.log(`${key}: ${value}`);
    }

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
    console.log('Full session object:', JSON.stringify(session, null, 2));

    // Extract metadata more safely
    const metadata = session.metadata || {};
  
    const booking = {
      name: metadata.name || metadata.customerName || 'Customer',
      email: metadata.email || metadata.customerEmail || 'No email provided',
      phone: metadata.phone || 'No phone provided',
      service: metadata.service || 'Unknown service',
      option: metadata.option || '',
      date: metadata.date,
      time: metadata.time || '12:00',
      guests: parseInt(metadata.guests || '1'),
      durationMinutes: parseInt(metadata.durationMinutes || '30'),
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

    // Send email notification that booking has been confirmed/paid
    console.log('📧 Sending email notification for confirmed booking');
    const emailResult = await sendBookingEmail(booking, env, false); // false = confirmed booking
    
    if (emailResult.success) {
      console.log('✅ Email notification sent successfully:', emailResult.messageId);
    } else {
      console.error('❌ Failed to send email notification:', emailResult.error);
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