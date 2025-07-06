import { GoogleCalendarService } from '../services/google-calendar.js';

// Test email endpoint with calendar sync
export async function handleTestEmail({ request, env }) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const testBooking = {
    id: 'test_booking_' + Date.now(), // Add ID for calendar event
    name: 'Test Customer',
    email: 'akptan2@gmail.com', // Replace with your email for testing
    service: 'Cut, Wash & Blow Wave',
    option: 'Medium - $70',
    date: '2025-07-08',
    time: '10:00',
    phone: '+61400000000',
    durationMinutes: 60,
    guests: 1
  };

  console.log('Testing email and calendar sync with booking:', testBooking);
  
  const results = {
    email: { success: false, error: null, data: null },
    calendar: { success: false, error: null, eventId: null }
  };

  try {
    // 1. Send booking email
    console.log('📧 Testing email functionality...');
    const { sendBookingEmail } = await import('./stripe-webhook.js');
    const emailResult = await sendBookingEmail(testBooking, env);
    
    results.email = {
      success: emailResult.success,
      error: emailResult.error,
      data: emailResult.data
    };

    if (emailResult.success) {
      console.log('✅ Email sent successfully');
    } else {
      console.error('❌ Email failed:', emailResult.error);
    }

    // 2. Create calendar event
    console.log('📅 Testing calendar sync functionality...');
    
    const calendarService = new GoogleCalendarService(env);
    const calendarResult = await calendarService.createCalendarEvent(testBooking);
    
    results.calendar = {
      success: calendarResult.success,
      error: calendarResult.error,
      eventId: calendarResult.eventId
    };

    if (calendarResult.success) {
      console.log('✅ Calendar event created successfully:', calendarResult.eventId);
    } else {
      console.error('❌ Calendar event creation failed:', calendarResult.error);
    }

    // 3. Generate summary response
    const overallSuccess = results.email.success || results.calendar.success;
    const summary = {
      success: overallSuccess,
      message: generateSummaryMessage(results),
      results: results,
      testBooking: testBooking
    };

    return new Response(JSON.stringify(summary, null, 2), {
      status: overallSuccess ? 200 : 500,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Test failed with error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      results: results,
      testBooking: testBooking
    }, null, 2), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

function generateSummaryMessage(results) {
  const emailStatus = results.email.success ? '✅ Email sent' : '❌ Email failed';
  const calendarStatus = results.calendar.success ? '✅ Calendar synced' : '❌ Calendar failed';
  
  if (results.email.success && results.calendar.success) {
    return `${emailStatus} and ${calendarStatus} - Full test successful!`;
  } else if (results.email.success && !results.calendar.success) {
    return `${emailStatus} but ${calendarStatus} - Partial success`;
  } else if (!results.email.success && results.calendar.success) {
    return `${emailStatus} but ${calendarStatus} - Partial success`;
  } else {
    return `${emailStatus} and ${calendarStatus} - Both failed`;
  }
}