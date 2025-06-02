import axios from 'axios';

export async function sendBookingEmail({ name, email, phone, service, date, time }, env) {
  const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
  const BREVO_API_KEY = env.BREVO_API_KEY; // Remove VITE_ prefix
  const BREVO_TEMPLATE_ID = parseInt(env.BREVO_TEMPLATE_ID); // Remove VITE_ prefix

  try {
    console.log('Sending email with data:', { name, email, service, date, time });
    
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
      'Accept': 'application/json',
    };

    console.log('Sending request to Brevo:', { url: BREVO_API_URL, templateId: BREVO_TEMPLATE_ID });
    
    const response = await axios.post(BREVO_API_URL, payload, { headers });
    console.log('Brevo API response:', response.data);
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Failed to send email:', error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
}