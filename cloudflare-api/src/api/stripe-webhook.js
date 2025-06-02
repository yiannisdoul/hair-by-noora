import Stripe from 'stripe';
import { createBooking } from '../firebase/bookings.js';
import { sendBookingEmail } from '../firebase/sendEmail.js';

export async function handleStripeWebhook({ request, env }) {
  try {
    const signature = request.headers.get('stripe-signature');
    if (!signature) {
      throw new Error('No Stripe signature found');
    }

    const body = await request.text();
    const stripe = new Stripe(env.STRIPE_SECRET_KEY);
    
    // Verify webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      throw new Error(`Webhook signature verification failed: ${err.message}`);
    }

    console.log('Processing webhook event:', event.type);

    if (event.type !== 'checkout.session.completed') {
      return new Response(`Ignored event type: ${event.type}`, { status: 200 });
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
      durationMinutes: parseInt(session.metadata.durationMinutes || '0'),
      paymentIntentId: session.payment_intent,
      createdAt: new Date().toISOString(),
      amount: session.amount_total,
      status: 'confirmed'
    };

    console.log('Creating booking:', booking);
    const bookingResult = await createBooking(booking, env);
    
    if (!bookingResult.success) {
      throw new Error(`Failed to save booking: ${bookingResult.message}`);
    }

    console.log('Sending confirmation email');
    const emailResult = await sendBookingEmail(booking, env);
    
    if (!emailResult.success) {
      console.error('Failed to send email:', emailResult.error);
      // Continue despite email failure
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Webhook error:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}