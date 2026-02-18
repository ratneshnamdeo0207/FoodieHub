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
        res.render("resturants/resturants.ejs", {resturants, category, rating})
    }))
    .post(isLogIn, upload.fields([{name: "images", maxCount:10}, {name: "itemImage", maxCount: 1}]), asyncWrap(async(req, res)=>{
        let resturant = req.body.resturant
        let item = req.body.item
        console.log("inside route")
        // console.log(req.file)
        // console.log(resturant)
        // console.log(items)
        resturant.rating = 0;
        resturant.owner = req.user;
        resturant.images = []
        for(let file of req.files.images){

            let image = {
                url : file.path,
                filename : file.originalname
            };
            resturant.images.push(image)
        }
        
        let newResturant = new Resturant(resturant)
        newResturant = await newResturant.save()
        console.log(newResturant)
        
        if(item && req.files.itemImage)
        {
           
            let newItem = new Item(item)
            newItem.resturant = newResturant
            newItem.image = {
                url : req.files.itemImage[0].path,
                filename : req.files.itemImage[0].originalname
            };
            await newItem.save()
            console.log(item)

            
        }

        res.redirect("/resturants")
    }))

Router.get("/new", isLogIn, (req, res)=>{
        res.render("resturants/new-resturant.ejs")
    })

module.exports = Router