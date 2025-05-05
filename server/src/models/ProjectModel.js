import mongoose from "mongoose";
import Task from "./TaskModel.js";
// TODO: LEARN MONGOOSE SCHEMA 
// https://mongoosejs.com/ READ THE DOCS


const projectSchema = new mongoose.Schema({
    title: {type: String, required: true},
    description: {type: String, required: true},
    owner: {type: mongoose.Schema.Types.ObjectId, ref:'user',  required: true},
    users: [{type: mongoose.Schema.Types.ObjectId, ref:'user',  default: []}],
    tasks: [{type: mongoose.Schema.Types.ObjectId, ref:'task',  default: []}],
    daysLeft: {type: Number },
    progress: {type: Number, default: 0}
}, {timestamps: true});

// If a project is deleted from the database, also remove all related tasks within that project.

projectSchema.pre('deleteOne', {document: true, query: false}, async function (next) {
    try
    {
        await Task.deleteMany({task_id: this.id});
        next();
    } catch (error)
    {
        next(error);
    }
    useEffect(() => {
        // Call this function to load projects from database
        const getUserProjects = async () => {
          try {
            console.log("cast on load");
            
            const response = await axios.get(`http://localhost:5001/home`, {
              withCredentials: true
            });
            console.log("project data:", response.data);
    
            if (response.status === 200 && Array.isArray(response.data)) {               
              const projectJson = response.data.map((project) => ({
                id: project._id, // consistently using "id" on the client side
                title: project.title,
                description: project.description,
                progress: project.progress,
                daysLeft: project.daysLeft,
                team: ["/avatars/avatar1.png"],
              }));
              setProjects(projectJson);
              setFirstName(currentUser.user.firstName);
            }
          } catch (error) {
            console.error("Error in useEffect in Home.jsx:", error);
          }
        }
        getUserProjects();
      }, [currentUser]);
})

const Project = mongoose.model('project', projectSchema);

export default Project;