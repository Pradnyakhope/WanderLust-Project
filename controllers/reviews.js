const Listing = require("../models/listing");
const Review = require("../models/review");

module.exports.createReview = async(req,res)=>{
    console.log(req.params.id);
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
  
    listing.reviews.push(newReview);
  
    await newReview.save();
    await listing.save();
  
    console.log("new review saved");
    //res.send("new review saved");
    res.redirect(`/listings/${listing._id}`);
};

module.exports.destroyReview = async(req,res) =>{
    let {id,reviewId } = req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{review:reviewId}})
    await Review.findByIdAndDelete(reviewId);
  
    res.redirect(`/listings/${id}`);
};