const express = require("express")
// Router = express.Router()
const Router = express.Router({ mergeParams: true });
let asyncWrap = require("../utils/asyncWrap.js")
const User = require("../models/users.js")
let { isLogIn, saveRedirectUrl, saveReturnTo, isLogged} = require("../middleware.js")

const multer  = require('multer')
const {storage} = require("../cloudConfig.js")
const upload = multer({ storage })

Router.route("/:id")
  .get(isLogIn, asyncWrap(async(req, res)=>{
    let id = req.params.id
    let user = await User.findById(id).select("-password")  //.select("-password") ensures password is NOT fetched.

    res.render("users/user.ejs", {user})
  }))

  .put(isLogIn, upload.single("profileImage"),asyncWrap(async(req, res)=>{
    let id = req.params.id
    
    req.body.user.addresses = req.body.addresses;
    if(req.file)
    {
      req.body.user.profileImage = {
        url : req.file.path,
        filename : req.file.originalname
      }
    }
      let updatedUser = await User.findOneAndUpdate({_id : id}, req.body.user, {returnDocument: "after", runValidator: true})//.select("-password") ensures password is NOT fetched.
    console.log(updatedUser)
    
    res.render("users/user.ejs", {user : updatedUser})
  }))

Router.route("/:id/edit")
  .get(isLogIn, asyncWrap(async(req, res)=>{
    let id = req.params.id
    let user = await User.findById(id).select("-password")  //.select("-password") ensures password is NOT fetched.

    res.render("users/edit.ejs", {user})
  }))
Router.route("/:id/delete")
  .get(isLogIn, async(req, res)=>{

    let id = req.params.id
    let user = await User.findById(id).select("-password")
    res.render("/users/delete", {user})
  })




module.exports = Router;
