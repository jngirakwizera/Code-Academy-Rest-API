import mongoose from "mongoose";
import Entity from "./entity.js";

export default class ShelterUser extends Entity {


    static schema = new mongoose.Schema({
        user_id: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
        shelter_id: {type: mongoose.Schema.Types.ObjectId, ref:'Shelter', required: true}
    });

    static model = mongoose.model("ShelterUser", ShelterUser.schema, "ShelterUsers");
}