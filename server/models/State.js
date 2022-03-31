const mongoose = require("mongoose");
const CellSchema = new mongoose.Schema({
    focused:{
        type:Boolean,
        default:false
    },
    captured:{
        type:Boolean,
        default:false
    }
});

const StateSchema = new mongoose.Schema({
    state: [[CellSchema]],
});

const State = mongoose.model('states', StateSchema);

module.exports = State;
