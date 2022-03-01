const request = require("supertest");
const app = require("../app");

test('Ping', async () => {
    await request(app).get("/api/ping").expect(200, {
        success: "true"
    });
});