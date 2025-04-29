import Project from "../models/ProjectModel.js";
import UserModel from "../models/UserModel.js";

export const createProject = async (req, res) => {
    try {
        console.log("create project executed");

        const {title, subtitle} = req.body;
        console.log("Recieved Data:", req.body);

        // grab the email of the user who created the project
        console.log("Authenticated user in createProject:", req.user);

        if (!req.user)
        {
            console.error({message: "token user undefined"})
            return;
        }

        const userCreator = req.user.email

        console.log("Project created by: ", userCreator);
        
        const userId = await UserModel.findOne({email: userCreator});
        console.log("MongoId of user is: ", userId._id);

        const projectData = new Project({
            title: title,
            description: subtitle,
        })

        projectData.users.push(userId);

        const savedProject = await projectData.save();

        res.status(201).json(savedProject);


    } catch (error) {
        console.error("Error creating project", error);
        res.status(500).json({message: "Error creating project.", error});
    }
}

export const selectProject = async (req, res) => {
    /*
    Selecting a project in from the homepage directs a user to the dashboard
    It also set the cookie to the current project so that the rest of the app can access and render project-specific content like tasks 
    ONLY ONE PROJECT SHOULD BE STORED IN THE COOKIE
    */
};

export const deselectProject = async (params) => {
    /*
    Clears the project cookie 
    */
};