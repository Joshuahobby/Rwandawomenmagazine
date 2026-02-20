import { Resend } from 'resend';
import { render } from '@react-email/render';
import { env } from '../config/env';
import prisma from '../config/db';
import NominationEmail from '../emails/NominationEmail';
import VoteEmail from '../emails/VoteEmail';

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

// Fallback email if no setting is found
const DEFAULT_ADMIN_EMAIL = 'management.thousandhillsevents@gmail.com';

interface ResendError {
    message: string;
    statusCode?: number;
    name?: string;
}

interface EmailData {
    from: string;
    to: string | string[];
    subject: string;
    html: string;
    cc?: string | string[];
    bcc?: string | string[];
    reply_to?: string | string[];
}

/**
 * Utility to sleep for a given duration.
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Exponential backoff retry wrapper for Resend API calls.
 */
async function sendWithRetry(emailData: EmailData, idempotencyKey: string, maxRetries = 3) {
    if (!resend) {
        console.warn('[MailService] Resend client not initialized in sendWithRetry');
        return;
    }

    console.log(`[MailService] Attempting to send email to ${emailData.to} (idempotency: ${idempotencyKey})`);

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const { data, error } = await resend.emails.send(emailData, {
                headers: {
                    'Idempotency-Key': idempotencyKey,
                },
            });

            if (error) {
                console.error(`[MailService] Resend API Error (attempt ${attempt + 1}/${maxRetries}):`, {
                    error,
                    emailData: { ...emailData, html: '[HTML Content Truncated]' }
                });

                const resendErr = error as ResendError;
                // Check if error is retryable (5xx, 429)
                const isRetryable = (resendErr.statusCode && resendErr.statusCode >= 500) || resendErr.statusCode === 429;

                if (!isRetryable || attempt === maxRetries - 1) {
                    throw error;
                }

                const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
                await sleep(delay + Math.random() * 1000); // Add jitter
                continue;
            }

            console.log(`[MailService] Email sent successfully. ID: ${data?.id}`);
            return data;
        } catch (err) {
            console.error(`[MailService] Unexpected error (attempt ${attempt + 1}/${maxRetries}):`, err);
            if (attempt === maxRetries - 1) throw err;
            const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
            await sleep(delay + Math.random() * 1000);
        }
    }
}

/**
 * Get the administrator email from global settings.
 */
async function getAdminEmail(): Promise<string> {
    try {
        const setting = await prisma.globalSetting.findUnique({
            where: { key: 'admin_notification_email' }
        });
        const email = setting?.value || DEFAULT_ADMIN_EMAIL;
        console.log(`[MailService] Admin notification email resolved to: ${email}`);
        return email;
    } catch (err) {
        console.error('[MailService] Error fetching admin email setting:', err);
        return DEFAULT_ADMIN_EMAIL;
    }
}

export interface NominationNotification {
    id: string;
    nomineeName: string;
    nomineeTitle?: string;
    nomineeOrganization?: string;
    sector?: string;
    supportingDocUrl?: string;
    category: { name: string };
    nominatorName: string;
    nominatorEmail: string;
    nominatorPhone?: string;
}

interface VoteData {
    id: string;
    voterIp: string;
    createdAt: string | Date;
}

interface NominationData {
    nomineeName: string;
}

/**
 * Send a notification when a new nomination is submitted.
 */
export async function sendNominationNotification(nomination: NominationNotification) {
    console.log(`[MailService] Processing nomination notification for: ${nomination.nomineeName}`);

    if (!resend) {
        console.warn('[MailService] RESEND_API_KEY not configured. Skipping nomination email.');
        return;
    }

    const adminEmail = await getAdminEmail();
    const {
        id, nomineeName, nomineeTitle, nomineeOrganization, sector,
        supportingDocUrl,
        category, nominatorName, nominatorEmail, nominatorPhone
    } = nomination;

    try {
        console.log('[MailService] Rendering NominationEmail template...');
        const emailHtml = await render(NominationEmail({
            nomineeName,
            nomineeTitle,
            nomineeOrganization,
            sector,
            supportingDocUrl,
            categoryName: category?.name || 'Unknown Category',
            nominatorName,
            nominatorEmail,
            nominatorPhone,
        }));

        const idempotencyKey = `nomination-v1-${id}`;

        await sendWithRetry({
            from: 'Rwanda Women Magazine <notifications@rwandawomenmagazine.rw>',
            to: adminEmail,
            subject: `New Award Nomination: ${nomineeName}`,
            html: emailHtml,
        }, idempotencyKey);

    } catch (err) {
        console.error('[MailService] Critical error in sendNominationNotification:', err);
        throw err;
    }
}

/**
 * Send a notification when a vote is cast.
 */
export async function sendVoteNotification(vote: VoteData, nomination: NominationData) {
    if (!resend) {
        console.warn('[MailService] RESEND_API_KEY not configured. Skipping vote email.');
        return;
    }

    const adminEmail = await getAdminEmail();

    try {
        const emailHtml = await render(VoteEmail({
            nomineeName: nomination.nomineeName,
            voterIp: vote.voterIp,
            timestamp: new Date(vote.createdAt).toLocaleString(),
        }));

        const idempotencyKey = `vote-v1-${vote.id}`;

        await sendWithRetry({
            from: 'Rwanda Women Magazine <notifications@rwandawomenmagazine.rw>',
            to: adminEmail,
            subject: `New Vote Cast: ${nomination.nomineeName}`,
            html: emailHtml,
        }, idempotencyKey);

        console.log(`[MailService] Vote notification sent to ${adminEmail}`);
    } catch (err) {
        console.error('[MailService] Error sending vote email:', err);
    }
}
