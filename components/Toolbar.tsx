import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Eraser, Plus, Sparkles, Coffee } from 'lucide-react';
import { ChalkColor, ToolState, Language } from '../types';
import { TRANSLATIONS, CHALK_COLORS } from '../constants';

interface ToolbarProps {
  toolState: ToolState;
  setToolState: (s: ToolState) => void;
  onClear: () => void;
  onAddBoard: () => void;
  language: Language;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  onOpenPro: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  toolState,
  setToolState,
  onClear,
  onAddBoard,
  language,
  onAnalyze,
  isAnalyzing,
  onOpenPro
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const t = TRANSLATIONS[language];

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 flex justify-center pointer-events-none z-50">
      <div className={`
        bg-black/80 backdrop-blur-md rounded-2xl shadow-2xl border border-white/10 
        pointer-events-auto transition-all duration-300 ease-spring
        flex flex-col items-center overflow-hidden
        ${isExpanded ? 'w-[90%] max-w-2xl py-3 px-4' : 'w-16 h-12 justify-center'}
      `}>
        
        {/* Toggle Handle */}
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute top-0 left-0 w-full h-4 flex items-center justify-center opacity-50 hover:opacity-100"
        >
          {isExpanded ? <ChevronDown size={14} className="text-white" /> : <ChevronUp size={14} className="text-white mt-2" />}
        </button>

        {isExpanded && (
          <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4 mt-2">
            
            {/* Colors */}
            <div className="flex gap-3">
              {CHALK_COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => setToolState({ ...toolState, color, isEraser: false })}
                  className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                    !toolState.isEraser && toolState.color === color ? 'border-white scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            <div className="w-px h-8 bg-white/20 hidden sm:block"></div>

            {/* Tools */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setToolState({ ...toolState, isEraser: true })}
                className={`p-2 rounded-lg transition-colors flex flex-col items-center ${
                  toolState.isEraser ? 'bg-white/20 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Eraser size={20} />
                <span className="text-[10px] mt-1">{t.eraser}</span>
              </button>

              <button
                onClick={onClear}
                className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-white/5 flex flex-col items-center transition-colors"
              >
                <span className="text-xl leading-5">×</span>
                <span className="text-[10px] mt-1">{t.clear}</span>
              </button>
            </div>

            <div className="w-px h-8 bg-white/20 hidden sm:block"></div>

            {/* Actions */}
            <div className="flex items-center gap-3">
               <button
                onClick={onAddBoard}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                title={t.addBoard}
              >
                <Plus size={20} />
              </button>

              <button
                onClick={onOpenPro}
                className="p-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 rounded-full transition-colors"
                title="Pro"
              >
                <Coffee size={20} />
              </button>

              <button
                onClick={onAnalyze}
                disabled={isAnalyzing}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all
                  ${isAnalyzing 
                    ? 'bg-blue-500/50 text-blue-200 cursor-wait' 
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/30'
                  }
                `}
              >
                <Sparkles size={16} className={isAnalyzing ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">{isAnalyzing ? t.aiAnalyzing : t.aiAnalyze}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Toolbar;