const express = require("express")
// Router = express.Router()
const Router = express.Router({ mergeParams: true });

let { isLogIn, isOwner} = require("../middleware.js")

const multer  = require('multer')
const {storage} = require("../cloudConfig.js")
const upload = multer({ storage })

let asyncWrap = require("../utils/asyncWrap.js")

const Item = require("../models/items.js")
const Resturant = require("../models/Resturant.js")



Router.route("/")
    .post( isLogIn, isOwner, upload.single("image") ,asyncWrap(async(req, res)=>{
            let id = req.params.id
            let item = req.body.item
            let resturant = await Resturant.findById(id)
            let newItem = new Item(item)
            newItem.resturant = resturant
            newItem.image = {
              url : req.file.path,
              filename : req.file.originalname
            };  
            newItem = await newItem.save()
            // console.log(newItem)
        
            res.redirect(`/show/${id}`)
        
        }))

Router.put("/:itemId", asyncWrap(async(req, res)=>{
          let {id, itemId} = req.params
          // console.log(id)
      // console.log(itemId)
      // console.log(req.body.item)
      
      let item = await Item.findOneAndUpdate({_id: itemId}, req.body.item, {returnDocument: "after", runValidator: true})
      
    //   console.log(item)
      
      res.redirect(`/show/${id}`)
    }))
    
Router.delete("/:itemId",  asyncWrap(async(req, res)=>{
  let {id, itemId} = req.params
  // console.log(id)
  // console.log(itemId)
  // console.log(req.body.item)
  
  
  await Item.findByIdAndDelete(itemId)
  
  res.redirect(`/show/${id}`)
}))

module.exports = Router