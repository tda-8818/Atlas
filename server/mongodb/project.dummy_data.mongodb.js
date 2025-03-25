/*
WARNING!!!
RUNNING THIS FILE WILL RECREATE ALL OF THE SAMPLE DATA TO ITS ORIGINAL VERSION
*/
use ("users");

let userIds = db.users.find({}, { _id: 1 }).toArray().map(u => u._id);

use ("tasks");
let taskIds = db.tasks.find({project_id: 22222220}, { _id: 1 }).toArray().map(u => u._id);


use ("projects");

db.projects.drop();

/*
_id Field
If the json doc does not specify an _id field,
then mongod will add the _id field and assign a unique ObjectId() 
for the document before inserting.
*/


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