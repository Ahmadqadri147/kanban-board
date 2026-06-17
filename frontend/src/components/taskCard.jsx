import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import folderIcon from '../assets/folder.png';



function TaskCard({ task, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group bg-white/90 backdrop-blur-sm rounded-xl border border-white/20 p-4 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-grab active:cursor-grabbing hover:-translate-y-1 ${isDragging ? 'opacity-50 ring-2 ring-brand-blue' : ''}`}
      data-testid={`task-${task.id}`}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h4 className="font-bold text-brand-dark leading-tight group-hover:text-brand-blue transition-colors">
          {task.title}
        </h4>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id);
          }}
          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
          aria-label="Delete task"
          title="Delete task"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>

      {task.description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 font-medium">
          {task.description}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2 mt-auto">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black tracking-widest uppercase ${
          task.priority === 'High' ? 'bg-red-100 text-red-600 priority-high' :
          task.priority === 'Medium' ? 'bg-brand-blue/10 text-brand-blue priority-medium' :
          'bg-green-100 text-green-600 priority-low'
        }`}>
          {task.priority}
        </span>
        <span className="bg-brand-dark/5 text-brand-dark/70 px-2 py-0.5 rounded-md text-[10px] font-black tracking-widest uppercase border border-brand-dark/10">
          {task.category}
        </span>
      </div>

      {/* Attachments */}
      {task.attachments && task.attachments.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2 pt-3 border-t border-gray-50">
          {task.attachments.map((url, index) => {
            const isImage = url.startsWith('data:image') || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
            return (
              <div key={index} className="relative group/attachment overflow-hidden rounded-lg border border-gray-100 shadow-sm w-12 h-12 flex-shrink-0 bg-gray-50">
                {isImage ? (
                  <img src={url} alt={`Attachment ${index + 1}`} className="w-full h-full object-cover transition-transform group-hover/attachment:scale-110" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-2">
                    <img src={folderIcon} alt="File" className="w-full h-full object-contain" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default TaskCard;
