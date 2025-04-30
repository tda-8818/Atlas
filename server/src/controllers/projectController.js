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

        // check if user exists
        if (!req.user)
        {
            console.error({message: "token user undefined"})
            return;
        }  

        // get userId
        const userCreator = req.user.email
        console.log("Project created by: ", userCreator);
        
        // fetch user from DB
        const user = await UserModel.findOne({email: userCreator});

        if (!user) {
            return res.status(400).json({message: "user not found in database."});
        }

        console.log("MongoId of user is:", user._id);

        // create new project
        const projectData = new Project({
            title: title,
            description: subtitle,
        })
        // insert the user who created the project as a member of that project
        projectData.users.push(user._id);

        // save project in db
        const savedProject = await projectData.save();

        // add the project to that user's list of projects
        user.projects.push(savedProject._id);

        // save updated user document
        await user.save();

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
        
        const {id} = req.body;
        
        console.log("recieved projectId:", id);

        // 1. Check if project is valid in DB
        const existingProject = await Project.findById(id);

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
            { id },
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

export const getUserProjects = async (req, res) => {
    /*
    Gets the user from the cookie and returns their projects 
    */
    try {
        // receive user cookie
        const userId = req.user.id;

        // get user from database
        const user = await UserModel.findById(userId);
        // get user's Projects
        const projects = user.projects;

    } catch (error) {
        res.status(500).json({ success: false, message: error.message});
    }

};

export const deleteProject = async (req,res) => {
    try {
        const { id } = req.params
        
        console.log('deleteProject has been executed');

        console.log("recieved token: ", req.user);
        const email = req.user.email;
        console.log(email);

        const projectToDelete = await Project.findByIdAndDelete(id);
        
        if (!projectToDelete) {
            return res.status(404).json({ message: "Project not found"});
        }
        res.status(200).json({ message: "Project deleted successfully", task_to_delete})
    } catch (error) {
        console.error("Error in deleteProject: ", error);
        res.status(500).json({ message: "Error in deleteProject"});
    }
}