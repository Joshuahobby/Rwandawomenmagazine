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
    if (!resend) return;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const { data, error } = await resend.emails.send(emailData, {
                headers: {
                    'Idempotency-Key': idempotencyKey,
                },
            });

            if (error) {
                const resendErr = error as ResendError;
                // Check if error is retryable (5xx, 429)
                const isRetryable = (resendErr.statusCode && resendErr.statusCode >= 500) || resendErr.statusCode === 429;
                if (!isRetryable || attempt === maxRetries - 1) {
                    throw error;
                }

                const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
                console.warn(`[MailService] Retryable error (attempt ${attempt + 1}/${maxRetries}):`, error);
                await sleep(delay + Math.random() * 1000); // Add jitter
                continue;
            }

            return data;
        } catch (err) {
            if (attempt === maxRetries - 1) throw err;
            const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
            console.warn(`[MailService] Unexpected error (attempt ${attempt + 1}/${maxRetries}):`, err);
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
        return setting?.value || DEFAULT_ADMIN_EMAIL;
    } catch (err) {
        console.error('[MailService] Error fetching admin email setting:', err);
        return DEFAULT_ADMIN_EMAIL;
    }
}

interface NominationNotification {
    id: string;
    nomineeName: string;
    nomineeOrganization?: string;
    category: { name: string };
    nominatorName: string;
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
    if (!resend) {
        console.warn('[MailService] RESEND_API_KEY not configured. Skipping nomination email.');
        return;
    }

    const adminEmail = await getAdminEmail();
    const { id, nomineeName, nomineeOrganization, category, nominatorName } = nomination;

    try {
        const emailHtml = await render(NominationEmail({
            nomineeName,
            nomineeOrganization,
            categoryName: category.name,
            nominatorName,
        }));

        const idempotencyKey = `nomination-v1-${id}`;

        await sendWithRetry({
            from: 'Rwanda Women Magazine <notifications@rwandawomenmagazine.rw>',
            to: adminEmail,
            subject: `New Award Nomination: ${nomineeName}`,
            html: emailHtml,
        }, idempotencyKey);

        console.log(`[MailService] Nomination notification sent to ${adminEmail}`);
    } catch (err) {
        console.error('[MailService] Error sending nomination email:', err);
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
