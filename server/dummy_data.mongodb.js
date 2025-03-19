/*
WARNING!!!
RUNNING THIS FILE WILL RECREATE ALL OF THE SAMPLE DATA TO ITS ORIGINAL VERSION
*/


use ("sample_tasks");

db.getCollectionNames();

db.users.drop();
db.tasks.drop();
db.projects.drop();

db.users.insertMany(
    [
        {
            "_id": 11111110,
            "firstName": "Alice",
            "lastName": "Mendus",
            "username": "Alice_username", 
            "email": "Alice@example.com",
        },
        {
            "_id": 11111111,
            "firstName": "Bob",
            "lastName": "Dylan",
            "username": "Bob_username", 
            "email": "Bob@example.com",
        },
        {
            "_id": 11111112,
            "firstName": "Carol",
            "lastName": "Bwy",
            "username": "Carol_username", 
            "email": "Carol@example.com",
        },
        {
            "_id": 11111113,
            "firstName": "Dave",
            "lastName": "Lindblume",
            "username": "Dave_username", 
            "email": "Dave@example.com",
        },
    ]
);


db.tasks.insertMany([
    {
        "project_id": 22222220, // Created by machine or us
        "title": "Finish MongoDB Schema",  // Created by User
        "description": "Design a MongoDB schema for task management", // Created by User
        "status": "in-progress", // Created by User
        "priority": "high", // Created by User
        "assigned_to": [11111110],
        "due_date": ISODate("2025-03-20T00:00:00Z"),  // Created by User, (format ISODate format for consistency)
        "created_at": new Date()  // Created by machine or us (format ISODate format for consistency)
    },
    {
        "project_id": 22222220, // Created by machine or us
        "title": "Write project documentation", // Created by User
        "status": "pending", // Created by User
        "priority": "medium", // Created by User
        "assigned_to": [11111110],
        "due_date": ISODate("2025-03-20T00:00:00Z"),  // Created by User, (format ISODate format for consistency)
        "created_at": new Date() // Created by machine or us (format ISODate format for consistency)
    },
    {
        "project_id": 22222220,
        "title": "Finish Frontend",
        "description": "Write HTML and CSS for website",
        "status": "in-progress",
        "priority": "high",
        "assigned_to": [11111111],
        "due_date": ISODate("2025-03-20T00:00:00Z"),
        "created_at": new Date()
      },
      {
        "project_id": 22222220,
        "title": "Do research on nodeJS",
        "description": "", // Empty description (Make sure all data is safe to be initialised to null or nothing)
        "status": "pending",
        "priority": "medium",
        "assigned_to": [11111111],
        "due_date": ISODate("2025-03-20T00:00:00Z"),
        "created_at": new Date()
      }

]);




/*
_id Field
If the json doc does not specify an _id field,
then mongod will add the _id field and assign a unique ObjectId() 
for the document before inserting.
*/

let userIds = db.users.find({}, { _id: 1 }).toArray().map(u => u._id);
let taskIds = db.tasks.find({project_id: 22222220}, { _id: 1 }).toArray().map(u => u._id);

// print(userIds);
// print(taskIds);


db.projects.insertOne(
    {
        "_id": 22222220,
        "project_title": "Project Uniflow",
        "description": "A task management project",
        "project_admin_privileges": [11111110],
        "users": [userIds],
        "tasks": [taskIds],
        "created_at": new Date()
    }
);