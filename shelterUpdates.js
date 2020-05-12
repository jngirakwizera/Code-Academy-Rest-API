import mongoose from "mongoose";
import Entity from "./entity.js";

export default class ShelterUpdate extends Entity {

    static schema = new mongoose.Schema({
        beds_update: {type: "Number", required: true},
        date_changed: {type: "Date", default:Date.now, required: true},
        shelter_id: {type: mongoose.Schema.Types.ObjectId, ref:'Shelter', required: true}

    });

    static model = mongoose.model("ShelterUpdate", ShelterUpdate.schema, "ShelterUpdates");
}