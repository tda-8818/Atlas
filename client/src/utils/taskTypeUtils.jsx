import { FaCheckCircle, FaBug, FaBook, FaFlag } from 'react-icons/fa';

// Task type configurations
export const TASK_TYPES = {
  story: {
    value: 'story',
    label: 'Story',
    icon: FaBook,
    color: '#10B981', // Green
    bgColor: '#ECFDF5',
    description: 'User-facing feature or functionality'
  },
  task: {
    value: 'task',
    label: 'Task',
    icon: FaCheckCircle,
    color: '#3B82F6', // Blue
    bgColor: '#EFF6FF',
    description: 'General work item'
  },
  bug: {
    value: 'bug',
    label: 'Bug',
    icon: FaBug,
    color: '#EF4444', // Red
    bgColor: '#FEF2F2',
    description: 'Issue that needs to be fixed'
  },
  milestone: {
    value: 'milestone',
    label: 'Milestone',
    icon: FaFlag,
    color: '#8B5CF6', // Purple
    bgColor: '#F5F3FF',
    description: 'Significant checkpoint or major deliverable'
  }
};

// Story points options (Fibonacci sequence)
export const STORY_POINTS_OPTIONS = [0, 1, 2, 3, 5, 8, 13, 21];

// Get task type config
export const getTaskTypeConfig = (type) => {
  return TASK_TYPES[type] || TASK_TYPES.task;
};

// Task type icon component
export const TaskTypeIcon = ({ type, size = 'md' }) => {
  const config = getTaskTypeConfig(type);
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <div
      className={`flex items-center justify-center ${sizeClasses[size]}`}
      style={{ color: config.color }}
      title={config.label}
    >
      <Icon className="w-full h-full" />
    </div>
  );
};

// Predefined label colors
export const LABEL_COLORS = [
  '#EF4444', // Red
  '#F97316', // Orange
  '#F59E0B', // Amber
  '#EAB308', // Yellow
  '#84CC16', // Lime
  '#22C55E', // Green
  '#10B981', // Emerald
  '#14B8A6', // Teal
  '#06B6D4', // Cyan
  '#0EA5E9', // Sky
  '#3B82F6', // Blue
  '#6366F1', // Indigo
  '#8B5CF6', // Violet
  '#A855F7', // Purple
  '#D946EF', // Fuchsia
  '#EC4899', // Pink
  '#F43F5E', // Rose
  '#64748B', // Slate
];
