import Stripe from 'stripe';
import axios from 'axios';

async function sendBookingEmail(booking, env) {
  const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
  const BREVO_API_KEY = env.BREVO_API_KEY;
  const BREVO_TEMPLATE_ID = parseInt(env.BREVO_TEMPLATE_ID || '1');

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
  try {
    const signature = request.headers.get('stripe-signature');
    if (!signature) {
      throw new Error('No Stripe signature found');
    }

    const body = await request.text();
    const stripe = new Stripe(env.STRIPE_SECRET_KEY);
    
    // Use constructEventAsync instead of constructEvent
    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      throw new Error(`Webhook signature verification failed: ${err.message}`);
    }

    console.log('Processing webhook event:', event.type);

    if (event.type !== 'checkout.session.completed') {
      return new Response(JSON.stringify({ received: true }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const session = event.data.object;
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

    console.log('Sending confirmation email');
    const emailResult = await sendBookingEmail(booking, env);
    
    if (!emailResult.success) {
      console.error('Failed to send email:', emailResult.error);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('Webhook error:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}