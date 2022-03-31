const mongoose = require('mongoose');

const connectDB = async()=>{
    await mongoose.connect('mongodb+srv://kaushtav:GpSWeanR2xaJ2eS@amazon-clone.ssahw.mongodb.net/amazon_data?retryWrites=true&w=majority');
    console.log("MongoDB Connected")
};

module.exports = connectDB;
