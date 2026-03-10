import nodemailer from 'nodemailer';

/**
 * Email Service
 * Handles sending payslips and other notifications.
 */
class EmailService {
    constructor() {
        this.transporter = null;
        this.init();
    }

    init() {
        // Transporter setup should be dynamic from env or app_settings
        // For now, use common env vars with a fallback to mock/dev
        const host = process.env.SMTP_HOST;
        const port = process.env.SMTP_PORT || 587;
        const user = process.env.SMTP_USER;
        const pass = process.env.SMTP_PASS;

        if (host && user && pass) {
            this.transporter = nodemailer.createTransport({
                host,
                port,
                secure: port == 465, // true for 465, false for other ports
                auth: { user, pass },
            });
            console.log('[EmailService] SMTP Transporter Initialized');
        } else {
            console.log('[EmailService] SMTP credentials missing. Emailing disabled.');
        }
    }

    async sendEmail({ to, subject, html, attachments = [] }) {
        if (!this.transporter) {
            console.warn('[EmailService] Attempted to send email but transporter is not configured.');
            return { success: false, message: 'SMTP not configured' };
        }

        try {
            const info = await this.transporter.sendMail({
                from: `"Payroll System" <${process.env.SMTP_USER}>`,
                to,
                subject,
                html,
                attachments
            });
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('[EmailService] Error sending email:', error.message);
            return { success: false, error: error.message };
        }
    }

    async sendPayslip({ email, empName, monthYear, payslipHtml }) {
        return this.sendEmail({
            to: email,
            subject: `Payslip for ${monthYear} - ${empName}`,
            html: payslipHtml
        });
    }
}

export default new EmailService();
