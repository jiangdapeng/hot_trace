
import React, { useState, useEffect } from 'react';
import { ViewType, MealRecord, FoodItem } from './types';
import { recognizeFood } from './services/geminiService';
import CameraCapture from './components/CameraCapture';
import FoodOverlay from './components/FoodOverlay';
import StatsDashboard from './components/StatsDashboard';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('home');
  const [history, setHistory] = useState<MealRecord[]>([]);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [detectedItems, setDetectedItems] = useState<FoodItem[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('nutri_lens_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const saveToHistory = () => {
    if (!capturedImage || detectedItems.length === 0) return;

    const total = detectedItems.reduce((acc, item) => acc + item.calories, 0);
    const newRecord: MealRecord = {
      id: `meal-${Date.now()}`,
      timestamp: Date.now(),
      image: capturedImage,
      items: detectedItems,
      totalCalories: total
    };

    const newHistory = [newRecord, ...history];
    setHistory(newHistory);
    localStorage.setItem('nutri_lens_history', JSON.stringify(newHistory));
    
    // Reset and return home
    setCapturedImage(null);
    setDetectedItems([]);
    setActiveView('home');
  };

  const handleCapture = async (base64: string) => {
    setCapturedImage(base64);
    setIsScanning(true);
    setActiveView('scan');
    
    try {
      const items = await recognizeFood(base64);
      setDetectedItems(items);
    } catch (error) {
      alert("哎呀！识别失败了，请再试一次。");
    } finally {
      setIsScanning(false);
    }
  };

  const deleteMeal = (id: string) => {
    if (window.confirm("确定要删除这条记录吗？")) {
      const newHistory = history.filter(h => h.id !== id);
      setHistory(newHistory);
      localStorage.setItem('nutri_lens_history', JSON.stringify(newHistory));
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 flex flex-col pb-24 shadow-2xl relative">
      {/* Header */}
      <header className="px-6 py-8 flex justify-between items-center bg-white/50 backdrop-blur-md sticky top-0 z-30">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">慧食<span className="text-indigo-600"> AI</span></h1>
          <p className="text-slate-500 text-sm font-medium">智能热量追踪助手</p>
        </div>
        {activeView !== 'home' && (
          <button 
            onClick={() => {
              setActiveView('home');
              setCapturedImage(null);
              setDetectedItems([]);
            }} 
            className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </button>
        )}
      </header>

      {/* Main Content Area */}
      <main className="px-6 flex-1">
        {activeView === 'home' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Quick Summary Card */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">今日摄入</p>
                <h2 className="text-3xl font-bold text-slate-900">
                  {history
                    .filter(m => new Date(m.timestamp).toDateString() === new Date().toDateString())
                    .reduce((acc, m) => acc + m.totalCalories, 0)}
                  <span className="text-lg text-slate-400 font-medium ml-1">千卡</span>
                </h2>
              </div>
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                <svg className="text-indigo-600" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v10"/><path d="M18.4 4.6a10 10 0 1 1-12.8 0"/></svg>
              </div>
            </div>

            {/* Scan Prompt */}
            <div 
              onClick={() => setActiveView('scan')} 
              className="bg-indigo-600 p-8 rounded-[2rem] text-white flex flex-col items-center justify-center text-center space-y-4 cursor-pointer hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-200"
            >
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
              </div>
              <div>
                <h3 className="text-xl font-bold">拍摄餐食</h3>
                <p className="text-indigo-100 text-sm">AI 自动识别食物及热量</p>
              </div>
            </div>

            {/* Recent Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800">最近记录</h3>
                <button onClick={() => setActiveView('history')} className="text-indigo-600 text-sm font-semibold">查看全部</button>
              </div>
              <div className="space-y-4">
                {history.slice(0, 3).map(meal => (
                  <div key={meal.id} className="flex gap-4 items-center bg-white p-3 rounded-2xl border border-slate-100">
                    <img src={`data:image/jpeg;base64,${meal.image}`} className="w-16 h-16 rounded-xl object-cover" alt="餐食" />
                    <div className="flex-1">
                      <p className="font-bold text-slate-800 line-clamp-1">{meal.items.map(i => i.name).join(', ')}</p>
                      <p className="text-xs text-slate-400">{new Date(meal.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-indigo-600">{meal.totalCalories} 千卡</p>
                    </div>
                  </div>
                ))}
                {history.length === 0 && (
                  <div className="text-center py-12 text-slate-300">
                    <p>还没有记录任何餐食。</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeView === 'scan' && !capturedImage && (
          <CameraCapture 
            onCapture={handleCapture} 
            onClose={() => setActiveView('home')} 
          />
        )}

        {activeView === 'scan' && capturedImage && (
          <div className="space-y-6 pb-12 animate-in fade-in zoom-in-95 duration-300">
            <div className="relative">
              <FoodOverlay image={capturedImage} items={detectedItems} />
              {isScanning && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center text-white space-y-4">
                  <div className="w-12 h-12 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                  <p className="font-bold tracking-wide text-lg">AI 正在为您精准识别...</p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10 10 10 0 0 0-10-10zm1 15h-2v-6h2zm0-8h-2V7h2z"/></svg>
                识别详情
              </h3>
              <div className="divide-y divide-slate-50">
                {detectedItems.length > 0 ? (
                  detectedItems.map(item => (
                    <div key={item.id} className="py-4 flex justify-between items-center group">
                      <div>
                        <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{item.name}</p>
                        <p className="text-xs text-slate-400 font-medium">{item.portion}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900">{item.calories} <span className="text-[10px] text-slate-400 font-normal uppercase">Kcal</span></p>
                      </div>
                    </div>
                  ))
                ) : !isScanning && (
                  <p className="text-center py-4 text-slate-400 text-sm">未能识别出食物。请调整角度重拍。</p>
                )}
              </div>
              
              <div className="mt-6 pt-6 border-t border-slate-100 flex justify-between items-center">
                <span className="text-slate-400 font-bold text-sm uppercase">总计热量</span>
                <span className="text-2xl font-black text-indigo-600">
                  {detectedItems.reduce((acc, item) => acc + item.calories, 0)} 千卡
                </span>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => { setCapturedImage(null); setDetectedItems([]); }}
                className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl active:scale-95 transition-all"
              >
                重拍
              </button>
              <button 
                onClick={saveToHistory}
                disabled={isScanning || detectedItems.length === 0}
                className="flex-[2] py-4 bg-indigo-600 text-white font-bold rounded-2xl active:scale-95 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
              >
                记录这顿饭
              </button>
            </div>
          </div>
        )}

        {activeView === 'history' && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 pb-12">
            <h2 className="text-xl font-bold text-slate-800">历史记录表</h2>
            {history.length === 0 ? (
              <div className="text-center py-20 text-slate-400">暂无历史数据。</div>
            ) : (
              <div className="space-y-4">
                {history.map(meal => (
                  <div key={meal.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
                    <div className="h-40 relative">
                      <img src={`data:image/jpeg;base64,${meal.image}`} className="w-full h-full object-cover" alt="餐食" />
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-indigo-600">
                        {meal.totalCalories} 千卡
                      </div>
                      <button 
                        onClick={() => deleteMeal(meal.id)}
                        className="absolute top-4 left-4 bg-red-500/80 backdrop-blur p-2 rounded-full text-white hover:bg-red-600 transition-colors shadow-sm"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                      </button>
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          {new Date(meal.timestamp).toLocaleDateString()} {new Date(meal.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {meal.items.map(i => (
                          <span key={i.id} className="bg-slate-50 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-lg border border-slate-100">
                            {i.name} ({i.calories}k)
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeView === 'stats' && <StatsDashboard history={history} />}
      </main>

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto h-20 bg-white border-t border-slate-100 flex items-center justify-around px-4 z-40 rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <button 
          onClick={() => setActiveView('home')}
          className={`flex flex-col items-center gap-1 transition-all ${activeView === 'home' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={activeView === 'home' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
          <span className="text-[10px] font-bold">首页</span>
        </button>
        
        <button 
          onClick={() => { setActiveView('scan'); setCapturedImage(null); }}
          className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center text-white -mt-10 shadow-lg shadow-indigo-200 ring-4 ring-white active:scale-90 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
        </button>

        <button 
          onClick={() => setActiveView('stats')}
          className={`flex flex-col items-center gap-1 transition-all ${activeView === 'stats' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={activeView === 'stats' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
          <span className="text-[10px] font-bold">统计</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
