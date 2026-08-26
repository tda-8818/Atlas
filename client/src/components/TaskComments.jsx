import { useState } from 'react';
import {
  useGetTaskCommentsQuery,
  useAddTaskCommentMutation,
  useDeleteTaskCommentMutation,
} from '../redux/slices/taskSlice';
import { useGetCurrentUserQuery } from '../redux/slices/userSlice';
import UserAvatar from './avatar/UserAvatar';

const TaskComments = ({ taskId }) => {
  const [draft, setDraft] = useState('');
  const { data: userData } = useGetCurrentUserQuery();
  const currentUserId = userData?.user?.id || userData?.user?._id;
  const { data: comments = [], isLoading } = useGetTaskCommentsQuery(taskId, {
    skip: !taskId,
  });
  const [addComment, { isLoading: isPosting }] = useAddTaskCommentMutation();
  const [deleteComment] = useDeleteTaskCommentMutation();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const body = draft.trim();
    if (!body) return;
    try {
      await addComment({ taskId, body }).unwrap();
      setDraft('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await deleteComment({ taskId, commentId }).unwrap();
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-[var(--text)] mb-2">
        Comments {comments.length > 0 && (
          <span className="text-[var(--text-muted)] font-normal">({comments.length})</span>
        )}
      </label>

      <div className="space-y-3 mb-3 max-h-56 overflow-y-auto">
        {isLoading && (
          <p className="text-sm text-[var(--text-muted)]">Loading comments...</p>
        )}
        {!isLoading && comments.length === 0 && (
          <p className="text-sm text-[var(--text-muted)]">No comments yet.</p>
        )}
        {comments.map((comment) => {
          const author = comment.authorId;
          const authorId = author?._id || author;
          const canDelete = String(authorId) === String(currentUserId);
          return (
            <div
              key={comment._id}
              className="flex gap-3 p-3 bg-[var(--background-primary)] border border-[var(--border-color-accent)] rounded-lg"
            >
              <UserAvatar user={author} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-[var(--text)]">
                    {author?.firstName || 'Someone'} {author?.lastName || ''}
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">
                    {comment.createdAt
                      ? new Date(comment.createdAt).toLocaleString()
                      : ''}
                  </span>
                </div>
                <p className="text-sm text-[var(--text)] whitespace-pre-wrap mt-1">
                  {comment.body}
                </p>
                {canDelete && (
                  <button
                    type="button"
                    onClick={() => handleDelete(comment._id)}
                    className="text-xs text-[var(--text-muted)] hover:text-red-500 mt-1"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Leave a comment..."
          rows={2}
          className="flex-1 px-3 py-2 bg-[var(--background-primary)] border border-[var(--border-color-accent)] text-[var(--text)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none placeholder:text-[var(--text-muted)]"
        />
        <button
          type="submit"
          disabled={isPosting || !draft.trim()}
          className="self-end px-4 py-2 bg-[var(--color-primary)] text-white text-sm font-medium rounded-lg disabled:opacity-50"
        >
          {isPosting ? 'Posting...' : 'Post'}
        </button>
      </form>
    </div>
  );
};

export default TaskComments;
