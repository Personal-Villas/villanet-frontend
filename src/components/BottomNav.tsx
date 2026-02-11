import React from 'react';
import { Home, Search, Heart, MessageCircle } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'explore', label: 'Explore', icon: Search },
    { id: 'saved', label: 'Saved', icon: Heart },
    { id: 'inquiry', label: 'Inquiry', icon: MessageCircle },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[60] bg-white/80 backdrop-blur-md border-t border-neutral-100 pb-safe-area md:hidden">
      <div className="flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
                isActive ? 'text-neutral-900' : 'text-neutral-400'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'fill-current' : ''}`} />
              <span className="text-[10px] font-medium tracking-tight">
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute bottom-1 w-1 h-1 bg-neutral-900 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};