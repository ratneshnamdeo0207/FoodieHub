const Resturant = require("./models/Resturant")
const Review = require("./models/review.js")
const Item = require("./models/items.js")
const User = require("./models/users.js")

module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.redirectUrl = req.session.returnTo;
    }
    next();
};
module.exports.saveReturnTo = (req, res, next) =>{
    //  console.log(req.query.redirect)
      if(req.query.redirect)
      {
        req.session.returnTo = req.query.redirect
        // console.log(req.session.returnTo)
      }
      next()
}

module.exports.isLogIn = (req, res, next)=>{
    // console.log(req.path, "....", req.originalUrl)
    if(!req.isAuthenticated())
        {
           
            req.session.returnTo = req.originalUrl;
           
            
            return res.redirect("/login");
        }
        next();
}

module.exports.isLogged = (req, res, next)=>{
    // console.log(req.path, "....", req.originalUrl)
    if(req.isAuthenticated())
        {
            console.log("url saved")
            // console.log("Redirect Url: ",req.session.redirectUrl);
            
            return res.redirect("/");
        }
        next();
}

module.exports.isReviewAuthor = async (req, res, next)=>{
    let {id, reviewId}= req.params
    // console.log(id, reviewId)
    let review = await Review.findById(reviewId);
    // console.log(review)
    if(!review.author.equals(res.locals.currUser._id))
    {
        req.flash("error", "You dont have permission to do this")
        return res.redirect(`/show/${id}`)
    }
    next()  
}

module.exports.isOwner = async (req, res, next)=>{
    let id= req.params.id
    // console.log("inside is owner")
    // console.log(id)
    let resturant = await Resturant.findById(id).populate("owner")
    // console.log(resturant)
    if(!resturant.owner._id.equals(res.locals.currUser._id))
    {
        req.flash("error", "You dont have permission to do this")
        return res.redirect(`/show/${id}`)
    }
    next()  
}