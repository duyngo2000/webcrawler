const request = require("supertest");
const app = require("../app");
const mongoose = require('mongoose')
require("dotenv").config();
const connectDb = require("../database");
beforeAll(async () => {
    connectDb().then(async (response) => {
        console.log("Connect database success!");
        const lastInfor = await information.find().sort({ _id: -1 }).limit(1);
        const index = lastInfor[0] ? lastInfor[0]._id || 0 : 0;
        crawler(index)
          .then((response) => {
            setInterval(() => {
              (async () => {
                const lastInfor = await information.find({}).sort({ _id: -1 }).limit(1);
                const index = lastInfor[0]._id
                crawler(index);
              })()
            }, 1800000)
          })
          .catch((error) => {
            console.log(error);
          });
      });
})

jest.mock("../app");

describe("Test server", ()=>{
    jest.useFakeTimers();
    it("Test /", async ()=>{
        request(app).get("/").expect(200);
        
    })
    it("Test /getdata",async ()=>{
        request(app).get("/getdata").expect(200);
    })
    it("Test /totalpage", async ()=>{
        request(app).get("/totalpage").expect(200);
    })
    it("Test /getbyname _name='phuoclong'",async()=>{
        request(app).get("/getbyname?_name=phuoclong").expect(200);
    })
    it("Test /getbyid _id='83290'",async()=>{
        request(app).get("/getbyid?_id=83290").expect(200);
    })
    
    it("Test not found resource", async ()=>{
        request(app).get("/notfound").expect(404);
    })
})