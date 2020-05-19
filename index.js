import mongoose from 'mongoose';    // import your packages at the top of your code.
// Be sure to include in your package.json, the following key:value = "type": "module"

// bring in the MongoDB Connection import
import './dbconnection.js'; // Since we don't need to refer back to this particular import, there's no need for a name or the "from" keyword
// Import the entity to test
import User from './user.js';
import Shelter from './shelter.js';
import ShelterUser from './shelterUser.js';
import ShelterUpdate from './shelterUpdates.js';

import express from 'express';
import bodyParser from 'body-parser';
// bring in Passport
import passport from 'passport';
// Since we will be creating the actual JWTs here upon successful authentication, import the jsonwebtoken package
import JWT from 'jsonwebtoken';
//configure passport
import './passport.js';


const app = express();  // the actual web server

// port Express will listen on.
const port = 3000;

// Now apply (or use) the bodyParser middleware in Express
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));   // this allows us to work with x-www-url-encoded data (used primarily in JSON Web Token authentication processes)

// Make Express now listen for HTTP traffic
app.listen(port, () => {
    console.log(`Express is now listening for HTTP traffic on port ${port}`);
});

// define a GET endpoint for retrieving all User documents.
app.get("/users", passport.authenticate("jwt", { session: false }), async(req, res) => { 
    // get all of the User docs from MongoDB
    
    //only let admins view all users
    if(!req.user.is_admin){
        return res.send({message: "Unauthorized user"});
    }
    try {
        let allPersonDocs = await User.read();
        // Now send all of those Person Document objects to whatever requested this particular url endpoint.
        res.send(allPersonDocs);    // objects are already in JSON format, so no need to reformat them.
        // NOTE: REST Architecture requires that all information leaving the System to be in JSON format.
    } catch (err) {
        console.log(err);
        res.send(err);
    }
}); 

// Make an endpoint that returns one User doc, based on id
app.get("/users/:userId", async(req, res) => {
    try {
        // get the id from the url request
        let id = req.params.userId;
        // Retrieve this one User doc
        let userDocs = await User.read({ _id: id });
        let userDoc = userDocs[0];
        res.send(userDoc);
    } catch (err) {
        console.log(err);
        res.send(err);
    }
});

// Make a POST endpoint that will create a Person doc
app.post("/users", async(req, res) => {
    try {
       
       
        if(req.body.first_name 
            && req.body.last_name 
            && req.body.email_address
            && req.body.password) {    // checking to see if firstName and lastName came in on the POST
                // get the encrpyted password and salt
                let encryptedPasswordAndSalt = await User.generateHash(req.body.password);
                let encryptedPassword = encryptedPasswordAndSalt.encryptedString;
                let salt = encryptedPasswordAndSalt.salt;

            let newPersonInfo = { 
                first_name: req.body.first_name, 
                last_name: req.body.last_name,
                email_address: req.body.email_address,
                is_admin: req.body.is_admin,
                phone_number: req.body.phone_number,
                password: encryptedPassword,    // NOTE: we are storing the encrypted form of the password.
                salt: salt
            };

            // Now create the Person doc
            let newPerson = await User.create(newPersonInfo);
            res.send({ message: "Person created successfully", newPerson });
        }
        else{
            return res.send({message: "User info not valid"});
        }
    } catch (err) {
        console.log(err);
        res.send(err);
    }
});

app.post("/users/authenticate", async(req, res) =>{
    // take username and password out of the request body
    try {
        if(req.body.email_address && req.body.password) {
           // be sure to sanitize your data first.  Just keeping it simple here for demonstration
           // make Passport perform the authentication.
           // NOTE: since we're using JWTs for authentication, we WILL NOT use server-side sessions, so { session: false } 
           passport.authenticate("local", { session: false }, (err, user, info) => {
               // check to see if authenticate() had any issues, so check err and user
               if (err || !user) {
                   console.log("error auth is " + err);
                   return res.status(400).json({
                       message: "Some happened and authentication was unsuccessful.",
                       user: user
                   });
               }
               // assuming no issues, go ahead and "login" the person via Passport
               req.login(user, { session: false }, (err) => {
                   if (err) {
                       res.send(err);
                   }
                   // if no error, generate the JWT to signify that the person logged in successfully,
                   const token = JWT.sign(user.toJSON(), "ThisNeedsToBeAStrongPasswordPleaseChange");
                   return res.json({ user, token });
               });
           })(req, res);    // NOTE: we're passing req and res to the next middleware (just memorize this)
        }
    } catch (err) {
        console.log(err);
        res.send(err);
    }
});

// define a PUT endpoint for updating an existing Person document
app.put("/users/:userId",  passport.authenticate("jwt", { session: false }), async(req, res) => {
    try {
        // Get the id
        let id = req.params.userId;
        // Now find the one User Doc for this id
        let userDocs = await User.read({ _id: id });
        let userDoc = userDocs[0];
        // update the one User doc
        // Look at the POST req.body for the data used to update this User Document.
        let updateInfo = {};
        if(req.body.first_name) {
            updateInfo["first_name"] = req.body.first_name;
        }
        if(req.body.last_name) {
            updateInfo["last_name"] = req.body.last_name;
        }
        if(req.body.phone_number) {
            updateInfo["phone_number"] = req.body.phone_number;
        }
        if(req.body.email_address) {
            updateInfo["email_address"] = req.body.email_address;
        }
        // Now perform the update
        let updatedUserDoc = await User.update(userDoc, updateInfo);
        res.send({ message: "Update User doc a success.", updatedUserDoc });
    } catch (err) {
        console.log(err);
        res.send(err);
    }
});



