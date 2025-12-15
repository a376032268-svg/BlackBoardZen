import React, { useState, useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import Chalkboard, { ChalkboardHandle } from './components/Chalkboard';
import Toolbar from './components/Toolbar';
import ProModal from './components/ProModal';
import { Language, ToolState, ChalkColor, Board, MAX_FREE_BOARDS } from './types';
import { TRANSLATIONS } from './constants';
import { analyzeChalkboard } from './services/geminiService';
import { Globe } from 'lucide-react';

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>(Language.ZH_CN);
  const [boards, setBoards] = useState<Board[]>([{ id: '1', name: 'Board 1' }]);
  const [activeBoardId, setActiveBoardId] = useState<string>('1');
  const [toolState, setToolState] = useState<ToolState>({
    color: ChalkColor.WHITE,
    size: 4,
    isEraser: false,
  });
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // We use refs to access the imperative handles of the chalkboards to save/load data
  // Using a map to store refs for each board id
  const boardRefs = useRef<Map<string, ChalkboardHandle>>(new Map());

  // Helper to sync ref map
  const getBoardRef = (id: string) => {
    return boardRefs.current.get(id);
  };

  const handleAddBoard = () => {
    if (boards.length >= MAX_FREE_BOARDS) {
      setIsProModalOpen(true);
      return;
    }
    const newId = Date.now().toString();
    const newBoard: Board = { id: newId, name: `Board ${boards.length + 1}` };
    setBoards([...boards, newBoard]);
    setActiveBoardId(newId);
  };

  const handleClear = () => {
    const activeRef = getBoardRef(activeBoardId);
    activeRef?.clear();
  };

  const handleStrokeEnd = () => {
    // Auto-save logic could go here (debounce save snapshot)
    const activeRef = getBoardRef(activeBoardId);
    if (activeRef) {
       const data = activeRef.getSnapshot();
       setBoards(prev => prev.map(b => b.id === activeBoardId ? { ...b, imageData: data } : b));
    }
  };

  const handleAnalyze = async () => {
    const activeRef = getBoardRef(activeBoardId);
    if (!activeRef) return;

    setIsAnalyzing(true);
    setAiResult(null);
    
    try {
        const imageBase64 = activeRef.getSnapshot();
        const prompt = TRANSLATIONS[language].aiPrompt;
        const result = await analyzeChalkboard(imageBase64, prompt);
        setAiResult(result);
    } catch (e) {
        console.error(e);
    } finally {
        setIsAnalyzing(false);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-chalkboard relative flex flex-col font-hand text-white select-none">
      
      {/* Top Bar (Language & Board Switcher) */}
      <div className="absolute top-0 left-0 right-0 p-4 z-40 flex justify-between items-start pointer-events-none">
        
        {/* Board Tabs */}
        <div className="flex gap-2 flex-wrap max-w-[70%] pointer-events-auto">
          {boards.map((board, index) => (
            <button
              key={board.id}
              onClick={() => setActiveBoardId(board.id)}
              className={`
                px-3 py-1 rounded-t-lg backdrop-blur-sm transition-all text-sm
                ${activeBoardId === board.id 
                  ? 'bg-white/10 text-white border-t border-x border-white/20 shadow-lg translate-y-0' 
                  : 'bg-black/20 text-gray-400 hover:bg-black/40 translate-y-1'
                }
              `}
            >
              {index + 1}
            </button>
          ))}
        </div>

        {/* Language Switcher */}
        <div className="pointer-events-auto relative group">
          <button className="p-2 bg-black/30 backdrop-blur rounded-full hover:bg-black/50 transition-colors">
            <Globe size={20} className="text-gray-300" />
          </button>
          <div className="absolute right-0 mt-2 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden hidden group-hover:block w-32 shadow-xl">
             {Object.values(Language).map(lang => (
                 <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-white/10 ${language === lang ? 'text-yellow-400' : 'text-gray-300'}`}
                 >
                    {lang === Language.ZH_CN && '简体中文'}
                    {lang === Language.ZH_TW && '繁體中文'}
                    {lang === Language.EN && 'English'}
                    {lang === Language.JA && '日本語'}
                 </button>
             ))}
          </div>
        </div>
      </div>

      {/* Main Content Area (Stacked Boards) */}
      <div className="flex-1 relative w-full h-full">
        {boards.map(board => (
          <div 
            key={board.id} 
            className={`absolute inset-0 transition-opacity duration-300 ${activeBoardId === board.id ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
          >
             <Chalkboard 
                ref={(el) => {
                    if (el) boardRefs.current.set(board.id, el);
                    else boardRefs.current.delete(board.id);
                }}
                isActive={activeBoardId === board.id}
                toolState={toolState}
                onStrokeEnd={handleStrokeEnd}
                initialData={board.imageData}
             />
          </div>
        ))}

        {/* AI Result Overlay */}
        {aiResult && (
            <div className="absolute top-20 right-4 z-30 max-w-xs md:max-w-md bg-black/60 backdrop-blur-md border border-white/20 p-4 rounded-xl shadow-2xl animate-in slide-in-from-right text-sm md:text-base overflow-y-auto max-h-[60vh]">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-blue-300">AI Teacher</h3>
                    <button onClick={() => setAiResult(null)} className="text-gray-400 hover:text-white">×</button>
                </div>
                <div className="prose prose-invert prose-sm">
                   <p className="whitespace-pre-wrap">{aiResult}</p>
                </div>
            </div>
        )}
      </div>

      <Toolbar 
        toolState={toolState}
        setToolState={setToolState}
        onClear={handleClear}
        onAddBoard={handleAddBoard}
        language={language}
        onAnalyze={handleAnalyze}
        isAnalyzing={isAnalyzing}
        onOpenPro={() => setIsProModalOpen(true)}
      />

      <ProModal 
        isOpen={isProModalOpen}
        onClose={() => setIsProModalOpen(false)}
        language={language}
      />
    </div>
  );
};

export default App;