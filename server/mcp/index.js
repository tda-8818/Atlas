/**
 * Atlas MCP server (stdio).
 *
 * Cursor / Claude spawn this process and talk over stdin/stdout.
 * Do not log to stdout. Use console.error for diagnostics.
 *
 * Required env:
 *   ATLAS_API_URL  e.g. http://localhost:5001
 *   ATLAS_API_KEY  an Atlas API key (atk_...) from Settings
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const API_URL = (process.env.ATLAS_API_URL || 'http://localhost:5001').replace(/\/$/, '');
const API_KEY = process.env.ATLAS_API_KEY;

function jsonResult(data) {
  return {
    content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
  };
}

function errorResult(message) {
  return {
    content: [{ type: 'text', text: message }],
    isError: true,
  };
}

async function atlasFetch(path, { method = 'GET', body } = {}) {
  if (!API_KEY) {
    throw new Error('ATLAS_API_KEY is not set. Create a key in Atlas Settings and add it to the MCP env.');
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let data = text;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    const message = data?.message || data?.error || text || `HTTP ${response.status}`;
    throw new Error(`${method} ${path} failed (${response.status}): ${message}`);
  }

  return data;
}

async function resolveColumnId(projectId, columnId, columnName) {
  if (columnId) return columnId;
  if (!columnName) return undefined;

  const columns = await atlasFetch(`/api/projects/${projectId}/kanban/`);
  const match = columns.find(
    (column) => column.title.toLowerCase() === columnName.toLowerCase()
  );
  if (!match) {
    const titles = columns.map((column) => column.title).join(', ');
    throw new Error(`No column named "${columnName}". Available: ${titles}`);
  }
  return match._id;
}

const server = new McpServer({
  name: 'atlas',
  version: '1.0.0',
});

server.tool(
  'list_projects',
  'List Atlas projects the authenticated user can access.',
  async () => {
    try {
      const projects = await atlasFetch('/api/projects');
      const slim = (projects || []).map((project) => ({
        id: project._id,
        title: project.title,
        description: project.description || '',
      }));
      return jsonResult(slim);
    } catch (error) {
      return errorResult(error.message);
    }
  }
);

server.tool(
  'list_columns',
  'List kanban columns for a project. Use this to pick a column when creating or moving a task.',
  {
    projectId: z.string().describe('Atlas project id'),
  },
  async ({ projectId }) => {
    try {
      const columns = await atlasFetch(`/api/projects/${projectId}/kanban/`);
      const slim = (columns || [])
        .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
        .map((column) => ({
          id: column._id,
          title: column.title,
          index: column.index,
          isDefault: column.isDefault,
        }));
      return jsonResult(slim);
    } catch (error) {
      return errorResult(error.message);
    }
  }
);

server.tool(
  'list_tasks',
  'List tasks in a project. Optionally filter to open or done.',
  {
    projectId: z.string().describe('Atlas project id'),
    status: z.enum(['open', 'done', 'all']).optional().describe('Filter by completion. Default all.'),
  },
  async ({ projectId, status }) => {
    try {
      const [tasks, columns] = await Promise.all([
        atlasFetch(`/api/tasks/${projectId}`),
        atlasFetch(`/api/projects/${projectId}/kanban/`),
      ]);
      const columnTitles = Object.fromEntries(
        (columns || []).map((column) => [String(column._id), column.title])
      );
      let result = tasks || [];
      if (status === 'open') result = result.filter((task) => task.status !== true);
      if (status === 'done') result = result.filter((task) => task.status === true);

      return jsonResult(
        result.map((task) => ({
          id: task._id,
          title: task.title,
          status: task.status ? 'done' : 'open',
          column: columnTitles[String(task.columnId)] || task.columnId,
          columnId: task.columnId,
          priority: task.priority,
          dueDate: task.dueDate || null,
          gitBranch: task.gitBranch || '',
          gitSha: task.gitSha || '',
          assignedTo: (task.assignedTo || []).map((user) => ({
            id: user._id,
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          })),
        }))
      );
    } catch (error) {
      return errorResult(error.message);
    }
  }
);

server.tool(
  'get_task',
  'Get one task by id, including description, git fields, and comments.',
  {
    taskId: z.string().describe('Atlas task id'),
  },
  async ({ taskId }) => {
    try {
      const [task, comments] = await Promise.all([
        atlasFetch(`/api/tasks/item/${taskId}`),
        atlasFetch(`/api/tasks/${taskId}/comments`),
      ]);
      return jsonResult({ ...task, comments });
    } catch (error) {
      return errorResult(error.message);
    }
  }
);

server.tool(
  'create_task',
  'Create a task in a project. Omit columnId/columnName to land in the default Unsorted column.',
  {
    projectId: z.string().describe('Atlas project id'),
    title: z.string().describe('Task title'),
    description: z.string().optional().describe('Notes / acceptance criteria'),
    columnId: z.string().optional().describe('Kanban column id'),
    columnName: z.string().optional().describe('Kanban column title, e.g. Done'),
    priority: z.string().optional().describe('None, !, !!, or !!!'),
    dueDate: z.string().optional().describe('ISO date'),
    gitRepo: z.string().optional(),
    gitBranch: z.string().optional(),
    gitSha: z.string().optional(),
    gitPrUrl: z.string().optional(),
  },
  async (args) => {
    try {
      const columnId = await resolveColumnId(args.projectId, args.columnId, args.columnName);
      const created = await atlasFetch('/api/tasks', {
        method: 'POST',
        body: {
          projectId: args.projectId,
          title: args.title,
          description: args.description || '',
          columnId,
          priority: args.priority || 'None',
          dueDate: args.dueDate || undefined,
          gitRepo: args.gitRepo || '',
          gitBranch: args.gitBranch || '',
          gitSha: args.gitSha || '',
          gitPrUrl: args.gitPrUrl || '',
        },
      });
      return jsonResult(created);
    } catch (error) {
      return errorResult(error.message);
    }
  }
);

server.tool(
  'update_task',
  'Update a task. Only send fields you want to change. Set status true to mark done. Use columnName to move it on the board.',
  {
    taskId: z.string().describe('Atlas task id'),
    title: z.string().optional(),
    description: z.string().optional(),
    status: z.boolean().optional().describe('true = done, false = open'),
    columnId: z.string().optional(),
    columnName: z.string().optional(),
    priority: z.string().optional(),
    dueDate: z.string().optional(),
    gitRepo: z.string().optional(),
    gitBranch: z.string().optional(),
    gitSha: z.string().optional(),
    gitPrUrl: z.string().optional(),
  },
  async (args) => {
    try {
      let columnId = args.columnId;
      if (args.columnName && !columnId) {
        const current = await atlasFetch(`/api/tasks/item/${args.taskId}`);
        const projectId = current.projectId?._id || current.projectId;
        columnId = await resolveColumnId(projectId, undefined, args.columnName);
      }

      const body = {};
      for (const key of [
        'title',
        'description',
        'status',
        'priority',
        'dueDate',
        'gitRepo',
        'gitBranch',
        'gitSha',
        'gitPrUrl',
      ]) {
        if (args[key] !== undefined) body[key] = args[key];
      }
      if (columnId) body.columnId = columnId;

      const updated = await atlasFetch(`/api/tasks/${args.taskId}`, {
        method: 'PUT',
        body,
      });
      return jsonResult(updated);
    } catch (error) {
      return errorResult(error.message);
    }
  }
);

server.tool(
  'add_comment',
  'Add a comment on a task. Use this to record what you did, files touched, and next steps.',
  {
    taskId: z.string().describe('Atlas task id'),
    body: z.string().describe('Comment text'),
  },
  async ({ taskId, body }) => {
    try {
      const comment = await atlasFetch(`/api/tasks/${taskId}/comments`, {
        method: 'POST',
        body: { body },
      });
      return jsonResult(comment);
    } catch (error) {
      return errorResult(error.message);
    }
  }
);

server.tool(
  'list_comments',
  'List comments on a task, oldest first.',
  {
    taskId: z.string().describe('Atlas task id'),
  },
  async ({ taskId }) => {
    try {
      const comments = await atlasFetch(`/api/tasks/${taskId}/comments`);
      return jsonResult(comments);
    } catch (error) {
      return errorResult(error.message);
    }
  }
);

server.tool(
  'search_tasks',
  'Search tasks by title, description, or git branch across your projects.',
  {
    q: z.string().describe('Search text'),
    projectId: z.string().optional().describe('Limit search to one project'),
    assignedToMe: z.boolean().optional(),
    status: z.enum(['open', 'done']).optional(),
  },
  async ({ q, projectId, assignedToMe, status }) => {
    try {
      const params = new URLSearchParams({ q });
      if (projectId) params.set('projectId', projectId);
      if (assignedToMe) params.set('assignedToMe', 'true');
      if (status) params.set('status', status);
      const tasks = await atlasFetch(`/api/tasks/search?${params.toString()}`);
      return jsonResult(
        (tasks || []).map((task) => ({
          id: task._id,
          title: task.title,
          status: task.status ? 'done' : 'open',
          project: task.projectId?.title || task.projectId,
          gitBranch: task.gitBranch || '',
        }))
      );
    } catch (error) {
      return errorResult(error.message);
    }
  }
);

async function main() {
  if (!API_KEY) {
    console.error('ATLAS_API_KEY is missing. Set it in the MCP server env.');
  }
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`Atlas MCP connected to ${API_URL}`);
}

main().catch((error) => {
  console.error('Atlas MCP failed to start:', error);
  process.exit(1);
});
