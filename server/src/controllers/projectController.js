import Project from "../models/ProjectModel.js";
import UserModel from "../models/UserModel.js";
import Column from  "../models/ColumnModel.js"
import Task from "../models/TaskModel.js";
import NotificationModel from "../models/notificationModel.js";
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
  sameSite: 'none',
  // Set the domain only in production if needed (ensure it matches your actual production domain)
  domain: process.env.CLIENT_URL,
  path: '/',
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
            description,
            startDate: startDate,
            endDate: endDate,
            users: [user._id],
            columns:[],      
        })
      
        // save project in db
        const savedProject = await projectData.save();

        // Create the unsorted column
        const unsortedColumn = await Column.create({
            title: "Unsorted Tasks",
            projectId: savedProject._id,
            index: 0,
            isDefault: true,
        });

        // insert the default column
        savedProject.columns.push(unsortedColumn._id)
        await savedProject.save();

        // add the project to that user's list of projects
        user.projects.push(savedProject._id);
        await user.save();

        res.status(201).json(savedProject);

    } catch (error) {
        console.error("Error creating project", error);
        res.status(500).json({ message: "Error creating project.", error });
    }
}

// Deletes a project; RTK Query will later use the response to invalidate its cache.
export const deleteProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        console.log("deleteProject executed with id:", projectId);
        // Optionally, you can check if req.user is allowed to delete the project.
        const projectToDelete = await Project.findByIdAndDelete(projectId);
        if (!projectToDelete) {
            return res.status(404).json({ message: "Project not found" });
        }

        await Column.deleteMany({projectId});
        await Task.deleteMany({ projectId });
        await NotificationModel.deleteMany({ projectId });
        const columnDeleteOperation = await Column.deleteMany({projectId:projectId});
        console.log(`Deleted ${columnDeleteOperation.deletedCount} columns related to project`);

        res.status(200).json({ message: "Project deleted successfully", project: projectToDelete });
    } catch (error) {
        console.error("Error in deleteProject:", error);
        res.status(500).json({ message: "Error in deleteProject", error });
    }
};

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
        //console.log("User projects called by getUserProjects:", projects);
        res.status(200).json(projects);
      } catch (error) {
        console.error("Error in getUserProjects:", error);
        res.status(500).json({ success: false, message: error.message });
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
      //console.log(id);
      const project = await Project.findById(id);
      //console.log("projectById found: ",project)
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

  ////////// PROJECT-USER RELATED QUERIES
  
  /**
   * Fetch a project's users
   * @param {*} req 
   * @param {*} res 
   * @returns 
   */
  export const getProjectUsers = async (req, res) => {
    try {
      // Depending on your route declaration, you might extract the parameter as either "id" or "id".
      const { id } = req.params; // This works if your route is defined as '/:id/users'
      console.log("Fetching users for project with id:", id);
  
      // Find the project and populate the users field
      const project = await Project.findById(id).populate('users');
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
  
      // Return the project's users array
      return res.status(200).json(project.users);
    } catch (error) {
      console.error('Error fetching project users:', error);
      return res.status(500).json({ message: 'Failed to fetch project users', error });
    }
  };

/**
 * Controller to update project users and owner.
 *
 * Expects:
 *   - req.params.id: the ID of the project to update.
 *   - req.body.owner: the new owner ID.
 *   - req.body.users: an array of user IDs.
 *
 * Returns the updated project.
 */
export const updateProjectUsers = async (req, res) => {
  const { id } = req.params;
  const { owner, users } = req.body;

  try {
    // Validate incoming data
    if (!owner || !Array.isArray(users)) {
      return res.status(400).json({ error: 'Invalid request data. Provide both owner and users (as an array).' });
    }

    // Find the project by its ID
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    

    // Update the project's owner and users
    project.owner = owner;
    project.users = users;
    await project.save();

    // Update the users' projects (Example - Adapt to your schema!)
    await UserModel.updateMany(
      { _id: { $in: users } },
      { $addToSet: { projects: id } } // Add project ID to user's projects array
    );

    console.log("user's projects list updated ")
    // Remove the project from users that were removed (if needed)
    await UserModel.updateMany(
      { _id: { $nin: users } },
      { $pull: { projects: id } }  // Remove project ID from users no longer in the project
    );

    // Update the owner's projects (if needed - depends on your logic)
    await UserModel.updateOne(
      { _id: owner },
      { $addToSet: { projects: id } }
    );

    // Save the updated project
    const updatedProject = await Project.findById(id).populate('users', 'firstName lastName email');

    // Return the updated project data
    res.status(200).json(updatedProject);
  } catch (error) {
    console.error('Error updating project users:', error);
    res.status(500).json({ error: 'Server error updating project users' });
  }
};

  ////////// PROJECT-USER RELATED QUERIES
  
/**
 * Send invite notification to another user (creates notification)
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
export const inviteUserToProject = async (req, res) => {
  try {
    console.log("INVITE USER TO PROJECT EXECUTED");
    console.log("PARAMS:", req.params);
    console.log("BODY:", req.body);
    const { projectId } = req.params;
    const { senderId, recipientId, timeSent } = req.body;

    console.log("req.param when invite user:", req.params);
    console.log("req.param when invite user:", projectId);
    // 
    const userInviteProject = await Project.findById(projectId);

    if (!userInviteProject) {
      return res.status(404).json({message: "Project not found in inviteUserToProject"});
    }


    if (!recipientId) {
      return res.status(404).json({message: "UserId not provided in inviteUserToProject"});
    }

    const recipientUser = await UserModel.findById(recipientId);
    if (!recipientUser) {
      return res.status(404).json({message: "User not found in inviteUserToProject"});
    }

    const timeSentToUse = timeSent || Date.now();
    const inviteNotification = await NotificationModel.create({
      senderId,
      recipientId,
      timeSent: timeSentToUse,
      projectId,
    });

    recipientUser.notifications.push(inviteNotification._id);
    await recipientUser.save();

    return res.status(200).json({message: "Invite sent successfully."});

  } catch (error) {
    console.error("Error in inviteUserToProject", error);
    res.status(500).json({message: "Error sending invite!"});
  }
};

/**
 * Deletes notification 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await NotificationModel.findByIdAndDelete(notificationId);

    await UserModel.findByIdAndUpdate(
      notification.recipientId,
      {$pull: {notifications: notification._id}}
    );

    await UserModel.findByIdAndUpdate(
      notification.senderId,
      {$pull: {notifications: notification._id}}
    );

    res.status(200).json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Sets notification to be read (edit notification)
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
export const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await NotificationModel.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.isUnread = false;
    await notification.save();

    res.status(200).json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * User accepts invitation to join a project
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
export const userAcceptInvite = async (req, res) => {
  try {
    const { userId } = req.params;
    const { projectId } = req.body;

    if (!userId || !projectId) {
      return res.status(400).json({ message: 'Missing userId or projectId' });
    }

    // 1. Find user and project
    const user = await UserModel.findById(userId);
    const project = await Project.findById(projectId);

    if (!user || !project) {
      return res.status(404).json({ message: 'User or project not found' });
    }

    // 2. Check if user is already in the project
    const alreadyInProject = project.users.includes(userId);
    const alreadyHasProject = user.projects.includes(projectId);

    if (alreadyInProject && alreadyHasProject) {
      return res.status(200).json({ message: 'User already part of the project' });
    }

    // 3. Add user to project members if not already added
    if (!alreadyInProject) {
      project.users.push(userId);
      await project.save();
    }

    // 4. Add project to user's list if not already added
    if (!alreadyHasProject) {
      user.projects.push(projectId);
      await user.save();
    }

    return res.status(200).json({ message: 'User successfully added to project' });

  } catch (error) {
    console.error('Error accepting invite:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
/**
 * Retrieves all notifications in a user's inbox
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
export const getUserNotifications = async (req, res) => {
  try {
    //const { userObject } = req.user;

    console.log("Got userObject from cookie: ", req.user);

    const userId = req.user._id;

    const user = await UserModel.findById(userId).populate('notifications');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    //console.log("GOT USER => Check notifs: ", user);

    // instead of just sending id data, populate to get the name and title
    const populatedNotifications = await NotificationModel.find({ recipientId: userId})
      .populate("senderId", "firstName lastName")
      .populate('projectId', 'title')
      .sort({createdAt: -1})

    console.log("SENDING NOTIFICATIONS:", populatedNotifications);

    res.status(200).json(populatedNotifications);
  } catch (error) {
    console.error('Error getting user notifications:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    // Update all unread notifications for this user
    const result = await NotificationModel.updateMany(
      { recipient: userId, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({
      message: 'All notifications marked as read',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
}
/**
 * Dynamic update notification function 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
export const updateNotification = async (req, res) => {
  try {
    console.log("UPDATE NOTIFS EXECUTED");
    const { notificationId } = req.params;
    const updateFields = req.body; // Expected to be an object like { responded: true, accepted: false, ... }

    console.log("GOT UPDATE FIELDS -> :", updateFields);
    const notification = await NotificationModel.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Update only allowed fields to avoid unwanted changes
    const allowedUpdates = ['responded', 'accepted', 'isUnread'];
    for (const key of Object.keys(updateFields)) {
      if (allowedUpdates.includes(key)) {
        notification[key] = updateFields[key];
      }
    }

    // Optionally update updatedAt timestamp
    //notification.updatedAt = new Date();

    await notification.save();
    console.log("Updated notification", notification);
    res.status(200).json({ message: 'Notification updated', notification });
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};