/************************************************************ */
/************************************************************ */
/***************Shelters ******************************** */
/************************************************************ */
/************************************************************ */
/************************************************************ */


app.get("/shelters", passport.authenticate("jwt", { session: false }), async(req, res) => { 
  
    if(!req.user.is_admin){
        return res.send({message: "Unauthorized user"});
    }
    try {
        let allShelterDocs = await Shelter.read();
        res.send(allShelterDocs);    // objects are already in JSON format, so no need to reformat them.
    } catch (err) {
        console.log(err);
        res.send(err);
    }
}); 

// Make an endpoint that returns one Shelter doc, based on id
app.get("/shelters/:shelterId", async(req, res) => { 
    try {
        // get the id from the url request
        let id = req.params.shelterId;
        // Retrieve this one shelter doc
        let shelterDocs = await Shelter.read({ _id: id });
        let shelterDoc = shelterDocs[0];
        res.send(shelterDoc);
    } catch (err) {
        console.log(err);
        res.send(err);
    }
});

// Make a POST endpoint that will create a shelter doc
app.post("/shelters", async(req, res) => {
    try {
       
       
        if(req.body.name 
            && req.body.adress 
            && req.body.phone
            && req.body.beds_available
            && req.body.number_of_beds) {   
        

            let newShelterInfo = { 
                adress: req.body.adress, 
                name: req.body.name,
                phone: req.body.phone,
                number_of_beds: req.body.number_of_beds,
                beds_available: req.body.beds_available,
            };

            // Now create the Shelter doc
            let newShelter = await Shelter.create(newShelterInfo);
            res.send({ message: "Shelter created successfully", newShelter });
        }
        else{
            return res.send({message: "Shelter info not valid"});
        }
    } catch (err) {
        console.log(err);
        res.send(err);
    }
});



// define a PUT endpoint for updating an existing Shelter document
app.put("/shelters/:shelterId",  passport.authenticate("jwt", { session: false }), async(req, res) => {
    try {
        // Get the id
        let id = req.params.shelterId;
        // Now find the one Person Doc for this id
        let shelterDocs = await Shelter.read({ _id: id });
        let shelterDoc = shelterDocs[0];
        // Look at the POST req.body for the data used to update this Shelter Document
        let updateInfo = {};
        if(req.body.name) {
            updateInfo["name"] = req.body.name;
        }
        if(req.body.phone) {
            updateInfo["phone"] = req.body.phone;
        }
        if(req.body.adress) {
            updateInfo["adress"] = req.body.adress;
        }
        if(req.body.number_of_beds) {
            updateInfo["number_of_beds"] = req.body.number_of_beds;
        }
        if(req.body.beds_available) {
            updateInfo["beds_available"] = req.body.beds_available;
        }
        // Now perform the update
        let updatedShelterDoc = await Shelter.update(shelterDoc, updateInfo);
        res.send({ message: "Update Shelter doc a success.", updatedShelterDoc });
    } catch (err) {
        console.log(err);
        res.send(err);
    }
});










/************************************************************ */
/************************************************************ */
/***************Shelter Users******************************** */
/************************************************************ */
/************************************************************ */
/************************************************************ */

app.get("/shelterUsers", passport.authenticate("jwt", { session: false }), async(req, res) => { // Remeber to make your req,res functions async if you are calling any async functions and using await.
    // get all of the Person docs from MongoDB
    // NOTE: if you need to know info about the logged in user, look to the req.user property (this should be whatever is stored 
    // in your JWT payload).
    // console.log({ theJWTContents: req.user }); // req.user is the actual contents of the verified JWT Token.
    // for instanc in order to get the firstName out of the JWT Token, look at req.user.firstName
    if(!req.user.is_admin){
        return res.send({message: "Unauthorized user"});
    }
    try {
        let allShelterUserDocs = await ShelterUser.read();
        // Now send all of those Person Document objects to whatever requested this particular url endpoint.
        res.send(allShelterUserDocs);    // objects are already in JSON format, so no need to reformat them.
        // NOTE: REST Architecture requires that all information leaving the System to be in JSON format.
    } catch (err) {
        console.log(err);
        res.send(err);
    }
}); 

// Make an endpoint that returns all ShelterUser docs, based on shelter id
app.get("/shelterUsers/shelter/:shelterId", async(req, res) => { 
    try {
        // get the id from the url request
        let id = req.params.shelterId;
        // Retrieve these ShelterUser docs
        let shelterDocs = await ShelterUser.read({ shelter_id: id });
        let shelterDoc = shelterDocs[0];
        res.send(shelterDoc);
    } catch (err) {
        console.log(err);
        res.send(err);
    }
});


