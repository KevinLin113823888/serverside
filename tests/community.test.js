const app = require('../app.js');
const request = require('supertest');
const mongoose = require("mongoose");
const server = require('../index.js')
const geo = require('./testGeoJson.json');



//TODO: .... mongodb needs to be mocked because all the tests are actual api requests....

describe('Testing user controller', () => {

    let mockCredentials = new mongoose.Types.ObjectId().toString().substring(0,8)
    let recoveryCode = ""
    // console.log(mockCredentials)

    afterAll(() => {
        server.close()
    })

    const agent = request.agent(app);

    test("register and login, loggedIn,", async () => {
        const response0 = await request(app).post("/user/register").send({
            name: mockCredentials,
            username: mockCredentials,
            email: mockCredentials+"@"+"gmail.com",
            password: mockCredentials
        })
        const response1 = await agent.post("/user/login").send({
            username: mockCredentials, //this test MUST log in with proper credentials to work
            password: mockCredentials
        })
        const response2 = await agent.get("/user/loggedIn")

        expect(response1.statusCode).toBe(200)
        expect(response1.body.name).toBeDefined();
        expect(response2.statusCode).toBe(200)
        expect(response2.body.username).toBeDefined();
        expect(response2.body.mapcards).toBeDefined();
    })

    test('get community', async () => {
        const response1 = await agent.get("/community/getCommunity").send({
        })
        expect(response1.statusCode).toBe(200)
        // expect(response1.body.title).toBe(sampleTitle);
        // createdMapId = response1.body.mapCardId
    })


    let createdMapId = ""
    const sampleTitle = mockCredentials
    test('create map', async  () => {
        const response1 =  await agent.post("/map/createMap").send({
            title: sampleTitle
        })
        expect(response1.statusCode).toBe(200)
        expect(response1.body.title).toBe(sampleTitle);
        createdMapId = response1.body.mapCardId
    })

    test('import geo by id', async  () => {
        const response1 =  await agent.post("/map/importMapFileById").send({
            id:createdMapId,
            geoJSONFile: geo
        })
        const body = response1.body
        // console.log(body)
        expect(response1.statusCode).toBe(200)
    })

    test('save geo by id', async  () => {
        const response1 =  await agent.post("/map/saveMapById").send({
            id:createdMapId,
            map: geo
        })
        const body = response1.body
        // console.log(body)
        expect(response1.statusCode).toBe(200)
    })

    test('public map by id', async  () => {
        const response1 =  await agent.post("/map/publishMapById").send({
            id:createdMapId,
        })
        const body = response1.body
        // console.log(body)
        expect(response1.statusCode).toBe(200)
    })

    let communityPreviewId = "";
    test('get community by id', async () => {
        const response1 = await agent.post("/community/getCommunityPreviewById").send({
            id:createdMapId,
        })
        // console.log(response1.body)
        communityPreviewId = response1.body.id;
        expect(response1.body).toBeDefined();
        expect(response1.statusCode).toBe(200)
    })

    // test('fork community by id', async () => {
    //     const response1 = await agent.post("/community/forkCommunityMap").send({
    //         id:createdMapId,
    //         newName: "New name"
    //     })
    //     expect(response1.statusCode).toBe(200)
    // })
    //
    // test('report community by id', async () => {
    //     const response1 = await agent.post("/community/reportCommunityMap").send({
    //         id:createdMapId,
    //         reportMessage: "report message"
    //     })
    //     expect(response1.statusCode).toBe(200)
    // })
    //
    // test('like community by id', async () => {
    //     const response1 = await agent.post("/community/likeCommunityMap").send({
    //         id:createdMapId,
    //     })
    //     // expect(response1.status).toBe('LIKED')
    //     expect(response1.statusCode).toBe(200)
    // })
    //
    // test('dislike community by id', async () => {
    //     const response1 = await agent.post("/community/dislikeCommunityMap").send({
    //         id:createdMapId,
    //     })
    //     expect(response1.statusCode).toBe(200)
    // })

    test('leave comment', async () => {
        const response1 = await agent.post("/community/addComment").send({
            id:communityPreviewId,
            comment:"testing123"
        })
        // console.log(response1.body)
        expect(response1.body).toBeDefined();
        expect(response1.statusCode).toBe(200)
    })

    test('search map', async () => {
        const response1 = await agent.post("/community/searchMap").send({
            searchName:"q"
        })
        // console.log(response1.body)
        expect(response1.body).toBeDefined();
        expect(response1.statusCode).toBe(200)
    })

    test('sort map', async () => {
        const response1 = await agent.post("/community/sortMap").send({
            type:"name"
        })
        // console.log(response1.body)
        expect(response1.body).toBeDefined();
        expect(response1.statusCode).toBe(200)
    })
})