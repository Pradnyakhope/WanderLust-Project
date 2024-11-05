const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const Review = require("./models/review.js");
const Session = require("express-session");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter =  require("./routes/listing.js");
const reviewRouter =  require("./routes/review.js");
const wrapAsync = require("./utils/wrapAsync.js");
const userRouter = require("./routes/user.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

 app.set("view engine", "ejs");
 app.set("views", path.join(__dirname, "views"));
 app.use(express.urlencoded({ extended: true }));
 app.use(methodOverride("_method"));
 app.engine('ejs',ejsMate);
 app.use(express.static(path.join(__dirname,"/public")));

app.get("/", (req, res) => {
  res.send("Hi, I am root");
});

app.use(Session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/demouser", async(req,res) =>{
  let fakeUser = new User({
    email:"student@gmail.com",
    username:"delta-student"
  });

   let registeredUser = await User.register(fakeUser,"helloworld");
   res.send(registeredUser);
})

app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);

// app.get("/listings",(req,res) =>{
//   Listing.find({}).then((res) =>{
//     console.log(res);
//   });
// });

// Reviews

// Delete Review Route
app.delete(
  "/listings/:id/reviews/reviewId",
  wrapAsync(async(req,res) =>{
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
  })
);
// Post Route
app.post("/listings/:id/reviews",async(req,res)=>{
  let listing = await Listing.findById(req.params.id);
  let newReview = new Review(req.body.review);

  listing.reviews.push(newReview);

  await newReview.save();
  await listing.save();

  res.redirect(`/listings/${listing._id}`);
});

// app.get("/testListing", async (req, res) => {
//   let sampleListing = new Listing({
//     title: "My New Villa",
//     description: "By the beach",
//     image:"https://images.unsplash.com/photo-1617859047452-8510bcf207fd?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmVzb3J0c3xlbnwwfHwwfHx8MA%3D%3D",
//     price: 1200,
//     location: "Calangute, Goa",
//     country: "India",
//   });

//   await sampleListing.save();
//   console.log("sample was saved");
//   res.send("successful testing");
// });

app.all("*",(req,res,next) =>{
  next(new ExpressError(404, "Page not found!"));
});

app.use((err, req,res,next) =>{
  let {statusCode = 500, message="Something went wrong!"} = err;
  res.render("error.ejs",{message});
  //res.status(statusCode).send(message);
  //res.send("Something went wrong");
});

app.listen(8080, () => {
  console.log("server is listening to port 8080");
});