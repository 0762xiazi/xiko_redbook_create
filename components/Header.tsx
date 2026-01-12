
import React from 'react';
import { Settings, Sparkles } from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="xhs-bg-red p-1.5 rounded-lg">
          <Sparkles className="text-white w-5 h-5" />
        </div>
        <h1 className="font-bold text-lg tracking-tight">小红书 AI 生成器</h1>
      </div>
      <button 
        onClick={onOpenSettings}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <Settings className="w-5 h-5 text-gray-600" />
      </button>
    </header>
  );
};

export default Header;
