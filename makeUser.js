import mongoose from 'mongoose';    // import your packages at the top of your code.
// Be sure to include in your package.json, the following key:value = "type": "module"

// bring in the MongoDB Connection import
import './dbconnection.js'; // Since we don't need to refer back to this particular import, there's no need for a name or the "from" keyword
// Import the entity to test
import User from './user.js';
import Shelter from './shelter.js';
import ShelterUser from './shelterUser.js';
import ShelterUpdate from './shelterUpdates.js';



// async functions can be called in the top-level of your code, but they CANNOT USE await.
// To get around that, create an entry point function that is async and then call your other async functions in that.
const main = async() => {
    // Call your other async functions here.
    // You can also write regular JS code here as well.
    let user ={
        first_name: "Kwizera",   // "Float" should be a defined Mongoose datatype. UPDATE: FLoat is not a valid Mongoose type, Number is the type for float
        last_name: "Johny",
        phone_number: "8066666666",
        email_address: "pato@gmail.com",
        is_admin:false
    }

    let userDoc = await User.create(user);
    let allUsers = await User.read();
    console.log("all users :" + allUsers  );

    


    // let shelter ={
    //     name: "Martha's Home",   // "Float" should be a defined Mongoose datatype. UPDATE: FLoat is not a valid Mongoose type, Number is the type for float
    //     adress: "1111 S Taylor",
    //     phone: "8067779393",
    //     number_of_beds: 20,
    //     beds_available: 18
    // }

    // let shelterDoc = await Shelter.create(shelter);
    // let allShelters = await Shelter.read();
    // console.log("all shelters :" + allShelters  );





    // let shelterUpdate ={
    //     shelter_id: allShelters[0]._id,   // "Float" should be a defined Mongoose datatype. UPDATE: FLoat is not a valid Mongoose type, Number is the type for float
    //     beds_update: 20,
    //     date_changed: new Date()
    // }

    // let shelterUpdateDoc = await ShelterUpdate.create(shelterUpdate);
    // let allShelterUpdates = await ShelterUpdate.read();
    // console.log("all shelter updates :" + allShelterUpdates  );






    // let shelterUser ={
    //     shelter_id: allShelters[0]._id,   // "Float" should be a defined Mongoose datatype. UPDATE: FLoat is not a valid Mongoose type, Number is the type for float
    //     user_id: allUsers[0]._id
    // }

    // let shelterUserDoc = await ShelterUser.create(shelterUser);
    // let allShelterUsers = await ShelterUser.read();
    // console.log("all shelter users :" + allShelterUsers  )



}

// calling the main entry point.
main();