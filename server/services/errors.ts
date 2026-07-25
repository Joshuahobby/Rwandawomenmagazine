import { Response } from 'express';
import { Prisma } from '@prisma/client';

interface ErrorMessages {
    /** Used for P2002 — a unique constraint was violated. */
    conflict?: string;
    /** Used for P2025 — a required record was not found. */
    notFound?: string;
    /** Used for P2003 — a foreign key points at something that does not exist. */
    badReference?: string;
    /** Used for anything else. */
    fallback: string;
}

/**
 * Maps Prisma's known error codes onto the HTTP status the client can act on.
 *
 * Without this, a duplicate title, a missing article and a stale category id all
 * arrive as an indistinguishable 500, so the UI cannot tell "you did something
 * wrong" from "the server is broken".
 */
export const sendPrismaError = (res: Response, error: unknown, messages: ErrorMessages) => {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
            case 'P2002':
                return res.status(409).json({
                    error: messages.conflict || 'A record with these details already exists',
                });
            case 'P2025':
                return res.status(404).json({
                    error: messages.notFound || 'Record not found',
                });
            case 'P2003':
                return res.status(400).json({
                    error: messages.badReference || 'A referenced record does not exist',
                });
        }
    }

    console.error(`${messages.fallback}:`, error);
    return res.status(500).json({ error: messages.fallback });
};
