import axios from 'axios';

export async function sendBookingEmail({ name, email, phone, service, date, time }, env) {
  const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
  const BREVO_API_KEY = env.VITE_BREVO_API_KEY;
  const BREVO_TEMPLATE_ID = parseInt(env.VITE_BREVO_TEMPLATE_ID || '1');

  try {
    const payload = {
      sender: {
        name: 'Hair By Noora',
        email: 'bookings@hairbynoora.com.au',
      },
      to: [{ email }],
      bcc: [{ email: 'bookings@hairbynoora.com.au' }],
      templateId: BREVO_TEMPLATE_ID,
      params: {
        name,
        service,
        date,
        time,
        phone,
        email,
      },
    };

    const headers = {
      'api-key': BREVO_API_KEY,
      'Content-Type': 'application/json',
    };

    const response = await axios.post(BREVO_API_URL, payload, { headers });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
}