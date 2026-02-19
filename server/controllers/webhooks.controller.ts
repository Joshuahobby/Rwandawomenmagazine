import { Request, Response } from 'express';
import { Webhook } from 'svix';
import prisma from '../config/db';
import { env } from '../config/env';

/**
 * Handles incoming webhooks from Resend.
 * Uses Svix for signature verification and logs events for idempotent processing.
 */
export const handleResendWebhook = async (req: Request, res: Response) => {
    const payload = JSON.stringify(req.body);
    const headers = req.headers;

    // 1. Verify Signature
    const secret = env.RESEND_WEBHOOK_SECRET;
    if (!secret) {
        console.warn('[Webhooks] RESEND_WEBHOOK_SECRET not configured. Skipping verification.');
    } else {
        try {
            const wh = new Webhook(secret);
            wh.verify(payload, {
                'svix-id': headers['svix-id'] as string,
                'svix-timestamp': headers['svix-timestamp'] as string,
                'svix-signature': headers['svix-signature'] as string,
            });
        } catch (err) {
            console.error('[Webhooks] Signature verification failed:', err);
            return res.status(400).send('Invalid signature');
        }
    }

    // Acknowledge receipt immediately (Resend requirement)
    res.status(200).send('OK');

    // 2. Process Asynchronously
    try {
        const { id, type, data } = req.body;

        // Check for duplicate events
        const existingEvent = await prisma.webhookEvent.findUnique({
            where: { id }
        });

        if (existingEvent) {
            console.log(`[Webhooks] Event ${id} already processed.`);
            return;
        }

        // Log event
        await prisma.webhookEvent.create({
            data: {
                id,
                type,
                data,
            }
        });

        // 3. Handle specific event types
        await processEvent(type, data);

        // Mark as processed
        await prisma.webhookEvent.update({
            where: { id },
            data: { processed: true }
        });

    } catch (err) {
        console.error('[Webhooks] Error processing event:', err);
    }
};

/**
 * Internal processor for different Resend event types.
 */
async function processEvent(type: string, data: Record<string, any>) {
    console.log(`[Webhooks] Processing event type: ${type}`);

    switch (type) {
        case 'email.bounced':
            await handleBounce(data);
            break;
        case 'email.complained':
            await handleComplaint(data);
            break;
        case 'email.delivered':
            console.log(`[Webhooks] Email delivered: ${data.email_id}`);
            break;
        default:
            console.log(`[Webhooks] Unhandled event type: ${type}`);
    }
}

async function handleBounce(data: any) {
    const { email, bounce_type } = data;
    console.warn(`[Webhooks] Email bounced! Target: ${email}, Type: ${bounce_type}`);

    // In a real app, you might:
    // 1. Mark the user/subscriber as "invalid"
    // 2. Notify the admin if it's a hard bounce
}

async function handleComplaint(data: any) {
    const { email } = data;
    console.error(`[Webhooks] Email complaint received! Target: ${email}`);

    // Immediate action: Suppress future emails to this address
}
