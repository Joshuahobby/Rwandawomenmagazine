import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';

/**
 * Access-control coverage for the article pipeline.
 *
 * Every case here is a rejection or a read, so the suite never writes to the
 * database it is pointed at.
 */
describe('Article access control', () => {
    it('rejects article creation without a token', async () => {
        const res = await request(app)
            .post('/api/articles')
            .send({ title: 'Unauthorized', categoryId: 1 });

        expect(res.status).toBe(401);
    });

    it('rejects an update without a token', async () => {
        const res = await request(app)
            .put('/api/articles/00000000-0000-0000-0000-000000000000')
            .send({ title: 'Unauthorized' });

        expect(res.status).toBe(401);
    });

    it('rejects a status change without a token', async () => {
        const res = await request(app)
            .patch('/api/articles/00000000-0000-0000-0000-000000000000/status')
            .send({ status: 'published' });

        expect(res.status).toBe(401);
    });

    it('does not expose drafts to anonymous callers', async () => {
        // Regression: ?status=draft was an unauthenticated read of every
        // unpublished article, with full content.
        for (const status of ['draft', 'review', 'archived', 'all']) {
            const res = await request(app).get(`/api/articles?status=${status}`);
            expect(res.status).toBe(401);
            expect(res.body.articles).toBeUndefined();
        }
    }, 20000);

    it('still serves the published list anonymously', async () => {
        const res = await request(app).get('/api/articles');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.articles)).toBe(true);
    }, 20000);

    it('rejects an unknown status filter with 400, not 500', async () => {
        // Regression: the unchecked cast reached Prisma, which threw, and the
        // catch returned 500 with the raw error message attached.
        const res = await request(app).get('/api/articles?status=bogus');
        expect(res.status).toBe(400);
        expect(res.body.details).toBeUndefined();
    });

    it('clamps a negative page instead of erroring', async () => {
        // Regression: page=-2 produced a negative skip, which Prisma rejects.
        const res = await request(app).get('/api/articles?page=-2');
        expect(res.status).toBe(200);
        expect(res.body.pagination.page).toBe(1);
    }, 20000);

    it('no longer exposes public self-registration', async () => {
        // Regression: this endpoint accepted a caller-chosen roleId.
        const res = await request(app)
            .post('/api/auth/register')
            .send({ fullName: 'Attacker', email: 'a@example.com', password: 'password123', roleId: 1 });

        expect(res.status).toBe(404);
    });
});
