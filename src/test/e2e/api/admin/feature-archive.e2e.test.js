'use strict';

const { setupApp } = require('../../helpers/test-helper');
const dbInit = require('../../helpers/database-init');
const getLogger = require('../../../fixtures/no-logger');

let app;
let db;

beforeAll(async () => {
    db = await dbInit('archive_serial', getLogger);
    app = await setupApp(db.stores);
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('returns three archived toggles', async () => {
    expect.assertions(1);
    return app.request
        .get('/api/admin/archive/features')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(res => {
            expect(res.body.features.length === 3).toBe(true);
        });
});

test('revives a feature by name', async () => {
    expect.assertions(0);
    return app.request
        .post('/api/admin/archive/revive/featureArchivedX')
        .set('Content-Type', 'application/json')
        .expect(200);
});

test('archived feature is not accessible via /features/:featureName', async () => {
    expect.assertions(0);

    return app.request
        .get('/api/admin/features/featureArchivedZ')
        .set('Content-Type', 'application/json')
        .expect(404);
});

test('must set name when reviving toggle', async () => {
    expect.assertions(0);
    return app.request.post('/api/admin/archive/revive/').expect(404);
});

test('should be allowed to reuse deleted toggle name', async () => {
    expect.assertions(3);
    await app.request
        .post('/api/admin/features')
        .send({
            name: 'really.delete.feature',
            enabled: false,
            strategies: [{ name: 'default' }],
        })
        .set('Content-Type', 'application/json')
        .expect(201)
        .expect(res => {
            expect(res.body.name).toBe('really.delete.feature');
            expect(res.body.enabled).toBe(false);
            expect(res.body.createdAt).toBeTruthy();
        });
    await app.request
        .delete(`/api/admin/features/really.delete.feature`)
        .expect(200);
    await app.request
        .delete(`/api/admin/archive/really.delete.feature`)
        .expect(200);
    return app.request
        .post(`/api/admin/features/validate`)
        .send({ name: 'really.delete.feature' })
        .set('Content-Type', 'application/json')
        .expect(200);
});
test('Deleting an unarchived toggle should not take effect', async () => {
    expect.assertions(3);
    await app.request
        .post('/api/admin/features')
        .send({
            name: 'really.delete.feature',
            enabled: false,
            strategies: [{ name: 'default' }],
        })
        .set('Content-Type', 'application/json')
        .expect(201)
        .expect(res => {
            expect(res.body.name).toBe('really.delete.feature');
            expect(res.body.enabled).toBe(false);
            expect(res.body.createdAt).toBeTruthy();
        });
    await app.request
        .delete(`/api/admin/archive/really.delete.feature`)
        .expect(200);
    return app.request
        .post(`/api/admin/features/validate`)
        .send({ name: 'really.delete.feature' })
        .set('Content-Type', 'application/json')
        .expect(409); // because it still exists
});
