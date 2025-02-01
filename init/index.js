const mongoose = require('mongoose');
const init = require("./data.js");
const Listing = require("../models/listing.js")
const MONGO_URL = "mongodb://127.0.0.1:27017/make"
main().then(() => {
    console.log("db connected")
})
    .catch((err) => {
        console.log(err);
    })
async function main() {
    await mongoose.connect(MONGO_URL)
}


const initDB = async () => {
    await Listing.deleteMany({});
    console.log("data save succesly")
    init.data = init.data.map((obj) => ({
     ...obj,
     owner: "6765822090941333bcdb60c8"}))
    await Listing.insertMany(init.data)

    console.log("data save succesly")


    // console.log("hello")
}
initDB();