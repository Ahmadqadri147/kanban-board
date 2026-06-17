import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

const COLUMNS = ['To Do', 'In Progress', 'Done'];
const COLORS = {
  'To Do': '#153842',
  'In Progress': '#354A8C',
  'Done': '#EDDD53',
};


function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-2xl border border-white/20 text-center animate-in zoom-in duration-200">
        <p className="text-[10px] font-black text-brand-dark/50 uppercase tracking-widest mb-1">{payload[0].name}</p>
        <p className="text-2xl font-black text-brand-dark">
          {payload[0].value}
        </p>
        <p className="text-[10px] font-black text-brand-dark/50 uppercase">
          task{payload[0].value !== 1 ? 's' : ''}
        </p>
      </div>
    );
  }
  return null;
}


function ProgressChart({ tasks }) {
  const chartData = useMemo(() => {
    return COLUMNS.map((col) => ({
      name: col,
      value: tasks.filter((t) => t.status === col).length,
      fill: COLORS[col],
    }));
  }, [tasks]);

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === 'Done').length;
  const completionPercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-8 shadow-2xl" data-testid="progress-chart">
      {/* Header with Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
        <div>
          <h3 className="text-2xl font-black text-white tracking-tight uppercase">Analytics</h3>
          <p className="text-white/60 font-bold text-sm tracking-wide">Tracking your productivity</p>
        </div>
        
        <div className="grid grid-cols-3 gap-8 md:gap-12">
          <div className="flex flex-col items-center">
            <span className="text-3xl font-black text-white leading-none mb-1 drop-shadow-sm" data-testid="total-tasks">{totalTasks}</span>
            <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">Total</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-black text-brand-yellow leading-none mb-1 drop-shadow-sm" data-testid="done-tasks">{doneTasks}</span>
            <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">Done</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="relative flex items-center justify-center">
               <span className="text-3xl font-black text-white leading-none mb-1 drop-shadow-sm" data-testid="completion-percent">{completionPercent}%</span>
            </div>
            <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">Rate</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="h-[350px] bg-white/5 rounded-3xl p-4 border border-white/10">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={110}
                paddingAngle={8}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} className="hover:opacity-80 transition-opacity cursor-pointer" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                align="center"
                iconType="circle"
                formatter={(value) => <span className="text-xs font-black text-white/70 uppercase tracking-widest ml-1">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="h-[350px] bg-white/5 rounded-3xl p-6 border border-white/10">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 900 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 900 }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
              <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`bar-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default ProgressChart;
