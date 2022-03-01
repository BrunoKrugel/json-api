const request = require("supertest");
const app = require("../app");
const sinon = require('sinon');
const axios = require('axios');

test('Ping', async () => {
    await request(app).get("/api/ping").expect(200, {
        success: "true"
    });
});