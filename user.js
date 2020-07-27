//User entity.
import mongoose from "mongoose";
import Entity from "./entity.js";
//import bcrypt for encryption
import bcrypt from 'bcrypt';

export default class User extends Entity {

    static userSchema = new mongoose.Schema({
        first_name: {type: "String", required: true},
        last_name: {type: "String", required: true},
        phone_number: {type: "String", required:true}, 
        email_address: {type: "String", required: true},
        password: {type: "String", required: true},
        salt: {type: "String", required: true},
        creationDate: {type: "Date", default: Date.now, required: true},
        is_admin: {type: "Boolean", default: false, required: true}

    });


    static async generateHash(theString) {
        // use bcrypt to first generate a part of the encryption: the salt
        // THe value passe in to genSalt() is the number of rounds brcypt will use to generate the 
        // salt value.  10 rounds is recommended.
        const saltRounds = 10;
        let salt = await bcrypt.genSalt(saltRounds);    // get the salt value out of the returned Promise from genSalt().
        // Use the generated salt for encrpyting the passed in string.
        let hash = await bcrypt.hash(theString, salt);  // Does the actual encryption of the given string
        return { salt: salt, encryptedString: hash };
    }

    // make a method that can check to see if the person provided the correct password and username
    static async authenticate(givenPassword, thePersonDoc) {
        // assume givenPassword is what the user typed in, and assume thePersonDoc is the actual Person Document found for
        // the given username.  NOTE: make sure that you enforce unique usernames.
        console.log("person doc: "+ thePersonDoc);
        // let salt = thePersonDoc.salt;
        let encryptedPassword = thePersonDoc.password;

        const match = await bcrypt.compare(givenPassword, encryptedPassword);
        return match;   // true for a match, false if they don't match
    }

    static model = mongoose.model("User", User.userSchema, "Users");
}