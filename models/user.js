const mongoose = require('mongoose');
const Schema = mongoose.Schema; 
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    wishlist: [{
        type: Schema.Types.ObjectId,
        ref: "Listing"
    }],
    profile: {
        fullName: String,
        bio: String,
        avatar: String,
        phone: String,
        location: String
    }
}, { timestamps: true });

userSchema.plugin(passportLocalMongoose);  
module.exports = mongoose.model("User", userSchema);    