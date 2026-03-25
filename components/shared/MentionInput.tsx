'use client';

import { useState, useRef, useEffect } from 'react';
import { User } from '@/lib/types';
import { Avatar } from '@/components/shared';
import { motion, AnimatePresence } from 'framer-motion';

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  users: User[];
  placeholder?: string;
  className?: string;
}

export default function MentionInput({ value, onChange, onSend, users, placeholder, className }: MentionInputProps) {
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [cursorPos, setCursorPos] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(mentionFilter.toLowerCase()) ||
    u.email.toLowerCase().includes(mentionFilter.toLowerCase())
  ).slice(0, 5);

  useEffect(() => {
    const lastChar = value[cursorPos - 1];
    const textBeforeCursor = value.slice(0, cursorPos);
    const lastAtSymbol = textBeforeCursor.lastIndexOf('@');

    if (lastAtSymbol !== -1 && !textBeforeCursor.slice(lastAtSymbol + 1).includes(' ')) {
      setShowMentions(true);
      setMentionFilter(textBeforeCursor.slice(lastAtSymbol + 1));
      setSelectedIndex(0);
    } else {
      setShowMentions(false);
    }
  }, [value, cursorPos]);

  const handleSelectUser = (user: User) => {
    const textBeforeAt = value.slice(0, value.lastIndexOf('@', cursorPos - 1));
    const textAfterCursor = value.slice(cursorPos);
    const newValue = `${textBeforeAt}@${user.name} ${textAfterCursor}`;
    onChange(newValue);
    setShowMentions(false);
    
    // Reset cursor position
    setTimeout(() => {
      if (textareaRef.current) {
        const newPos = textBeforeAt.length + user.name.length + 2;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newPos, newPos);
      }
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showMentions) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredUsers.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredUsers.length) % filteredUsers.length);
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        if (filteredUsers[selectedIndex]) {
          handleSelectUser(filteredUsers[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        setShowMentions(false);
      }
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={e => {
          onChange(e.target.value);
          setCursorPos(e.target.selectionStart);
        }}
        onKeyUp={e => setCursorPos((e.target as any).selectionStart)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={1}
        className="w-full bg-transparent text-sm md:text-base text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-600 resize-none focus:outline-none max-h-40 min-h-[24px] py-1"
      />

      <AnimatePresence>
        {showMentions && filteredUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute bottom-full left-0 mb-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 p-2"
          >
            <div className="px-3 py-2 border-b border-slate-50 dark:border-white/5 mb-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mention Team Member</p>
            </div>
            {filteredUsers.map((user, index) => (
              <button
                key={user.id}
                onClick={() => handleSelectUser(user)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                  index === selectedIndex 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                    : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Avatar name={user.name} size="sm" className={index === selectedIndex ? 'ring-2 ring-white/20' : ''} />
                <div className="text-left min-w-0">
                  <p className="text-xs font-black truncate">{user.name}</p>
                  <p className={`text-[10px] font-bold truncate opacity-70 ${index === selectedIndex ? 'text-indigo-100' : ''}`}>
                    {user.role}
                  </p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
