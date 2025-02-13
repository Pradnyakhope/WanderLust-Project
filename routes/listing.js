const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema, reviewSchema} = require("../schema.js");

const listingController = require("../controllers/listing.js");

const validateListing = (req,res,next) =>{
    let {error} = listingSchema.validate(req.body);
    
    if(error) {
      let errMsg = error.details.map((el) => el.message).join(",");
      throw new ExpressError(400,error);
    } else {
      next();
    }
  };

//Index Route
router.get("/", wrapAsync(listingController.index));
  
//New Route
router.get("/new", listingController.renderNewForm);
  
//Show Route
router.get("/:id", wrapAsync(listingController.showListing));

//Create Route
router.post("/", validateListing, wrapAsync(listingController.createListing));

//Edit Route
router.get("/:id/edit", wrapAsync(listingController.renderEditForm));

//Update Route
router.put("/:id",validateListing, wrapAsync(listingController.updateListing));

//Delete Route
router.delete("/:id", wrapAsync(listingController.destroyListing));

module.exports = router;