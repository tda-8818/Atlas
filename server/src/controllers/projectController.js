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

// This function creates a new project and associates it with the user who created it
export const createProject = async (req, res) => {
    try {
        console.log("create project executed");

        const { title, description, startDate, endDate } = req.body;
        console.log("Received Data:", req.body);

        // grab the email of the user who created the project
        console.log("Authenticated user creates Project:", req.user);

        // check if user exists
        if (!req.user) {
            console.error({ message: "token user undefined" });
            return;
        }

        // get userId
        const userCreator = req.user.email
        console.log("Project created by: ", userCreator);

        // fetch user from DB
        const user = await UserModel.findOne({ email: userCreator });

        if (!user) {
            return res.status(400).json({ message: "user not found in database." });
        }

        // create new project
        const projectData = new Project({
            owner: user._id,
            title: title,
            description: description,
            startDate: startDate,
            endDate: endDate,
            users: [],
        })
        // insert the user who created the project as a member of that project
        projectData.users.push(user._id);

        console.log(projectData);

        // save project in db
        const savedProject = await projectData.save();

        // add the project to that user's list of projects
        user.projects.push(savedProject._id);

        console.log("USER DETAILS AFTER PROJECT PUSH:", user);

        // save updated user document
        await user.save();

        res.status(201).json(savedProject);

    } catch (error) {
        console.error("Error creating project", error);
        res.status(500).json({ message: "Error creating project.", error });
    }
}

export const getUserProjects = async (req, res) => {
    try {
        console.log("getUserProjects Executed");

        // Ensure that a valid user is attached to the request
        if (!req.user) {
            console.error("User token undefined");
            return res.status(401).json({ message: "User not authenticated" });
        }

        // Retrieve the user from the database and populate the "projects" field
        const user = await UserModel.findById(req.user._id).populate("projects");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
    
        // Return the user's projects as JSON
        const projects = user.projects;
        console.log("User projects:", projects);
        res.status(200).json(projects);
      } catch (error) {
        console.error("Error in getUserProjects:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Deletes a project; RTK Query will later use the response to invalidate its cache.
export const deleteProject = async (req, res) => {
    try {
        const { id } = req.params;
        console.log("deleteProject executed with id:", id);

        // Optionally, you can check if req.user is allowed to delete the project.
        const projectToDelete = await Project.findByIdAndDelete(id);
        if (!projectToDelete) {
            return res.status(404).json({ message: "Project not found" });
        }
        res.status(200).json({ message: "Project deleted successfully", project: projectToDelete });
    } catch (error) {
        console.error("Error in deleteProject:", error);
        res.status(500).json({ message: "Error in deleteProject", error });
    }
};

////////// TASK-PROJECT RELATED QUERIES //////////

/**
 * Returns a single project by ID.
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
export const getProjectById = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(id);
        const project = await Project.findById(id);
        console.log("projectById found: ", project)
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        // Optionally check if user has access to this project:
        if (!project.users.some(user => user.equals(req.user._id))) {
            return res.status(403).json({ message: "Unauthorized access to this project" });
        }

        res.status(200).json(project);
    } catch (error) {
        console.error("Error in getProjectById:", error);
        res.status(500).json({ message: "Failed to get project", error });
    }
  };
  