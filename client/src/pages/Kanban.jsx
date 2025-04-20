import React, { useState } from "react";
import Navbar from "../components/Navbar"; // ✅ 导入你的侧边栏
import ProjectHeader from "../components/ProjectHeader";

const defaultProject = {
  name: "Project A",
  columns: [
    {
      title: "To Do",
      cards: [{ title: "Example Task", tag: "Design" }]
    },
    {
      title: "In Progress",
      cards: []
    },
    {
      title: "Done",
      cards: []
    }
  ]
};

const Kanban = () => {
  const [projects, setProjects] = useState([defaultProject]);
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const [showCardInput, setShowCardInput] = useState(null);
  const [newProjectName, setNewProjectName] = useState("");
  const [newColumnName, setNewColumnName] = useState("");
  const [newCardTitle, setNewCardTitle] = useState("");
  const [newCardTag, setNewCardTag] = useState("");
  const [selectedCard, setSelectedCard] = useState(null);

  const currentProject = projects[currentProjectIndex];

  const addProject = () => {
    if (!newProjectName.trim()) return;
    setProjects([...projects, { name: newProjectName, columns: [] }]);
    setCurrentProjectIndex(projects.length);
    setNewProjectName("");
  };

  const deleteProject = () => {
    const newList = [...projects];
    newList.splice(currentProjectIndex, 1);
    setProjects(newList);
    setCurrentProjectIndex(0);
  };

  const addColumn = () => {
    if (!newColumnName.trim()) return;
    const updated = [...projects];
    updated[currentProjectIndex].columns.push({ title: newColumnName, cards: [] });
    setProjects(updated);
    setNewColumnName("");
  };

  const addCard = (columnIndex) => {
    if (!newCardTitle.trim()) return;
    const updated = [...projects];
    updated[currentProjectIndex].columns[columnIndex].cards.push({
      title: newCardTitle,
      tag: newCardTag
    });
    setProjects(updated);
    setNewCardTitle("");
    setNewCardTag("");
    setShowCardInput(null);
  };

  const deleteColumn = (columnIndex) => {
    const updated = [...projects];
    updated[currentProjectIndex].columns.splice(columnIndex, 1);
    setProjects(updated);
  };

  const deleteCard = (columnIndex, cardIndex) => {
    const updated = [...projects];
    updated[currentProjectIndex].columns[columnIndex].cards.splice(cardIndex, 1);
    setProjects(updated);
  };

  return (
    <div>
      {/* ✅ Navbar stays fixed on the left */}
      <Navbar />
      <div className=" ml-[15%] w-[85%] h-[9vh]">
                <ProjectHeader title="Calendar" />
      </div>
      {/* ✅ Main content shifted right by 15% */}
      <div className="p-4 font-sans ml-[15%] w-[85%] bg-[var(--background-primary)] text-[var(--text)] h-[91vh] overflow-y-auto">
        {/* Project Controls */}
        <div className="mb-4 flex items-center gap-4">
          <select
            value={currentProjectIndex}
            onChange={(e) => setCurrentProjectIndex(parseInt(e.target.value))}
            className="border rounded px-2 py-1"
          >
            {projects.map((p, i) => (
              <option key={i} value={i}>{p.name}</option>
            ))}
          </select>
          <input
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder="New Project"
            className="border px-2 py-1 rounded"
          />
          <button onClick={addProject} className="bg-green-100 border border-green-300 px-3 py-1 rounded text-green-700 hover:bg-green-200">
            + Add Project
          </button>
          <button onClick={deleteProject} className="bg-red-100 border border-red-300 px-3 py-1 rounded text-red-700 hover:bg-red-200">
            🗑 Delete Project
          </button>
        </div>

        {/* Kanban Columns */}
        <div className="kanban-board">
          {currentProject.columns.map((col, colIndex) => (
            <div key={colIndex} className="kanban-list">
              <div className="flex justify-between items-center mb-2 bg-[var(--background)] p-2 rounded">
                <h2 className="font-bold">{col.title}</h2>
                <button onClick={() => deleteColumn(colIndex)} className="text-red-400 hover:text-red-600">🗑</button>
              </div>
              <div className="flex flex-col gap-2">
                {col.cards.map((card, cardIndex) => (
                  <div
                    key={cardIndex}
                    className="kanban-card"
                    onClick={() => setSelectedCard({ ...card, colTitle: col.title })}
                  >
                    {card.tag && (
                      <div className="text-xs bg-blue-200 text-blue-800 rounded px-2 py-1 inline-block mb-1">
                        {card.tag}
                      </div>
                    )}
                    {card.title}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteCard(colIndex, cardIndex);
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {showCardInput === colIndex ? (
                  <div className="mt-2">
                    <input
                      value={newCardTitle}
                      onChange={(e) => setNewCardTitle(e.target.value)}
                      placeholder="Card title"
                      className="border px-2 py-1 rounded w-full text-sm mb-1"
                    />
                    <input
                      value={newCardTag}
                      onChange={(e) => setNewCardTag(e.target.value)}
                      placeholder="Card tag (optional)"
                      className="border px-2 py-1 rounded w-full text-sm mb-2"
                    />
                    <div className="flex justify-end">
                      <button onClick={() => addCard(colIndex)} className="text-sm text-blue-600 hover:underline">Add</button>
                      <button onClick={() => setShowCardInput(null)} className="text-sm text-gray-500 ml-2">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowCardInput(colIndex)}
                    className="text-sm text-gray-500 hover:text-blue-600 mt-2"
                  >
                    + Add Card
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Add Column UI */}
          <div className="add-column">
            <input
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              placeholder="Column name"
              className="w-full px-2 py-1 text-sm border rounded mb-2"
            />
            <button
              onClick={addColumn}
              className="text-sm text-gray-700 hover:text-black"
            >
              + Add Column
            </button>
          </div>
        </div>

        {/* Card Detail Modal */}
        {selectedCard && (
          <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded shadow-lg p-6 w-[320px]">
              <h2 className="text-lg font-bold mb-2">{selectedCard.title}</h2>
              <p className="text-sm text-gray-500 mb-1">Column: {selectedCard.colTitle}</p>
              {selectedCard.tag && (
                <p className="text-sm text-gray-600 mb-4">Tag: {selectedCard.tag}</p>
              )}
              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedCard(null)}
                  className="text-sm px-3 py-1 bg-blue-100 border border-blue-300 text-blue-700 rounded hover:bg-blue-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Kanban;
