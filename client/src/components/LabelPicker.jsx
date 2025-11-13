import { useState, useRef, useEffect } from 'react';
import { MdAdd, MdClose, MdEdit, MdDelete, MdCheck } from 'react-icons/md';
import { useGetProjectLabelsQuery, useCreateLabelMutation, useUpdateLabelMutation, useDeleteLabelMutation } from '../redux/slices/labelSlice';
import { LABEL_COLORS } from '../utils/taskTypeUtils';

const LabelPicker = ({ projectId, selectedLabels = [], onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState(LABEL_COLORS[0]);
  const [editingLabel, setEditingLabel] = useState(null);
  const dropdownRef = useRef(null);

  const { data: labels = [], isLoading } = useGetProjectLabelsQuery(projectId);
  const [createLabel, { isLoading: isCreating }] = useCreateLabelMutation();
  const [updateLabel, { isLoading: isUpdating }] = useUpdateLabelMutation();
  const [deleteLabel] = useDeleteLabelMutation();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowCreateForm(false);
        setEditingLabel(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleLabel = (labelId) => {
    const isSelected = selectedLabels.some(l => l._id === labelId || l === labelId);

    if (isSelected) {
      onChange(selectedLabels.filter(l => (l._id || l) !== labelId));
    } else {
      const label = labels.find(l => l._id === labelId);
      onChange([...selectedLabels, label]);
    }
  };

  const handleCreateLabel = async (e) => {
    e.preventDefault();
    if (!newLabelName.trim()) return;

    try {
      await createLabel({
        projectId,
        name: newLabelName.trim(),
        color: newLabelColor
      }).unwrap();

      setNewLabelName('');
      setNewLabelColor(LABEL_COLORS[0]);
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create label:', error);
    }
  };

  const handleUpdateLabel = async (e) => {
    e.preventDefault();
    if (!editingLabel || !editingLabel.name.trim()) return;

    try {
      await updateLabel({
        labelId: editingLabel._id,
        name: editingLabel.name.trim(),
        color: editingLabel.color
      }).unwrap();

      setEditingLabel(null);
    } catch (error) {
      console.error('Failed to update label:', error);
    }
  };

  const handleDeleteLabel = async (labelId) => {
    if (!window.confirm('Delete this label? It will be removed from all tasks.')) return;

    try {
      await deleteLabel(labelId).unwrap();
      // Remove from selected labels if it was selected
      onChange(selectedLabels.filter(l => (l._id || l) !== labelId));
    } catch (error) {
      console.error('Failed to delete label:', error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selected Labels Display */}
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedLabels.map((label) => {
          const labelData = typeof label === 'string' ? labels.find(l => l._id === label) : label;
          if (!labelData) return null;

          return (
            <span
              key={labelData._id}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: labelData.color }}
            >
              {labelData.name}
              <button
                onClick={() => handleToggleLabel(labelData._id)}
                className="hover:bg-black/20 rounded-full p-0.5 transition-colors"
              >
                <MdClose className="w-3 h-3" />
              </button>
            </span>
          );
        })}
      </div>

      {/* Add Label Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="text-sm text-[var(--color-primary)] hover:underline flex items-center gap-1"
      >
        <MdAdd className="w-4 h-4" />
        {selectedLabels.length === 0 ? 'Add labels' : 'Add more'}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-64 bg-[var(--background)] border border-[var(--border-color)] rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {/* Label List */}
          {!showCreateForm && !editingLabel && (
            <div className="p-2">
              <div className="text-xs font-semibold text-[var(--text-muted)] mb-2 px-2">
                SELECT LABELS
              </div>

              {isLoading ? (
                <div className="text-center py-4 text-sm text-[var(--text-muted)]">Loading...</div>
              ) : labels.length === 0 ? (
                <div className="text-center py-4 text-sm text-[var(--text-muted)]">
                  No labels yet
                </div>
              ) : (
                <div className="space-y-1">
                  {labels.map((label) => {
                    const isSelected = selectedLabels.some(l => (l._id || l) === label._id);

                    return (
                      <div
                        key={label._id}
                        className="flex items-center justify-between px-2 py-1.5 hover:bg-[var(--background-primary)] rounded transition-colors group"
                      >
                        <button
                          type="button"
                          onClick={() => handleToggleLabel(label._id)}
                          className="flex items-center gap-2 flex-1 text-left"
                        >
                          <div
                            className="w-4 h-4 rounded flex items-center justify-center"
                            style={{ backgroundColor: label.color }}
                          >
                            {isSelected && <MdCheck className="w-3 h-3 text-white" />}
                          </div>
                          <span className="text-sm text-[var(--text)]">{label.name}</span>
                        </button>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => setEditingLabel(label)}
                            className="p-1 hover:bg-[var(--background-secondary)] rounded"
                            title="Edit label"
                          >
                            <MdEdit className="w-3 h-3 text-[var(--text-muted)]" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteLabel(label._id)}
                            className="p-1 hover:bg-red-50 rounded"
                            title="Delete label"
                          >
                            <MdDelete className="w-3 h-3 text-red-500" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowCreateForm(true)}
                className="w-full mt-2 px-2 py-2 text-sm text-[var(--color-primary)] hover:bg-[var(--background-primary)] rounded transition-colors flex items-center justify-center gap-1"
              >
                <MdAdd className="w-4 h-4" />
                Create new label
              </button>
            </div>
          )}

          {/* Create Label Form */}
          {showCreateForm && (
            <form onSubmit={handleCreateLabel} className="p-3 border-t border-[var(--border-color)]">
              <div className="text-xs font-semibold text-[var(--text-muted)] mb-3">
                CREATE NEW LABEL
              </div>

              <input
                type="text"
                value={newLabelName}
                onChange={(e) => setNewLabelName(e.target.value)}
                placeholder="Label name"
                className="w-full px-3 py-2 text-sm bg-[var(--background-primary)] border border-[var(--border-color)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] mb-3"
                autoFocus
              />

              <div className="mb-3">
                <div className="text-xs text-[var(--text-muted)] mb-2">Color</div>
                <div className="grid grid-cols-9 gap-1.5">
                  {LABEL_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewLabelColor(color)}
                      className={`w-6 h-6 rounded ${
                        newLabelColor === color ? 'ring-2 ring-[var(--color-primary)] ring-offset-1' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={!newLabelName.trim() || isCreating}
                  className="flex-1 px-3 py-2 text-sm bg-[var(--color-primary)] text-white rounded hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {isCreating ? 'Creating...' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewLabelName('');
                    setNewLabelColor(LABEL_COLORS[0]);
                  }}
                  className="px-3 py-2 text-sm text-[var(--text-muted)] hover:bg-[var(--background-primary)] rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Edit Label Form */}
          {editingLabel && (
            <form onSubmit={handleUpdateLabel} className="p-3 border-t border-[var(--border-color)]">
              <div className="text-xs font-semibold text-[var(--text-muted)] mb-3">
                EDIT LABEL
              </div>

              <input
                type="text"
                value={editingLabel.name}
                onChange={(e) => setEditingLabel({ ...editingLabel, name: e.target.value })}
                placeholder="Label name"
                className="w-full px-3 py-2 text-sm bg-[var(--background-primary)] border border-[var(--border-color)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] mb-3"
                autoFocus
              />

              <div className="mb-3">
                <div className="text-xs text-[var(--text-muted)] mb-2">Color</div>
                <div className="grid grid-cols-9 gap-1.5">
                  {LABEL_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setEditingLabel({ ...editingLabel, color })}
                      className={`w-6 h-6 rounded ${
                        editingLabel.color === color ? 'ring-2 ring-[var(--color-primary)] ring-offset-1' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={!editingLabel.name.trim() || isUpdating}
                  className="flex-1 px-3 py-2 text-sm bg-[var(--color-primary)] text-white rounded hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {isUpdating ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingLabel(null)}
                  className="px-3 py-2 text-sm text-[var(--text-muted)] hover:bg-[var(--background-primary)] rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default LabelPicker;
