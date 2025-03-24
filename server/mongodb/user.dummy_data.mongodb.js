/*
WARNING!!!
RUNNING THIS FILE WILL RECREATE ALL OF THE SAMPLE DATA TO ITS ORIGINAL VERSION
*/


use ("users");

db.users.drop();

db.users.insertMany(
    [
        {
            "_id": 11111110,
            "firstName": "Alice",
            "lastName": "Mendus",
            "username": "Alice_username", 
            "email": "Alice@example.com",
            "password": "alice_unhashed_password",
            "favourite_projects": [22222220],
            "recent_projects": [22222220],
        },
        {
            "_id": 11111111,
            "firstName": "Bob",
            "lastName": "Dylan",
            "username": "Bob_username", 
            "email": "Bob@example.com",
            "password": "bob_unhashed_password",
            "favourite_projects": [],
            "recent_projects": [22222220],
            
        },
        {
            "_id": 11111112,
            "firstName": "Carol",
            "lastName": "Bwy",
            "username": "Carol_username", 
            "email": "Carol@example.com",
            "password": "carol_unhashed_password",
            "favourite_projects": [22222220],
            "recent_projects": [],
        },
        {
            "_id": 11111113,
            "firstName": "Dave",
            "lastName": "Lindblume",
            "username": "Dave_username", 
            "email": "Dave@example.com",
            "password": "dave_unhashed_password",
            "favourite_projects": [],
            "recent_projects": [],
        },
    ]
);