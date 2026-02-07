const mongoose = require("mongoose");
let Schema = mongoose.Schema;

const listingSchema = new Schema({
    title : {
        type: String,
        required: true
    },
    description: {
        type : String
    },
    image: {
        type: String,
        default: "https://unsplash.com/photos/seashore-during-golden-hour-KMn4VEeEPR8",
        // here we will be using set method to give default value to image
        set: (v) =>
            (v === "") ? "https://unsplash.com/photos/seashore-during-golden-hour-KMn4VEeEPR8" : v,
    },
    price: Number,
    location: String,
    country: String
});

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;