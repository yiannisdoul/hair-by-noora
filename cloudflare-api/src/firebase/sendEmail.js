import axios from 'axios';

export async function sendBookingEmail({ name, email, phone, service, date, time }, env) {
  const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
  const BREVO_API_KEY = env.BREVO_API_KEY; // Remove VITE_ prefix
  const BREVO_TEMPLATE_ID = parseInt(env.BREVO_TEMPLATE_ID); // Remove VITE_ prefix

  const FROM_EMAIL = env.BREVO_FROM_EMAIL || 'bookings@hairbynoora.com.au';
  const FROM_NAME = env.BREVO_FROM_NAME || 'Hair by Noora';
  const BCC_EMAIL = env.BREVO_BCC_EMAIL || 'bookings@hairbynoora.com.au';

  try {
    
    const payload = {
      sender: {
        name: FROM_NAME,
        email: FROM_EMAIL,
      },
      to: [{ email }],
      bcc: [{ email: BCC_EMAIL }],
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
      'Accept': 'application/json',
    };

    const response = await axios.post(BREVO_API_URL, payload, { headers });
   
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Failed to send email:', error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
}