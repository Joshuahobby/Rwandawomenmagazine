import { Request, Response } from 'express';
import prisma from '../config/db';
import { sendNominationNotification } from '../services/mail.service';

/**
 * Get all global settings.
 */
export const getSettings = async (_req: Request, res: Response) => {
    try {
        const settings = await prisma.globalSetting.findMany();
        // Convert to a more usable object
        const settingsMap = settings.reduce((acc, curr) => ({
            ...acc,
            [curr.key]: curr.value
        }), {});

        res.json(settingsMap);
    } catch {
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
};

/**
 * Update a global setting.
 */
export const updateSetting = async (req: Request, res: Response) => {
    const { key, value } = req.body;

    if (!key) return res.status(400).json({ error: 'Key is required' });

    try {
        const setting = await prisma.globalSetting.upsert({
            where: { key },
            update: { value },
            create: { key, value }
        });
        res.json(setting);
    } catch {
        res.status(500).json({ error: 'Failed to update setting' });
    }
};

/**
 * Send a test nomination email to the current admin address.
 */
export const sendTestEmail = async (_req: Request, res: Response) => {
    try {
        const mockNomination = {
            id: 0, // Mock ID
            nomineeName: 'Test Nominee (Antigravity)',
            nomineeOrganization: 'RWM Test Lab',
            category: { name: 'Technical Excellence Award' },
            nominatorName: 'Antigravity AI Test System'
        };

        await sendNominationNotification(mockNomination);
        res.json({ message: 'Test email sent successfully' });
    } catch (error) {
        console.error('[SettingsController] Test email failed:', error);
        res.status(500).json({ error: 'Failed to send test email' });
    }
};
