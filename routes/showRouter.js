const express = require("express")
// Router = express.Router()
const Router = express.Router({ mergeParams: true });

let asyncWrap = require("../utils/asyncWrap.js")

let { isLogIn, isOwner} = require("../middleware.js")

const Resturant = require("../models/Resturant.js")
const Item = require("../models/items.js")


Router.route("/")
    .get(asyncWrap(async (req, res)=>{
        let id = req.params.id;
        // console.log(id)
        // resturant - owner (ref)
        //           - reviews (array of ref) - author (ref) - ref
        let rest = await Resturant
        .findById(id)
        .populate("owner")
        .populate({path: "reviews", populate: {path: "author"}});
       
        // console.log(rest)
        let items = await Item.find({resturant: id})
        // console.log(items)
        // console.log(rest)
        res.render("shows/show.ejs",  { rest, items})
    }))
Router.delete("/", isLogIn, isOwner, async (req, res)=>{
          let id = req.params.id;
    //  console.log(id)
        await Resturant.findByIdAndDelete(id)
        req.flash("success", "Resturant deleted successfully")
        res.redirect(`/resturants`)
    
        })
Router.route("/edit")
    .get( isLogIn, async (req, res) => {
      let id = req.params.id;
      // console.log(id)
      let rest = await Resturant.findById(id)
      // console.log(rest)
      res.render("shows/edit.ejs", {rest});
    })
    .put(async (req, res)=>{
          let resturant = req.body.resturant;
          // console.log(resturant)
          let id = req.params.id;
          // console.log(id)
          let rest = await Resturant.findById(id)
          let updatedResturant = await Resturant.findOneAndUpdate({_id: id}, req.body.resturant, {returnDocument: "after", runValidator: true})
          // console.log(updatedResturant)
          // console.log("Updation Successful")
          res.redirect(`/show/${id}`)
          
        })
module.exports = Router