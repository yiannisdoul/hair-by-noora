export class GoogleCalendarService {
  constructor(env) {
    this.env = env;
    this.calendarId = env.GOOGLE_CALENDAR_ID || 'primary';
    this.projectId = env.GOOGLE_PROJECT_ID;
    this.serviceAccountEmail = env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    this.privateKey = env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
    this.timezone = env.TIMEZONE || 'Australia/Melbourne';
  }

  // Create JWT token for service account authentication
  async createJWT() {
    try {
      // Validate environment variables
      if (!this.serviceAccountEmail || !this.privateKey || !this.projectId) {
        console.error('Missing Google Calendar credentials:', {
          hasServiceAccountEmail: !!this.serviceAccountEmail,
          hasPrivateKey: !!this.privateKey,
          hasProjectId: !!this.projectId
        });
        throw new Error('Missing Google Calendar credentials');
      }

      // Clean up the private key
      const privateKey = this.privateKey
        .replace(/\\n/g, '\n')
        .replace(/"/g, '')
        .trim();

      // JWT Header
      const header = {
        alg: 'RS256',
        typ: 'JWT'
      };

      // JWT Payload
      const now = Math.floor(Date.now() / 1000);
      const payload = {
        iss: this.serviceAccountEmail,
        scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events',
        aud: 'https://oauth2.googleapis.com/token',
        exp: now + 3600, // 1 hour
        iat: now
      };

      // Base64URL encode
      const base64UrlEncode = (obj) => {
        return btoa(JSON.stringify(obj))
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=/g, '');
      };

      const encodedHeader = base64UrlEncode(header);
      const encodedPayload = base64UrlEncode(payload);
      const unsignedToken = `${encodedHeader}.${encodedPayload}`;

      // Import the private key
      const keyData = await crypto.subtle.importKey(
        'pkcs8',
        this.pemToArrayBuffer(privateKey),
        {
          name: 'RSASSA-PKCS1-v1_5',
          hash: 'SHA-256'
        },
        false,
        ['sign']
      );

      // Sign the token
      const signature = await crypto.subtle.sign(
        'RSASSA-PKCS1-v1_5',
        keyData,
        new TextEncoder().encode(unsignedToken)
      );

      // Base64URL encode signature
      const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');

      return `${unsignedToken}.${encodedSignature}`;

    } catch (error) {
      console.error('Failed to create JWT:', error);
      throw new Error(`JWT creation failed: ${error.message}`);
    }
  }

  // Convert PEM private key to ArrayBuffer
  pemToArrayBuffer(pem) {
    // Remove header, footer, and whitespace
    const pemContents = pem
      .replace(/-----BEGIN PRIVATE KEY-----/, '')
      .replace(/-----END PRIVATE KEY-----/, '')
      .replace(/\s/g, '');
    
    // Convert base64 to binary
    const binaryString = atob(pemContents);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  // Get access token using JWT
  async getAccessToken() {
    try {
      const jwt = await this.createJWT();

      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
          assertion: jwt
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Token request failed: ${response.status} - ${errorData}`);
      }

      const tokenData = await response.json();
      return tokenData.access_token;

    } catch (error) {
      console.error('Failed to get access token:', error);
      throw error;
    }
  }

  async createCalendarEvent(booking) {
    try {
     
      const accessToken = await this.getAccessToken();
      
      if (!accessToken) {
        throw new Error('Failed to get access token');
      }

      console.log('✅ Successfully authenticated with Google Calendar API');

      // Create the event object
      const eventStartTime = new Date(`${booking.date}T${booking.time}:00`);
      const eventEndTime = new Date(eventStartTime.getTime() + (booking.durationMinutes * 60 * 1000));

      const event = {
        summary: `${booking.service} - ${booking.name}`,
        description: this.generateEventDescription(booking),
        start: {
          dateTime: eventStartTime.toISOString(),
          timeZone: this.timezone
        },
        end: {
          dateTime: eventEndTime.toISOString(),
          timeZone: this.timezone
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 24 hours before
            { method: 'popup', minutes: 30 }       // 30 minutes before
          ]
        },
        colorId: '8', // Light blue color
        visibility: 'private',
        location: 'Hair by Noora Salon'
      };

      // Make the API call to create the event
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(this.calendarId)}/events`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(event)
        }
      );

      const responseText = await response.text();
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch {
          errorData = { message: responseText };
        }
        
        // Handle specific error cases
        if (response.status === 403) {
          console.error('❌ Calendar permission error');
          return {
            success: false,
            error: `Calendar access denied. Error: ${JSON.stringify(errorData)}`,
            details: errorData
          };
        }
        
        throw new Error(`Calendar API error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const eventData = JSON.parse(responseText);
      console.log('✅ Calendar event created successfully:', eventData.id);

      return {
        success: true,
        eventId: eventData.id,
        eventLink: eventData.htmlLink,
        data: eventData
      };

    } catch (error) {
      console.error('❌ Google Calendar integration error:', error);
      return {
        success: false,
        error: error.message,
        details: error
      };
    }
  }

  generateEventDescription(booking) {
    return `
      Hair Appointment Details:
      • Service: ${booking.service}${booking.option ? ` (${booking.option})` : ''}
      • Client: ${booking.name}
      • Email: ${booking.email}
      • Phone: ${booking.phone}
      • Duration: ${booking.durationMinutes} minutes
      • Guests: ${booking.guests || 1}

      Booking ID: ${booking.id}

      Note: This is a private appointment in the salon calendar.
      The customer will receive a separate email confirmation.
          `.trim();
  }

  // Optional: Add method to send calendar invite manually via email
  async sendCalendarInviteEmail(booking, eventData) {
    try {
      const icsContent = this.generateICSFile(booking, eventData);
      return { success: true, icsContent };
    } catch (error) {
      console.error('Failed to generate calendar invite:', error);
      return { success: false, error: error.message };
    }
  }

  generateICSFile(booking, eventData) {
    const startTime = new Date(`${booking.date}T${booking.time}:00`);
    const endTime = new Date(startTime.getTime() + (booking.durationMinutes * 60 * 1000));
    
    const formatDate = (date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    return `BEGIN:VCALENDAR
      VERSION:2.0
      PRODID:-//Hair by Noora//Booking System//EN
      BEGIN:VEVENT
      UID:${eventData.id}@hairbynoora.com.au
      DTSTAMP:${formatDate(new Date())}
      DTSTART:${formatDate(startTime)}
      DTEND:${formatDate(endTime)}
      SUMMARY:${booking.service} - Hair by Noora
      DESCRIPTION:${this.generateEventDescription(booking)}
      LOCATION:Hair by Noora Salon
      STATUS:CONFIRMED
      END:VEVENT
      END:VCALENDAR`;
  }
}