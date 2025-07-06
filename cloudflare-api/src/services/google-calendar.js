// Google Calendar integration service
export class GoogleCalendarService {
  constructor(env) {
    this.clientEmail = env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    this.privateKey = env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n');
    this.calendarId = env.GOOGLE_CALENDAR_ID || 'primary';
    this.baseUrl = 'https://www.googleapis.com/calendar/v3';
  }

  async getAccessToken() {
    if (!this.clientEmail || !this.privateKey) {
      throw new Error('Google service account credentials not configured');
    }

    const header = {
      alg: 'RS256',
      typ: 'JWT'
    };

    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: this.clientEmail,
      scope: 'https://www.googleapis.com/auth/calendar',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now
    };

    // Create JWT token
    const encodedHeader = this.base64urlEncode(JSON.stringify(header));
    const encodedPayload = this.base64urlEncode(JSON.stringify(payload));
    
    const signingInput = `${encodedHeader}.${encodedPayload}`;
    const signature = await this.signJWT(signingInput, this.privateKey);
    const jwt = `${signingInput}.${signature}`;

    // Exchange JWT for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt
      })
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      throw new Error(`Failed to get access token: ${error}`);
    }

    const tokenData = await tokenResponse.json();
    return tokenData.access_token;
  }

  async signJWT(data, privateKey) {
    const algorithm = { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' };
    
    // Import the private key
    const keyData = await crypto.subtle.importKey(
      'pkcs8',
      this.pemToArrayBuffer(privateKey),
      algorithm,
      false,
      ['sign']
    );

    // Sign the data
    const signature = await crypto.subtle.sign(
      algorithm,
      keyData,
      new TextEncoder().encode(data)
    );

    return this.base64urlEncode(new Uint8Array(signature));
  }

  pemToArrayBuffer(pem) {
    const pemHeader = '-----BEGIN PRIVATE KEY-----';
    const pemFooter = '-----END PRIVATE KEY-----';
    const pemContents = pem.replace(pemHeader, '').replace(pemFooter, '').replace(/\s/g, '');
    const binaryString = atob(pemContents);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  base64urlEncode(data) {
    const base64 = typeof data === 'string' 
      ? btoa(data) 
      : btoa(String.fromCharCode(...new Uint8Array(data)));
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  async createCalendarEvent(booking) {
    try {
      console.log('Creating Google Calendar event for booking:', booking.name);
      
      const accessToken = await this.getAccessToken();
      
      // Parse date and time
      const startDateTime = new Date(`${booking.date}T${booking.time}`);
      const endDateTime = new Date(startDateTime.getTime() + (booking.durationMinutes * 60000));

      const event = {
        summary: `${booking.service} - ${booking.name}`,
        description: this.createEventDescription(booking),
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: 'Australia/Sydney' // Adjust to your timezone
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: 'Australia/Sydney'
        },
        attendees: [
          {
            email: booking.email,
            displayName: booking.name
          }
        ],
        location: 'Hair by Noora Salon', // Add your salon address
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 24 hours before
            { method: 'popup', minutes: 60 } // 1 hour before
          ]
        },
        extendedProperties: {
          private: {
            bookingId: booking.id || booking.paymentIntentId,
            bookingType: booking.manual ? 'manual' : 'online',
            amount: booking.amount?.toString() || '0'
          }
        }
      };

      const response = await fetch(`${this.baseUrl}/calendars/${this.calendarId}/events`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to create calendar event: ${error}`);
      }

      const createdEvent = await response.json();
      console.log('Calendar event created successfully:', createdEvent.id);
      
      return {
        success: true,
        eventId: createdEvent.id,
        eventUrl: createdEvent.htmlLink
      };

    } catch (error) {
      console.error('Google Calendar integration error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  createEventDescription(booking) {
    let description = `Hair by Noora Appointment\n\n`;
    description += `Service: ${booking.service}`;
    if (booking.option) {
      description += ` - ${booking.option}`;
    }
    description += `\n`;
    description += `Duration: ${booking.durationMinutes} minutes\n`;
    description += `Customer: ${booking.name}\n`;
    description += `Phone: ${booking.phone}\n`;
    description += `Email: ${booking.email}\n`;
    
    if (booking.guests > 1) {
      description += `Guests: ${booking.guests}\n`;
    }
    
    if (booking.notes) {
      description += `\nNotes: ${booking.notes}\n`;
    }
    
    description += `\nBooking Type: ${booking.manual ? 'Manual Booking' : 'Online Payment'}`;
    
    if (!booking.manual && booking.amount) {
      description += `\nAmount Paid: $${(booking.amount / 100).toFixed(2)}`;
    }
    
    description += `\nCreated: ${new Date(booking.createdAt).toLocaleString()}`;
    
    return description;
  }

  async updateCalendarEvent(eventId, booking) {
    try {
      const accessToken = await this.getAccessToken();
      
      const startDateTime = new Date(`${booking.date}T${booking.time}`);
      const endDateTime = new Date(startDateTime.getTime() + (booking.durationMinutes * 60000));

      const event = {
        summary: `${booking.service} - ${booking.name}`,
        description: this.createEventDescription(booking),
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: 'Australia/Sydney'
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: 'Australia/Sydney'
        }
      };

      const response = await fetch(`${this.baseUrl}/calendars/${this.calendarId}/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to update calendar event:', error);
      return false;
    }
  }

  async deleteCalendarEvent(eventId) {
    try {
      const accessToken = await this.getAccessToken();
      
      const response = await fetch(`${this.baseUrl}/calendars/${this.calendarId}/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to delete calendar event:', error);
      return false;
    }
  }
}
