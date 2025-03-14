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

async function main() {
    const MONGO_URI = "mongodb+srv://ngsweejie:CS2TMS@cs02taskmanagementsyste.ko3ct.mongodb.net/?retryWrites=true&w=majority&appName=CS02TaskManagementSystem";
    const client = new MongoClient(MONGO_URI);

    try {

        await client.connect(); 
        await listDatabases(client);
 
    } catch (e)
    {
        console.error(e);

    } finally 
    {
        await client.close();
    }

}

main().catch(console.error)


