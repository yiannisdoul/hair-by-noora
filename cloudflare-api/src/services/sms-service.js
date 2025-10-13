export class SMSService {
  constructor(env) {
    this.brevoApiKey = env.BREVO_API_KEY;
    this.targetPhone = '+639674967730';
  }

  generateBookingMessage(booking, isAttempt = true) {
    return isAttempt ? 
`NEW BOOKING ATTEMPT!

Customer: ${booking.name}
Service: ${booking.service}${booking.option ? ` - ${booking.option}` : ''}
Date: ${booking.date}
Time: ${booking.time}
Phone: ${booking.phone}
Email: ${booking.email}

Status: Proceeding to payment...` :
`CONFIRMED BOOKING!

Customer: ${booking.name}
Service: ${booking.service}${booking.option ? ` - ${booking.option}` : ''}
Date: ${booking.date}
Time: ${booking.time}
Phone: ${booking.phone}
Email: ${booking.email}

Status: Payment completed!`;
  }

  async sendBookingNotification(booking, isAttempt = true) {
    try {
      if (!this.brevoApiKey) {
        throw new Error('Brevo API key not configured');
      }

      const message = this.generateBookingMessage(booking, isAttempt);
      
      console.log('📱 Sending SMS notification to:', this.targetPhone);
      
      const response = await fetch('https://api.brevo.com/v3/transactionalSMS/sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.brevoApiKey
        },
        body: JSON.stringify({
          type: 'transactional',
          unicodeEnabled: true,
          recipient: this.targetPhone,
          content: message,
          sender: 'HairByNoora'
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log('✅ SMS sent successfully:', result.messageId);
        return {
          success: true,
          messageId: result.messageId,
          message: 'SMS notification sent successfully'
        };
      } else {
        console.error('❌ Failed to send SMS:', result);
        return {
          success: false,
          error: result.message || result.error || 'Unknown error'
        };
      }

    } catch (error) {
      console.error('❌ SMS sending error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}
