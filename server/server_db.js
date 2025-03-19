const { MongoClient, ExplainableCursor } = require('mongodb');
//const mongoose = require('mongoose');

async function listDatabases(client) {
    
    databasesList = await client.db().admin().listDatabases();

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

    } catch (e)
    {
        console.error(e);

    } finally 
    {
        await client.close();
    }

}

main().catch(console.error)