// Make an endpoint that returns one ShelterUser doc, based on user id
app.get("/shelterUsers/user/:userId", async(req, res) => { 
    try {
        // get the id from the url request
        let id = req.params.userId;
        // Retrieve this one ShelterUser doc
        let userDocs = await ShelterUser.read({ user_id: id });
        let userDoc = userDocs[0];
        res.send(userDoc);
    } catch (err) {
        console.log(err);
        res.send(err);
    }
});

// Make a POST endpoint that will create a Person doc
app.post("/shelterUsers",  passport.authenticate("jwt", { session: false }), async(req, res) => {
    try {
        
       
        if(
             req.body.user_id 
            && req.body.shelter_id
            ) {    // checking to see if userID and shelterId came in on the POST
                // get the encrpyted password and salt
            let newShelterPerson = { 
                shelter_id: req.body.shelter_id, 
                user_id: req.body.user_id
            };

            // Now create the Person doc
            let newPerson = await ShelterUser.create(newShelterPerson);
            res.send({ message: "Shelter User created successfully", newPerson });
        }
        else{
            return res.send({message: "Shelter User info not valid"});
        }
    } catch (err) {
        console.log(err);
        res.send(err);
    }
});





/************************************************************ */
/************************************************************ */
/***************Shelter Updates******************************** */
/************************************************************ */
/************************************************************ */
/************************************************************ */


app.get("/shelterUpdates", passport.authenticate("jwt", { session: false }), async(req, res) => { 
    if(!req.user.is_admin){
        return res.send({message: "Unauthorized user"});
    }
    try {
        let allShelterUpdateDocs = await ShelterUpdate.read();
        res.send(allShelterUpdateDocs);    
    } catch (err) {
        console.log(err);
        res.send(err);
    }
}); 

// Make an endpoint that returns all ShelterUpdates docs, based on shelter id
app.get("/shelterUpdates/shelter/:shelterId", async(req, res) => { 
    try {
        // get the id from the url request
        let id = req.params.shelterId;
        // Retrieve these ShelterUser docs
        let shelterDocs = await ShelterUpdate.read({ shelter_id: id });
        let shelterDoc = shelterDocs[0];
        res.send(shelterDoc);
    } catch (err) {
        console.log(err);
        res.send(err);
    }
});



// Make a POST endpoint that will create a Person doc
app.post("/shelterUpdates", async(req, res) => {
    try {
        
       
        if(
             req.body.beds_update 
            && req.body.shelter_id
            ) {   
               
            let newShelterUpdateInfo = { 
                shelter_id: req.body.shelter_id, 
                beds_update: req.body.beds_update
            };

            // Now create the ShelterUpdate  doc
            let newShelter = await ShelterUpdate.create(newShelterUpdateInfo);
            res.send({ message: "Shelter Update created successfully", newShelter });
        }
        else{
            return res.send({message: "Shelter Update info not valid"});
        }
    } catch (err) {
        console.log(err);
        res.send(err);
    }
});


// async functions can be called in the top-level of your code, but they CANNOT USE await.
// To get around that, create an entry point function that is async and then call your other async functions in that.
// const main = async() => {
//     // Call your other async functions here.
//     // You can also write regular JS code here as well.
//     let user ={
//         first_name: "Kwizera",   // "Float" should be a defined Mongoose datatype. UPDATE: FLoat is not a valid Mongoose type, Number is the type for float
//         last_name: "Johny",
//         phone_number: "8066666666",
//         email_address: "pato@gmail.com",
//         is_admin:false
//     }

//     let userDoc = await User.create(user);
//     let allUsers = await User.read();
//     console.log("all users :" + allUsers  );

    


    // // let shelter ={
    //     name: "Martha's Home",   // "Float" should be a defined Mongoose datatype. UPDATE: FLoat is not a valid Mongoose type, Number is the type for float
    //     adress: "1111 S Taylor",
    //     phone: "8067779393",
    //     number_of_beds: 20,
    //     beds_available: 18
    // }

//     let shelterDoc = await Shelter.create(shelter);
//     let allShelters = await Shelter.read();
//     console.log("all shelters :" + allShelters  );





//     let shelterUpdate ={
//         shelter_id: allShelters[0]._id,   // "Float" should be a defined Mongoose datatype. UPDATE: FLoat is not a valid Mongoose type, Number is the type for float
//         beds_update: 20,
//         date_changed: new Date()
//     }

//     let shelterUpdateDoc = await ShelterUpdate.create(shelterUpdate);
//     let allShelterUpdates = await ShelterUpdate.read();
//     console.log("all shelter updates :" + allShelterUpdates  );






//     let shelterUser ={
//         shelter_id: allShelters[0]._id,   // "Float" should be a defined Mongoose datatype. UPDATE: FLoat is not a valid Mongoose type, Number is the type for float
//         user_id: allUsers[0]._id
//     }

//     let shelterUserDoc = await ShelterUser.create(shelterUser);
//     let allShelterUsers = await ShelterUser.read();
//     console.log("all shelter users :" + allShelterUsers  )



// }

// // calling the main entry point.
// main();