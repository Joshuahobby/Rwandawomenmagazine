import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';


describe('API Smoke Tests', () => {
    // Generous timeout: this opens the first connection to a remote Neon
    // instance, which can exceed the 5s default from cold.
    it('GET /api/health should return ok', async () => {
        const response = await request(app).get('/api/health');
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('ok');
    }, 15000);

    it('GET /api/articles should return a list of articles', async () => {
        const response = await request(app).get('/api/articles');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body.articles)).toBe(true);
    }, 15000);

    it('GET /api/categories should return a list of categories', async () => {
        const response = await request(app).get('/api/categories');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });
});
