// Test email endpoint
export async function handleTestEmail({ request, env }) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const testBooking = {
    name: 'Test Customer',
    email: 'test@example.com', // Replace with your email for testing
    service: 'Test Service',
    option: '',
    date: '2025-07-07',
    time: '10:00',
    phone: '+61400000000',
    durationMinutes: 60,
    guests: 1
  };

  console.log('Testing email with booking:', testBooking);
  
  // Import the email function
  const { sendBookingEmail } = await import('./stripe-webhook.js');
  const result = await sendBookingEmail(testBooking, env);
  
  return new Response(JSON.stringify({
    success: result.success,
    error: result.error,
    data: result.data
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
