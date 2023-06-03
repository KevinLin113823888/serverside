const app = require('../app.js');
const request = require('supertest');
const mongoose = require("mongoose");
const server = require('../index.js')
const geo = require('./testGeoJson.json');



//TODO: .... mongodb needs to be mocked because all the tests are actual api requests....

describe('Testing user controller', () => {

    let mockCredentials = new mongoose.Types.ObjectId().toString()
    let recoveryCode = ""
    // mockCredentials = "abc"
    // console.log(mockCredentials)

    afterAll(() => {
        server.close()
    })

    const agent = request.agent(app);

    test("register and login, loggedIn,", async () => {
        const response0 =  await request(app).post("/user/register").send({
            name: mockCredentials,
            username: mockCredentials,
            email: mockCredentials,
            password: mockCredentials
        })
        const response1 =  await agent.post("/user/login").send({
            username: mockCredentials, //this test MUST log in with proper credentials to work
            password: mockCredentials
        })
        const response2 =  await agent.get("/user/loggedIn")

        expect(response1.statusCode).toBe(200)
        expect(response1.body.name).toBeDefined();
        expect(response2.statusCode).toBe(200)
        expect(response2.body.username).toBeDefined();
        expect(response2.body.mapcards).toBeDefined();
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

    test('get map', async  () => {
        const response1 =  await agent.post("/map/getMapById").send({
            id:createdMapId
        })
        const body = response1.body
        // console.log(body)
        expect(response1.statusCode).toBe(200)
        expect(body.title).toBe(sampleTitle);
    })

    test('duplicate map', async  () => {
        const response1 =  await agent.post("/map/duplicateMapById").send({
            id:createdMapId,
            newName: sampleTitle+"Duplicated"
        })
        const body = response1.body
        // console.log(body)
        expect(response1.statusCode).toBe(200)
    })

    test('change map by id', async  () => {
        const response1 =  await agent.post("/map/changeMapNameById").send({
            id:createdMapId,
            newName: sampleTitle+"Changed"
        })
        const body = response1.body
        // console.log(body)
        expect(body.name).toBe(sampleTitle+"Changed")
        expect(response1.statusCode).toBe(200)
    })

    test('public map by id', async  () => {
        const response1 =  await agent.post("/map/publishMapById").send({
            id:createdMapId,
            newMapName: sampleTitle+"Duplicated"
        })
        const body = response1.body
        // console.log(body)
        expect(response1.statusCode).toBe(200)
    })

    test('classication by id', async  () => {
        const response1 =  await agent.post("/map/mapClassificationById").send({
            id:createdMapId,
            classifications: "Mockclassification"
        })
        const body = response1.body
        // console.log(body)
        // console.log("classification message")
        // console.log(body.message)
        // expect(response1.statusCode).toBe(200)
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

    test('set map image by id', async  () => {
        const response1 =  await agent.post("/map/setMapImageById").send({
            id:createdMapId,
            image: "a",
            type: "a",
        })
        const body = response1.body
        // console.log(body)
        expect(response1.statusCode).toBe(200)
    })

    test('get map image by id', async () => {
        const response1 =  await agent.post("/map/getMapImageById").send({
            id:createdMapId,
        })
        const body = response1.body
        // console.log(body)
        expect(body.image).toBe("a")
        expect(response1.statusCode).toBe(200)
    })

    test('search map', async () => {
        const response1 = await agent.post("/map/searchMap").send({
            searchName:"q"
        })
        // console.log(response1.body)
        expect(response1.body).toBeDefined();
        expect(response1.statusCode).toBe(200)
    })

    test('sort map', async () => {
        const response1 = await agent.post("/map/sortMap").send({
            type:"name"
        })
        // console.log(response1.body)
        expect(response1.body).toBeDefined();
        expect(response1.statusCode).toBe(200)
    })
});




