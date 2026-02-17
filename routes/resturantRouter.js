const express = require("express")
Router = express.Router()

const Resturant = require("../models/Resturant.js")
const Item = require("../models/items.js")


let asyncWrap = require("../utils/asyncWrap.js")

const multer  = require('multer')
const {storage} = require("../cloudConfig.js")
const upload = multer({ storage })

let { isLogIn} = require("../middleware.js")


Router.route("/")
    .get(asyncWrap(async (req, res)=>{
        let resturants = await Resturant.find({});
        // console.log(resturants)
        category = "all"
        rating = "all"
        res.render("resturants.ejs", {resturants, category, rating})
    }))
    .post(isLogIn, upload.single("images"), asyncWrap(async(req, res)=>{
        let resturant = req.body.resturant
        let items = req.body.items
        console.log("inside route")
        console.log(req.file)
        // console.log(resturant)
        // console.log(items)
        resturant.rating = 0;
        resturant.owner = req.user;
        resturant.image = {
            url : req.file.path,
            filename : req.file.originalname
        };
        
        let newResturant = new Resturant(resturant)
        newResturant = await newResturant.save()
        console.log(newResturant)
        
        if(items)
        {
            for(let item of items)
            {
            let newItem = new Item(item)
            newItem.resturant = newResturant
            await newItem.save()
            console.log(item)

            }
        }

        res.redirect("/resturants")
    }))

Router.get("/new", (req, res)=>{
        res.render("new-resturant.ejs")
    })

module.exports = Router