const express = require("express")
// Router = express.Router()
const Router = express.Router({ mergeParams: true });

Router.route("/")
    .post( isLogIn,  asyncWrap(async(req, res)=>{
      let review = req.body.review;
      let id = req.params.id;
      // console.log(id)
      let resturant = await Resturant.findById(id).populate("reviews")
      
      let newReview = new Review(review)
      newReview.author = req.user;
      resturant.reviews.push(newReview)
      
      await newReview.save()
      // await resturant.save()
      
      let avg = 0, total = 0;
      if(resturant.reviews)
        {
          for(let r of resturant.reviews)
            {
              total += r.rating
            }
          }
          avg = total/resturant.reviews.length
          //  console.log(avg)
          avg = avg.toFixed(1)
          resturant.rating = avg
          await resturant.save()
          //  console.log(resturant)
          // console.log("REview accepted")
          req.flash("success", "Thanks! for your review")
          res.redirect(`/show/${id}`)
        }))
Router.route("/:reviewId")
    .put(isLogIn, isReviewAuthor ,asyncWrap( async(req, res)=>{
          let {id, reviewId} = req.params
          // console.log(id)
          // console.log(reviewId)
          let review = req.body.review;
          // console.log(review)
          let updatedReview = await Review.findOneAndUpdate({_id : reviewId}, req.body.review, {returnDocument: "after", runValidator: true})
          // console.log(updatedReview)
          res.redirect(`/show/${id}`)
          
        }))

        .delete("/",isLogIn, asyncWrap( async(req, res)=>{
              let {id, reviewId} = req.params
              // console.log(id)
              // console.log(reviewId)
              // whenever we try to delete a review then first we must make sure that its ref must be removed from the array of reviews that is stored inside the resturant and for doing that we use pull operate to remove the ref from the array of review that is stored inside the resturant
              let resturant = await Resturant.findByIdAndUpdate(id, {$pull :{ reviews: reviewId}})
              
              await Review.findByIdAndDelete(reviewId)
              
              // console.log("Review Deleted Successfully")
              req.flash("success", "Review Deleted Successfully")
              res.redirect(`/show/${id}`)
              
            }))

    