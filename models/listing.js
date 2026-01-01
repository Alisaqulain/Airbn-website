const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
    title: {
        type: String,
        required: true
    }, 
    description: String,
    image: {
        url: String, 
        filename: String
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    location: String,
    country: String,
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: "Review"
    }],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true }); // Adds createdAt and updatedAt automatically
// Virtual for average rating
listingSchema.virtual('averageRating').get(function() {
    if (this.reviews && this.reviews.length > 0) {
        const total = this.reviews.reduce((sum, review) => {
            if (typeof review.rating === 'number') {
                return sum + review.rating;
            }
            return sum;
        }, 0);
        return (total / this.reviews.length).toFixed(1);
    }
    return 0;
});

// Ensure virtual fields are serialized
listingSchema.set('toJSON', { virtuals: true });
listingSchema.set('toObject', { virtuals: true });

// Middleware to delete associated reviews when a listing is deleted
listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing && listing.reviews.length) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;