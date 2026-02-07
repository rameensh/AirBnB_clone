const express = require("express");
const app = express();
const Listing = require("./models/listing.js");
const methodOverride = require("method-override");

// new package learn (ejs-mate)
const ejsMate = require("ejs-mate");

// middlewares
const path = require("path");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
// to use static files
app.use(express.static(path.join(__dirname, "/public")));

const wrapAsync = require("./util/wrapAsync.js");
const ExpressError = require("./util/ExpressError.js");
const { listingSchema } = require("./schema.js");

// mongoose connection
const mongoose = require("mongoose");
main().then(() => {
    console.log("connected to  DB");
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/AirBnB');
}

app.get("/testListing",wrapAsync( async (req, res) => {
    let sampleListing = new Listing({
        title : "home",
        description : "By the beach",
        price: 1200,
        location : "Goa",
        country: "India"
    });
    await sampleListing.save();
    console.log("sample was saved");
    res.send("successfull");
}));

// converting joi in to a middleware
const validateListing = (req, res, next)=>{
    let {error} = listingSchema.validate(req.body);
    if(error){
        // throw new ExpressError(400, error);
        const msg = error.details.map(el => el.message).join(','); // Extract meaningful error messages
        throw new ExpressError(400, msg); // Properly formatted error
    }else{
        next();
    }
}

// index route
app.get("/listings", wrapAsync (async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings});
}));

// Route to create new Listing (form)
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
})

// add a created route at index route
app.post("/listings", validateListing, wrapAsync(async (req, res, next) =>{
        // way 1 // let {title, description, image, price, country, location} = req.body;
    // let listing = req.body.listing;
    // or more  better way
    // if(!req.body.listing){
    //     throw new ExpressError(400, "Send Valid data for listing");
    // }
    // let result = listingSchema.validate(req.body);
    // console.log(result);
    // if(result.error){
    //     throw new ExpressError(400, result.error);
    // }
    const newListing = new Listing(req.body.listing);
    // if(!newListing.title){
    //     throw new ExpressError(400, "title missing");
    // }
    // if(!newListing.description){
    //     throw new ExpressError(400, "Description missing");
    // }
    // if(!newListing.location){
    //     throw new ExpressError(400, "location missing");
    // }
    // if(!newListing.country){
    //     throw new ExpressError(400, "countrymissing");
    // }
    await newListing.save();
    res.redirect("/listings");
}));

// Edit route 
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
}));

//rout to show edited part which is the update route
app.put("/listings/:id",validateListing, wrapAsync(async(req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    res.redirect("/listings");
}));

// Delete route
app.delete("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
}));

// show route based on particular id
app.get("/listings/:id", wrapAsync(async (req, res)=>{
    let { id } = req.params;
    const showListing = await Listing.findById(id);
    res.render("listings/show.ejs", { showListing });
}));

// root route
app.get("/", (req, res) => {
    res.send("this is root page");
});

// If user goes to any route which doesn't exist than the user should recieve an error
app.use((req, res, next) => {
    next(new ExpressError(404, "Page not found"));
});

// a middleware to handle error
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something Went Wrong !" } = err;
    // res.status(statusCode).send(message);
    // res.render("error.ejs", {message});
    res.status(statusCode).render("error.ejs", {err});
})

app.listen(8080, () => {
    console.log("listenong to port 8080");
});

