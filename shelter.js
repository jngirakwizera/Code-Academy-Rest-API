import mongoose from "mongoose";
import Entity from "./entity.js";

export default class Shelter extends Entity {

    static schema = new mongoose.Schema({
        name: {type: "String", required: true},
        adress: {type: "String", required: true},
        phone: {type: "String", required: true},
        number_of_beds: {type: "Number", required: true},
        beds_available: {type: "Number", required: true}
    });

    static model = mongoose.model("Shelter", Shelter.schema, "Shelters");
}