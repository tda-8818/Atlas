import Project from "../models/ProjectModel.js";
import UserModel from "../models/UserModel.js";
import jwt from 'jsonwebtoken';

const cookieOptions = {
    httpOnly: true,
    secure: false, // false for localhost development
    sameSite: 'lax', // or 'none' if cross-site
    domain: 'localhost', // Explicitly set domain
    path: '/', // Root path
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  };

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
    try {
        
        const {projectId} = req.body;
        
        // 1. Check if project is valid in DB
        const existingProject = await Project.findById(projectId);

        // testing logs
        console.log("found project:", existingProject);

        if (!existingProject){
            return res.status(400).json({
                message: "Project data not found"
            })
        }

        // 1.5 clear existing project cookie
        res.clearCookie("selectedProject");

        // 2. generate token
        const token = jwt.sign(
            { projectId },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // 3. set http-only cookie
        res.cookie('selectedProject', token, cookieOptions);

        // 4. send response
        res.status(200).json({
            success: true,
            message: 'Project selected successfully',
          });
          

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }

};

// export const deselectProject = async (req, res) => {
//     /*
//     Clears the project cookie 
//     */
//     try {
//         // remove the cookie if the user selects another project
//         res.clearCookie('selectedProject');
//         res.status(200).json({ success: true, message: 'Project Deselected'});

//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message});
//     }

// };

