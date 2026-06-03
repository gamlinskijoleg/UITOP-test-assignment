import React from 'react';
import type { Todo, Category } from '../types';
import { Check, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface TodoItemProps {
  todo: Todo;
  category?: Category;
  selected?: boolean;
  onSelect?: (id: number, selected: boolean) => void;
  onToggleStatus: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({ 
  todo, category, selected, onSelect, onToggleStatus, onDelete 
}) => {
  return (
    <div className={twMerge(
      "group flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-md",
      todo.completed && "opacity-70 bg-gray-50",
      selected && "border-blue-300 bg-blue-50"
    )}>
      {onSelect && (
        <input 
          type="checkbox" 
          checked={selected}
          onChange={(e) => onSelect(todo.id, e.target.checked)}
          className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
        />
      )}
      
      <button 
        onClick={() => onToggleStatus(todo)}
        className={clsx(
          "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shrink-0",
          todo.completed ? "bg-green-500 border-green-500 text-white cursor-pointer" : "border-gray-300 hover:border-blue-500 text-transparent cursor-pointer"
        )}
      >
        <Check size={14} className={todo.completed ? "opacity-100" : "opacity-0"} />
      </button>

      <div className="flex-1 min-w-0">
        <p className={clsx(
          "text-gray-800 font-medium truncate transition-all",
          todo.completed && "line-through text-gray-500"
        )}>
          {todo.text}
        </p>
      </div>

      {category && (
        <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold whitespace-nowrap shrink-0">
          {category.name}
        </span>
      )}

      <button
        onClick={() => onDelete(todo)}
        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 shrink-0"
        aria-label="Delete task"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
};
