
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const reviewSchema = new Schema({
    comments:String,
    rating:{
        type:Number,
        min:0,
        max:5
    },
    createdAT:{
        type:Date,
        default:Date.now()
    },
    author:{
type:Schema.Types.ObjectId,
ref:"User"
    }
});
module.exports=mongoose.model("Review",reviewSchema)