//User entity.
import mongoose from "mongoose";
import Entity from "./entity.js";

export default class User extends Entity {

    static userSchema = new mongoose.Schema({
        first_name: {type: "String", required: true},
        last_name: {type: "String", required: true},
        phone_number: {type: "String", required:true}, 
        email_address: {type: "String", required: true},
        is_admin: {type: "Boolean", default: false, required: true}

    });

    static model = mongoose.model("User", User.userSchema, "Users");
}