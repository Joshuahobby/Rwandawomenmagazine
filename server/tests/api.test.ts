import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';


// These hit a real remote Neon instance, so a cold connection plus an
// unindexed query can take well over 10s. Timeouts are generous on purpose:
// a gate that flakes gets ignored, which defeats the point of having one.
const REMOTE_DB_TIMEOUT = 30000;

describe('API Smoke Tests', () => {
    it('GET /api/health should return ok', async () => {
        const response = await request(app).get('/api/health');
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('ok');
    }, REMOTE_DB_TIMEOUT);

    it('GET /api/articles should return a list of articles', async () => {
        const response = await request(app).get('/api/articles');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body.articles)).toBe(true);
    }, REMOTE_DB_TIMEOUT);

    it('GET /api/categories should return a list of categories', async () => {
        const response = await request(app).get('/api/categories');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    }, REMOTE_DB_TIMEOUT);
});
