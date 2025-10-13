import { sendBookingEmail } from './stripe-webhook.js';

export async function handleNotifyBookingAttempt(context) {
  try {
    const body = await context.request.json();

    console.log('📧 Sending email notification for new booking attempt');
    
    const booking = {
      name: body.name,
      service: body.service,
      option: body.option || '',
      date: body.date,
      time: body.time,
      phone: body.phone,
      email: body.email,
      guests: body.guests || '1',
      durationMinutes: body.durationMinutes || '30'
    };

    // Send email notification for booking attempt
    const result = await sendBookingEmail(booking, context.env, true); // true = isAttempt
    
    if (result.success) {
      console.log('✅ Email notification sent successfully');
    } else {
      console.error('❌ Failed to send email notification:', result.error);
    }

    return new Response(JSON.stringify({ 
      success: result.success,
      message: result.success ? 'Email notification sent successfully' : result.error
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (err) {
    console.error('❌ Email notification error:', err);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: err.message || 'Internal server error' 
      }), 
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );
  }
}