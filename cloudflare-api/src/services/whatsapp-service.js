export class WhatsAppService {
  constructor() {
    this.phoneNumber = '639674967730'; // Australian format without '+' and removing leading 0
  }

  generateBookingMessage(booking, isAttempt = true) {
    const message = isAttempt ? 
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

    // Encode the message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // Generate WhatsApp link
    return `https://wa.me/${this.phoneNumber}?text=${encodedMessage}`;
  }

  async redirectToWhatsApp(booking, isAttempt = true) {
    const whatsappLink = this.generateBookingMessage(booking, isAttempt);
    
    return {
      success: true,
      whatsappLink,
      message: 'Click to send WhatsApp notification'
    };
  }
}
