import React, { useState } from 'react';
import Select from 'react-select';

const PRIORITIES = [
  { value: 'Low', label: ' Low' },
  { value: 'Medium', label: ' Medium' },
  { value: 'High', label: ' High' },
];

const CATEGORIES = [
  { value: 'Bug', label: ' Bug' },
  { value: 'Feature', label: ' Feature' },
  { value: 'Enhancement', label: ' Enhancement' },
];


const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'application/pdf'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;


function TaskForm({ onCreateTask }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [category, setCategory] = useState('Feature');
  const [attachments, setAttachments] = useState([]);
  const [fileError, setFileError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onCreateTask({
      title: title.trim(),
      description: description.trim(),
      status: 'To Do',
      priority,
      category,
      attachments,
    });


    setTitle('');
    setDescription('');
    setPriority('Medium');
    setCategory('Feature');
    setAttachments([]);
    setFileError(null);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;


    if (!ALLOWED_TYPES.includes(file.type)) {
      setFileError(`Unsupported file type: ${file.type || 'unknown'}. Please upload images or PDFs only.`);
      e.target.value = '';
      return;
    }


    if (file.size > MAX_FILE_SIZE) {
      setFileError('File size exceeds 5MB limit.');
      e.target.value = '';
      return;
    }

    setFileError(null);


    const reader = new FileReader();
    reader.onloadend = () => {
      setAttachments((prev) => [...prev, reader.result]);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 shadow-2xl mb-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 mb-6">
        <h3 className="text-xl font-black text-white tracking-tight uppercase">Create New Task</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4 md:col-span-1">
            <div className="space-y-2">
              <label htmlFor="task-title" className="text-xs font-black text-white/70 uppercase tracking-widest ml-1">Title</label>
              <input
                id="task-title"
                type="text"
                placeholder="What needs to be done?"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border-white/10 focus:bg-white focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/20 transition-all outline-none text-white focus:text-brand-dark font-bold placeholder:text-white/40"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                data-testid="task-title-input"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="task-description" className="text-xs font-black text-white/70 uppercase tracking-widest ml-1">Description</label>
              <textarea
                id="task-description"
                placeholder="Add more details..."
                className="w-full px-4 py-3 rounded-xl bg-white/10 border-white/10 focus:bg-white focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/20 transition-all outline-none text-white focus:text-brand-dark font-bold placeholder:text-white/40 min-h-[120px] resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                data-testid="task-description-input"
              />
            </div>
          </div>

          <div className="space-y-6 md:col-span-1 ">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-white/70 uppercase tracking-widest ml-1">Priority</label>
                <Select
                  options={PRIORITIES}
                  value={PRIORITIES.find((p) => p.value === priority)}
                  onChange={(opt) => setPriority(opt.value)}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderRadius: '12px',
                      padding: '4px',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: 'none',
                      color: 'white',
                    }),
                    singleValue: (base) => ({
                      ...base,
                      color: 'white',
                      fontWeight: 'bold',
                    }),
                    placeholder: (base) => ({
                      ...base,
                      color: 'rgba(255, 255, 255, 0.4)',
                    }),
                    menu: (base) => ({
                      ...base,
                      zIndex: 9999,
                      borderRadius: '12px',
                      overflow: 'hidden',
                      backgroundColor: '#fff',
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
                    })
                  }}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-white/70 uppercase tracking-widest ml-1">Category</label>
                <Select
                  options={CATEGORIES}
                  value={CATEGORIES.find((c) => c.value === category)}
                  onChange={(opt) => setCategory(opt.value)}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderRadius: '12px',
                      padding: '4px',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: 'none',
                    }),
                    singleValue: (base) => ({
                      ...base,
                      color: 'white',
                      fontWeight: 'bold',
                    }),
                    placeholder: (base) => ({
                      ...base,
                      color: 'rgba(255, 255, 255, 0.4)',
                    }),
                    menu: (base) => ({
                      ...base,
                      zIndex: 9999,
                      borderRadius: '12px',
                      overflow: 'hidden',
                      backgroundColor: '#fff',
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
                    })
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-white/70 uppercase tracking-widest ml-1">Attachments</label>
              <div className="relative group cursor-pointer">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept="image/*,.pdf"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  data-testid="file-upload-input"
                />
                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/20 rounded-2xl bg-white/5 group-hover:bg-white/10 group-hover:border-white/40 transition-all">
                  <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">📁</span>
                  <p className="text-sm font-bold text-white/60 group-hover:text-white">Click to upload files</p>
                  <p className="text-[10px] text-white/40 mt-1 uppercase font-black tracking-widest">Images, PDFs • Max 5MB</p>
                </div>
              </div>

              {fileError && (
                <div data-testid="file-error" className="mt-2 text-xs font-bold text-red-400 flex items-center gap-1 ml-1" role="alert">
                  <span>⚠️</span> {fileError}
                </div>
              )}

              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-4">
                  {attachments.map((url, index) => (
                    <div key={index} className="relative w-14 h-14 rounded-xl overflow-hidden border border-white/20 shadow-lg animate-in zoom-in duration-300">
                      {url.startsWith('data:image') ? (
                        <img src={url} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-white/10 text-xl font-bold text-white">📄</div>
                      )}
                      <button
                        type="button"
                        className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 shadow-lg transition-colors"
                        onClick={() => removeAttachment(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-white/10">
          <button
            type="submit"
            disabled={!title.trim()}
            data-testid="add-task-btn"
            className="px-8 py-3.5 bg-brand-yellow text-brand-dark rounded-xl font-black shadow-xl hover:scale-105 disabled:opacity-50 disabled:scale-100 transition-all active:scale-[0.98] flex items-center gap-2 group uppercase tracking-widest text-sm"
          >
            <span className="text-lg group-hover:rotate-12 transition-transform">➕</span>
            Add Task
          </button>
        </div>
      </form>
    </div>
  );
}

export { PRIORITIES, CATEGORIES, ALLOWED_TYPES };
export default TaskForm;
