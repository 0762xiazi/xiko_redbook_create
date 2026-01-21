
import React from 'react';
import { Settings, Sparkles, LogOut, User } from 'lucide-react';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface HeaderProps {
  onOpenSettings: () => void;
  user: User | null;
  onLogout: () => void;
  onLogin: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenSettings, user, onLogout, onLogin }) => {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="xhs-bg-red p-1.5 rounded-lg">
          <Sparkles className="text-white w-5 h-5" />
        </div>
        <h1 className="font-bold text-lg tracking-tight">推文 AI 生成器</h1>
      </div>
      
      <div className="flex items-center gap-2">
        {user ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
              <User className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                {user.name || user.email.split('@')[0]}
              </span>
            </div>
            <button 
              onClick={onLogout}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="登出"
            >
              <LogOut className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        ) : (
          <button 
            onClick={onLogin}
            className="bg-[#ff2442] text-white font-bold py-2 px-4 rounded-lg hover:bg-[#ff0022] transition-colors"
          >
            登录
          </button>
        )}
        
        <button 
          onClick={onOpenSettings}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          title="设置"
        >
          <Settings className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </header>
  );
};

export default Header;
