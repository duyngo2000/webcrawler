const express = require("express");
const router = express.Router();
const information = require("../models/information.model");
const getTotalPage = async() => {
    return await information.find({}).count();
}
router.get("/getdata", async(req, res) => {
    const { _page } = req.query;
    const response = await getTotalPage();
    const inforCompanies = await information.find({}).sort({ _id: -1 }).skip((_page - 1) * 20).limit(20).populate("extensionId");
    console.log();
    res.send({
        _page,
        totalPage: Math.ceil(response / 20),
        infor: [...inforCompanies]
    })
})
router.get("/getbyname", async(req, res) => {
    const { _name } = req.query;
    const regex = new RegExp(_name, "i");
    const companies = await information.find({ name: regex }).populate("extensionId");
    const total = companies.length;
    res.send({
        total,
        companies: [...companies]
    });

})
router.get("/getbyid", async(req, res) => {
    const { _id } = req.query;
    const company = await information.findOne({ _id }).populate("extensionId");
    res.send({
        company
    })

})
router.get("/totalpage", async(req, res) => {
    const response = await getTotalPage();
    if (response !== null) {
        res.status(200).send({
            totalPage: Math.ceil(response / 20)
        })
    } else {
        res.status(500).send("Server error!");
    }
})
router.post("");
module.exports = router;