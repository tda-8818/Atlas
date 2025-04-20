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