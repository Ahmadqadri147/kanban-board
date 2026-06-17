import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import useSocket from './useSocket';
import TaskForm from './taskForm';
import KanbanColumn from './kanbanColumn';
import ProgressChart from './progressChart';


const COLUMNS = ['To Do', 'In Progress', 'Done'];


function KanbanBoard() {
  const {
    tasks,
    loading,
    connected,
    error,
    createTask,
    moveTask,
    deleteTask,
  } = useSocket();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );


  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id;
    const overId = over.id;

    // Dropped directly onto a column
    if (COLUMNS.includes(overId)) {
      const task = tasks.find((t) => t.id === taskId);
      if (task && task.status !== overId) {
        moveTask(taskId, overId);
      }
      return;
    }


    const activeTask = tasks.find((t) => t.id === active.id);
    const overTask = tasks.find((t) => t.id === over.id);

    if (activeTask && overTask && activeTask.status !== overTask.status) {
      moveTask(active.id, overTask.status);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="loading-container" data-testid="loading">
        <div className="loading-spinner" />
        <p>Connecting to board...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 py-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight drop-shadow-md">Kanban Board</h1>
          <p className="text-white/80 mt-1 text-lg font-medium">Manage your tasks with real-time sync</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full shadow-lg border border-white/20">
          <span className={`w-3 h-3 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
          <span className="text-sm font-bold text-white uppercase tracking-wider">
            {connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div
          className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300"
          role="alert"
          data-testid="error-banner"
        >
          <span className="text-xl">⚠️</span>
          <span className="font-medium">{error}</span>
        </div>
      )}

      <div className="space-y-10">
        <section>
          <TaskForm onCreateTask={createTask} />
        </section>

        <section>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {COLUMNS.map((col) => (
                <KanbanColumn
                  key={col}
                  column={col}
                  tasks={tasks.filter((t) => t.status === col)}
                  onDeleteTask={deleteTask}
                />
              ))}
            </div>
          </DndContext>
        </section>

        <section className="pt-4">
          <ProgressChart tasks={tasks} />
        </section>
      </div>
    </div>
  );
}

export default KanbanBoard;
