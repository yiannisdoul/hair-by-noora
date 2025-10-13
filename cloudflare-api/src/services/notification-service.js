export class NotificationService {
  constructor(env) {
    this.brevoApiKey = env.BREVO_API_KEY;
    this.notificationEmail = 'burgerfries2021@gmail.com'; // Your email for notifications
  }

  generateBookingMessage(booking, isAttempt = true) {
    const status = isAttempt ? 'NEW BOOKING ATTEMPT!' : 'CONFIRMED BOOKING!';
    const paymentStatus = isAttempt ? 'Proceeding to payment...' : 'Payment completed!';
    
    return {
      subject: `${status} - ${booking.name}`,
      content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2 style="color: ${isAttempt ? '#ff9800' : '#4caf50'};">${status}</h2>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Customer Details:</h3>
            <p><strong>👤 Name:</strong> ${booking.name}</p>
            <p><strong>💇‍♀️ Service:</strong> ${booking.service}${booking.option ? ` - ${booking.option}` : ''}</p>
            <p><strong>📅 Date:</strong> ${booking.date}</p>
            <p><strong>⏰ Time:</strong> ${booking.time}</p>
            <p><strong>📱 Phone:</strong> ${booking.phone}</p>
            <p><strong>📧 Email:</strong> ${booking.email}</p>
            <p><strong>Status:</strong> ${paymentStatus}</p>
          </div>
          
          <p><strong>WhatsApp Link:</strong><br>
          <a href="https://wa.me/639674967730?text=${encodeURIComponent(this.generateWhatsAppMessage(booking, isAttempt))}" 
             style="background-color: #25d366; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
             Send WhatsApp Message
          </a></p>
        </div>
      `
    };
  }

  generateWhatsAppMessage(booking, isAttempt = true) {
    return isAttempt ? 
`🆕 *New Booking Attempt!*

*Customer Details:*
👤 Name: ${booking.name}
💇‍♀️ Service: ${booking.service}${booking.option ? ` - ${booking.option}` : ''}
📅 Date: ${booking.date}
⏰ Time: ${booking.time}
📱 Phone: ${booking.phone}
📧 Email: ${booking.email}

Status: _Proceeding to payment..._` :
`✅ *Confirmed Booking!*

*Customer Details:*
👤 Name: ${booking.name}
💇‍♀️ Service: ${booking.service}${booking.option ? ` - ${booking.option}` : ''}
📅 Date: ${booking.date}
⏰ Time: ${booking.time}
📱 Phone: ${booking.phone}
📧 Email: ${booking.email}

Status: _Payment completed_ 💰`;
  }

  async sendBookingNotification(booking, isAttempt = true) {
    try {
      if (!this.brevoApiKey) {
        throw new Error('Brevo API key not configured');
      }

      const message = this.generateBookingMessage(booking, isAttempt);
      
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.brevoApiKey
        },
        body: JSON.stringify({
          sender: {
            name: 'Hair by Noora Booking System',
            email: 'burgerfries2021@gmail.com'
          },
          to: [{ 
            email: this.notificationEmail,
            name: 'Hair by Noora Owner'
          }],
          subject: message.subject,
          htmlContent: message.content
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log('✅ Email notification sent successfully:', result.messageId);
        return {
          success: true,
          messageId: result.messageId,
          message: 'Email notification sent successfully'
        };
      } else {
        console.error('❌ Failed to send email notification:', result);
        return {
          success: false,
          error: result.message || 'Unknown error'
        };
      }

    } catch (error) {
      console.error('❌ Email notification error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}
