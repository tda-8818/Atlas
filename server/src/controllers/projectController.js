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

        const { title, description, daysLeft } = req.body;
        console.log("Received Data:", req.body);

        // grab the email of the user who created the project
        console.log("Authenticated user in createProject:", req.user);

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

        console.log("MongoId of user is:", user._id);

        // create new project
        const projectData = new Project({
            owner: user._id,
            title: title,
            description: description,
            daysLeft: daysLeft,
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
        res.status(500).json({ message: "Error creating project.", error });
    }
}

/*
    This endpoint selects a project from the homepage.
    It verifies that the project exists in the database,
    then clears any existing "selectedProject" cookie, creates a new JWT,
    and sets it in its own cookie using the projectCookieOptions.
  */
export const selectProject = async (req, res) => {
    /*
    Selecting a project in from the homepage directs a user to the dashboard
    It also set the cookie to the current project so that the rest of the app can access and render project-specific content like tasks 
    ONLY ONE PROJECT SHOULD BE STORED IN THE COOKIE
    */
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "No projectId provided" });
        }

        console.log("recieved projectId:", id);

        // 1. Check if project is valid in DB
        const existingProject = await Project.findById(id);

        if (!existingProject) {
            console.log("project not found for id:", id);
            return res.status(400).json({
                message: "Project data not found"
            })
        }

        // testing logs
        console.log("found project:", existingProject);

        // Clear any existing project cookie
        res.clearCookie("selectedProject");

        // 2. generate token representing selected project
        const tokenPayload = { projectId: id };
        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.cookie('selectedProject', token, cookieOptions);

        // 3. send response
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

        console.log("getUserProjects Executed");

        // receive user cookie
        const userCookie = req.user;

        console.log("userId", userCookie);

        // get user from database
        if (!req.user) {
            console.error({ message: "token user undefined" });
            return;
        }

        const user = await UserModel.findById(req.user._id).populate("projects");

        // get user's Projects
        const projects = user.projects;
        console.log("user projects: ", projects);

        res.status(200).json(projects);

    } catch (error) {
        console.error("Error in getUserProjects:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const addUserToProject = async (req, res) => {
    try {

        // 1. receive user email
        const { email } = req.body;

        console.log(email);

        // 2. fetch user from database
        // May need to force toLowerCase() if not done on the front-end
        const userToAdd = await UserModel.findOne({ email });

        console.log(userToAdd);

        // 3. Check if user exists
        if (!userToAdd) {
            console.error({ message: "Unable to add user to project. User not found" })
            return res.status(404).json({ message: "User not found when adding to project." });
        }

        // 4. Get projectId from selectedProject token.
        const selectedProject = req.cookies?.selectedProject;
        console.log("Selected project from cookie:", selectedProject);

        // 5. Check if projectId is valid
        if (!selectedProject) {
            console.error({ message: "Error selected project not found" })
            return res.status(404).json({ message: "selectedProject token not found" });
        }

        // 6. Fetch the project from the database
        const project = await Project.findById(selectedProject);

        // 6.5 Check if project is null
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        // 7. add the user to project's list of users and vice-versa
        // Make sure to check that you're not adding duplicate copies of projects/users to each other.
        if (!project.users.includes(userToAdd._id)) {
            project.users.push(userToAdd._id);
        }

        if (!userToAdd.projects.includes(project._id)) {
            userToAdd.projects.push(project._id)
        }

        // 8. Save the project and user document
        await project.save();
        await userToAdd.save();

        return res.status(200).json({ message: "User added to project successfully" });
    } catch (error) {
        console.error("Error in addUserToProject in projectController.js:", error);
    }
}

export const deleteProject = async (req, res) => {
    /**Deletes a project
     * After deletion, it should clear the project from any instance in
     * other components such as the UserModel.
     * 
     * 
     */
    try {
        const { id } = req.params

        console.log('deleteProject has been executed');

        console.log("recieved token: ", req.user);
        const email = req.user.email;
        console.log(email);

        const projectToDelete = await Project.findByIdAndDelete(id);

        if (!projectToDelete) {
            return res.status(404).json({ message: "Project not found" });
        }
        res.status(200).json({ message: "Project deleted successfully", projectToDelete })
    } catch (error) {
        console.error("Error in deleteProject: ", error);
        res.status(500).json({ message: "Error in deleteProject" });
    }
}

export const getProjectById = async (req, res) => {
    try {
      const { id } = req.params;
      console.log(id);
      const project = await Project.findById(id);
      console.log("project found: ",project)
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
  