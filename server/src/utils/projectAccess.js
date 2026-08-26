import Project from '../models/ProjectModel.js';

export function canAccessProject(user, project) {
  if (!user || !project) return false;

  const uid = String(user._id);
  if (String(project.owner) === uid) return true;

  const projectUsers = project.users || [];
  if (projectUsers.some((member) => String(member._id || member) === uid)) {
    return true;
  }

  const userProjects = user.projects || [];
  if (userProjects.some((item) => String(item._id || item) === String(project._id))) {
    return true;
  }

  return false;
}

export async function getAccessibleProject(projectId, user) {
  if (!projectId) {
    return { error: { status: 400, message: 'Project ID is required' } };
  }

  const project = await Project.findById(projectId);
  if (!project) {
    return { error: { status: 404, message: 'Project not found' } };
  }

  if (!canAccessProject(user, project)) {
    return { error: { status: 403, message: 'Not a member of this project' } };
  }

  return { project };
}
