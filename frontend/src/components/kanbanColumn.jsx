import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from './taskCard';

function getIndicatorClasses(column) {
  switch (column) {
    case 'To Do': return 'bg-brand-dark';
    case 'In Progress': return 'bg-brand-blue';
    case 'Done': return 'bg-brand-yellow';
    default: return 'bg-gray-500';
  }
}

function getColumnBgClass(column) {
  return 'bg-white/10 backdrop-blur-md border-white/20';
}

function KanbanColumn({ column, tasks, onDeleteTask }) {
  const { isOver, setNodeRef } = useDroppable({
    id: column,
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col h-full min-h-[500px] rounded-2xl border transition-all duration-200 ${
        isOver ? 'ring-2 ring-white/50 border-white/40 shadow-2xl scale-[1.01]' : 'shadow-xl'
      } ${getColumnBgClass(column)}`}
      data-testid={`column-${column}`}
    >
      <div className="p-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <span className={`w-3 h-3 rounded-full ${getIndicatorClasses(column)} shadow-[0_0_8px_rgba(255,255,255,0.5)]`} />
          <h2 className="font-extrabold text-white tracking-tight uppercase text-sm">{column}</h2>
        </div>
        <span className="bg-white/20 backdrop-blur-sm px-2.5 py-0.5 rounded-lg text-xs font-black text-white border border-white/10 shadow-sm" data-testid={`count-${column}`}>
          {tasks.length}
        </span>
      </div>

      <div className="p-3 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <TaskCard key={task.id} task={task} onDelete={onDeleteTask} />
            ))
          ) : (
            <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-white/20 rounded-xl bg-white/5 text-white/50 text-sm font-bold transition-colors hover:bg-white/10">
              <span className="text-2xl mb-1 opacity-50">
                {column === 'Done' ? '✨' : '📥'}
              </span>
              {column === 'Done' ? 'Clean Slate' : 'Drop Here'}
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  );
}

export default KanbanColumn;
