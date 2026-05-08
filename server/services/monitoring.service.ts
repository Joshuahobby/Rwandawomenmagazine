import * as Sentry from '@sentry/node';
import { env } from '../config/env';

export const initMonitoring = () => {
    const dsn = process.env.SENTRY_DSN;

    if (!dsn) {
        console.warn('⚠️ [MONITORING] SENTRY_DSN not found. Error tracking disabled.');
        return;
    }

    Sentry.init({
        dsn,
        environment: env.NODE_ENV,
        tracesSampleRate: 1.0,
    });

    console.log('✅ [MONITORING] Sentry initialized.');
};

export const setupErrorHandler = (app: any) => {
    if (process.env.SENTRY_DSN) {
        Sentry.setupExpressErrorHandler(app);
    }
};

export const captureException = (error: any) => {
    console.error(error);
    if (process.env.SENTRY_DSN) {
        Sentry.captureException(error);
    }
};
