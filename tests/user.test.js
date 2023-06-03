const app = require('../app.js');
const request = require('supertest');
const mongoose = require("mongoose");
const server = require('../index.js')



//TODO: .... mongodb needs to be mocked because all the tests are actual api requests....

describe('Testing user controller', () => {

    let mockCredentials = new mongoose.Types.ObjectId().toString()
    let recoveryCode = ""
    // mockCredentials = "abc"
    // console.log(mockCredentials)

    afterAll(() => {
        server.close()
    })

    //credentials must not be duplicates
    test("register", async () => {
        const response =  await request(app).post("/user/register").send({
            name: mockCredentials,
            username: mockCredentials,
            email: mockCredentials,
            password: mockCredentials
        })
        // console.log(response)
        expect(response.statusCode).toBe(200)
        expect(response.body.name).toBeDefined();
    })

    test("login, loggedIn, logout cookie tests", async () => {
        const agent = request.agent(app);
        const response1 =  await agent.post("/user/login").send({
            username: mockCredentials, //this test MUST log in with proper credentials to work
            password: mockCredentials
        })
        const response2 =  await agent.get("/user/loggedIn")
        // const response3 =  await request(app).delete("/user/logout")

        expect(response1.statusCode).toBe(200)
        expect(response1.body.name).toBeDefined();

        expect(response2.statusCode).toBe(200)
        expect(response2.body.username).toBeDefined();
        expect(response2.body.mapcards).toBeDefined();

        // expect(response3.statusCode).toBe(200)

    })

    // test("login", async () => {
    //     const response =  await request(app).post("/user/login").send({
    //         // name: mockCredentials,
    //         username: mockCredentials,
    //         // email: mockCredentials,
    //         password: mockCredentials
    //     })
    //     console.log(response)
    //     expect(response.statusCode).toBe(200)
    // })
    // test("logout", async () => {
    //     const response =  await request(app).post("/user/logout").send({
    //         // name: mockCredentials,
    //         // username: mockCredentials,
    //         // email: mockCredentials,
    //         // password: mockCredentials
    //     })
    //     console.log(response)
    //     expect(response.statusCode).toBe(200)
    // })

    // test("forgotUsername", async () => {
    //     const response =  await request(app).post("/user/forgotUsername").send({
    //         // name: mockCredentials,
    //         // username: mockCredentials,
    //         email: mockCredentials,
    //         // password: mockCredentials
    //     })
    //     // console.log(response)
    //     expect(response.statusCode).toBe(200)
    //     expect(response.body.username).toBeDefined();

    // })

    // test("sendPasswordRecoveryCode", async () => {
    //     const response =  await request(app).post("/user/sendPasswordRecoveryCode").send({
    //         // name: mockCredentials username: mockCredentials,
    //         email: mockCredentials,
    //         // password: mockCredentials
    //     })
    //     // console.log(response.body.passwordRecoveryCode)
    //     expect(response.statusCode).toBe(200)
    //     expect(response.body.passwordRecoveryCode).toBeDefined();

    //     recoveryCode = response.body.passwordRecoveryCode
    // })

    // test("changePassword", async () => {
    //     const response =  await request(app).put("/user/changePassword").send({
    //         // name: mockCredentials,
    //         // username: mockCredentials,
    //         email: mockCredentials,
    //         passwordRecoveryCode: recoveryCode,
    //         password: "new password idk"
    //     })
    //     // console.log(response)
    //     expect(response.statusCode).toBe(200)
    // })


});




