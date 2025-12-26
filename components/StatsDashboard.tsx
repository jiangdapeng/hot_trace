
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { MealRecord } from '../types';

interface StatsDashboardProps {
  history: MealRecord[];
}

const StatsDashboard: React.FC<StatsDashboardProps> = ({ history }) => {
  const processStats = () => {
    const dailyTotals: { [key: string]: number } = {};
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return weekDays[d.getDay()];
    });

    const last7Dates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toDateString();
    });

    history.forEach(meal => {
      const dateKey = new Date(meal.timestamp).toDateString();
      dailyTotals[dateKey] = (dailyTotals[dateKey] || 0) + meal.totalCalories;
    });

    return last7Dates.map((date, idx) => ({
      name: last7Days[idx],
      calories: dailyTotals[date] || 0,
    }));
  };

  const data = processStats();
  const todayCalories = data[data.length - 1].calories;
  const target = 2000;
  const progress = Math.min((todayCalories / target) * 100, 100);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-lg">
        <h3 className="text-white/80 font-medium mb-1">今日摄入</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold">{todayCalories}</span>
          <span className="text-lg text-white/70">/ {target} 千卡</span>
        </div>
        
        <div className="mt-4 h-3 bg-white/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-white transition-all duration-1000" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="mt-2 text-sm text-white/80">
          {progress >= 100 ? "目标达成！ 🚀" : `还需摄入约 ${Math.round(target - todayCalories)} 千卡以达标。`}
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-slate-800 font-bold mb-6">最近 7 天趋势</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }} 
                dy={10}
              />
              <YAxis hide domain={[0, 'auto']} />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                formatter={(value: number) => [`${value} 千卡`, '摄入量']}
              />
              <Bar dataKey="calories" radius={[6, 6, 6, 6]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === data.length - 1 ? '#6366f1' : '#e2e8f0'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-emerald-50 p-5 rounded-3xl border border-emerald-100">
          <p className="text-emerald-600 text-sm font-medium mb-1">日均摄入</p>
          <p className="text-2xl font-bold text-emerald-900">
            {Math.round(data.reduce((acc, curr) => acc + curr.calories, 0) / 7)}
          </p>
          <p className="text-emerald-600/70 text-xs">千卡 / 天</p>
        </div>
        <div className="bg-orange-50 p-5 rounded-3xl border border-orange-100">
          <p className="text-orange-600 text-sm font-medium mb-1">记录总数</p>
          <p className="text-2xl font-bold text-orange-900">{history.length}</p>
          <p className="text-orange-600/70 text-xs">餐次记录</p>
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;
