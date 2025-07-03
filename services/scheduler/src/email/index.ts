import nodemailer from 'nodemailer'
import * as dotenv from 'dotenv'
import path from 'path'

// Load environment variables - find project root
const projectRoot = path.resolve(__dirname, '../../../..')
dotenv.config({
  path: path.join(projectRoot, '.env'),
})

// Event interface
interface Event {
  id: number
  contractAddress: string
  eventSignature: string
  eventArgs: Record<string, any>
  nextTimestamp: string
  createdAt: string
  updatedAt: string
}

// Email service class
export class EmailService {
  private transporter: nodemailer.Transporter | string | null = null
  private consoleMode: boolean = false

  constructor() {
    this.initializeTransporter()
  }

  private initializeTransporter() {
    // Check for console mode first (development)
    if (process.env.EMAIL_MODE === 'console') {
      console.log('📧 Email service initialized in CONSOLE MODE')
      console.log('   Emails will be logged to console instead of sent')
      this.consoleMode = true
      this.transporter = 'console'
      return
    }

    // SMTP configuration for real email sending
    const emailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    }

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('⚠️  SMTP credentials not configured, email service disabled')
      console.log('   Options:')
      console.log('   1. Set EMAIL_MODE=console in .env for console logging')
      console.log('   2. Set SMTP_USER and SMTP_PASS in .env for real emails')
      return
    }

    try {
      this.transporter = nodemailer.createTransport(emailConfig)
      console.log('✅ Email service initialized with SMTP')
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error)
    }
  }

  // Send reminder email
  async sendReminder(event: Event, recipientEmail?: string): Promise<boolean> {
    if (!this.transporter) {
      console.log(
        '📧 Email service not configured, skipping email notification'
      )
      return false
    }

    const recipient =
      recipientEmail || process.env.DEFAULT_EMAIL || 'user@example.com'
    const subject = `🔔 ChainCal Reminder: ${this.getEventName(event)}`

    // Console mode - log email instead of sending
    if (this.consoleMode) {
      console.log('\n' + '='.repeat(60))
      console.log('📧 EMAIL NOTIFICATION (Console Mode)')
      console.log('='.repeat(60))
      console.log(`To: ${recipient}`)
      console.log(`Subject: ${subject}`)
      console.log(`Event: ${this.getEventName(event)}`)
      console.log(`Contract: ${event.contractAddress}`)
      console.log(
        `Scheduled: ${new Date(event.nextTimestamp).toLocaleString()}`
      )
      console.log(`Event ID: #${event.id}`)
      console.log('='.repeat(60) + '\n')
      return true
    }

    // Real email sending
    try {
      const html = this.generateEmailHTML(event)
      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: recipient,
        subject,
        html,
      }

      await (this.transporter as nodemailer.Transporter).sendMail(mailOptions)
      console.log(
        `📧 Reminder email sent for event ${event.id} to ${recipient}`
      )
      return true
    } catch (error) {
      console.error(`❌ Failed to send email for event ${event.id}:`, error)
      return false
    }
  }

  // Extract event name from signature
  private getEventName(event: Event): string {
    return event.eventSignature.split('(')[0]
  }

  // Generate HTML email template
  private generateEmailHTML(event: Event): string {
    const eventName = this.getEventName(event)
    const contractShort = `${event.contractAddress.slice(0, 6)}...${event.contractAddress.slice(-4)}`
    const timestamp = new Date(event.nextTimestamp).toLocaleString()

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>ChainCal Reminder</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { text-align: center; margin-bottom: 30px; }
          .emoji { font-size: 48px; margin-bottom: 10px; }
          .title { color: #333; font-size: 24px; font-weight: bold; margin: 0; }
          .event-card { background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #007bff; }
          .event-name { font-size: 18px; font-weight: bold; color: #333; margin-bottom: 10px; }
          .event-details { color: #666; font-size: 14px; line-height: 1.5; }
          .footer { text-align: center; margin-top: 30px; color: #888; font-size: 12px; }
          .button { display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 10px 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="emoji">🔔</div>
            <h1 class="title">ChainCal Reminder</h1>
          </div>
          
          <div class="event-card">
            <div class="event-name">${eventName}</div>
            <div class="event-details">
              <strong>Contract:</strong> ${contractShort}<br>
              <strong>Scheduled:</strong> ${timestamp}<br>
              <strong>Event ID:</strong> #${event.id}
            </div>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <p>This is your scheduled reminder for the on-chain event above.</p>
            <a href="http://localhost:3002/api/frame" class="button">View in Frame</a>
            <a href="http://localhost:3001/events/${event.id}/snooze" class="button">Snooze</a>
          </div>
          
          <div class="footer">
            <p>Sent by ChainCal - Your on-chain calendar assistant</p>
            <p>Manage your subscriptions at <a href="http://localhost:3001/events">localhost:3001</a></p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  // Test email configuration
  async testConnection(): Promise<boolean> {
    if (!this.transporter) {
      return false
    }

    if (this.consoleMode) {
      console.log('✅ Email service connection verified (Console Mode)')
      return true
    }

    try {
      await (this.transporter as nodemailer.Transporter).verify()
      console.log('✅ Email service connection verified')
      return true
    } catch (error) {
      console.error('❌ Email service connection failed:', error)
      return false
    }
  }
}
