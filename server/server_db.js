import { MongoClient } from "mongodb";
import User from "./models/User.js";

var test_user = new User({
    id: 12111111,
    firstname: 'TestUser',
    lastname: 'plzwork',
    username: 'testuser',
    password: 'password123',
    email: 'test@example.com'
});

async function testHashing(client, user) {

    try {
        await user.save();
        console.log("user saved.");

        const user_fetched = await User.findOne({username:'testuser'});
        if (!user) throw new Error("User not found.");
        
        user.comparePassword('password123', function(err, isMatch) {
            if (err) throw err;
            console.log("password123: ", isMatch);
        })

        user.comparePassword('WrongPassword', function(err, isMatch) {
            if (err) throw err;
            console.log('WrongPassword:', isMatch); // Expected output: false
        });

    } catch (error) {
        console.error("Error", error);
    }
};


async function listDatabases(client) {
    
    const databasesList = await client.db().admin().listDatabases();

    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
}

async function dropCollection(client, dbName, collectionName) {
    try
    {
    // drops collectionName from the db specified by dbName   
    const db = client.db(dbName);

    // deletes the collection 
    const del = await db.collection(collectionName).drop();
    console.log(`Collection '${collectionName}' dropped:`, del);
    } catch (error)
    {
        if (error.codeName === "NamespaceNotFound")
        {
            console.log(`Collection ${collectionName} does not exist.`);
        } else {
            console.error("Error dropping collection:", error);
        
        }
    }
}

/**
 * Prints a list of all collections within a given database to the console.
 *
 * @param {MongoClient} client - The Mongoclient connected to the DB.
 * @param {string} dbName - The name of the DB you want to access.
 * @returns nothing
 * @throws {NotFoundError} - If no user is found with the given IDs.
 * @throws {Error} - If there is an error during the retrieval process.
 */
async function listCollectionNames(client, dbName) {
    try
    {
        const db = client.db(dbName);
        const collections = await db.listCollections().toArray();
        const collectionNames = collections.map(col => col.name);
        console.log(collectionNames);

    }catch (error) 
    {
        console.error("Error listing collections:", error.message);
    }
}

async function main() {
    const MONGO_URI = "mongodb+srv://ngsweejie:CS2TMS@cs02taskmanagementsyste.ko3ct.mongodb.net/?retryWrites=true&w=majority&appName=CS02TaskManagementSystem";
    const client = new MongoClient(MONGO_URI);

    try {
        
        await client.connect(); 
        await listDatabases(client);
        await listCollectionNames(client, "sample_tasks");
        // add test user and check the hashing works
        // insert code here
        testHashing(client, test_user);

    } catch (e)
    {
        console.error(e);

    } finally 
    {
        await client.close();
    }

}

main().catch(console.error)


