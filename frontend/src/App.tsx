import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import type { Todo, Category } from './types';
import * as api from './api/client';
import { TodoForm } from './components/TodoForm';
import { TodoItem } from './components/TodoItem';
import { LayoutList, Loader2, AlertCircle } from 'lucide-react';

const App = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Store timeouts for undo actions
  const timeoutsRef = useRef<{ [key: string]: NodeJS.Timeout }>({});
  const toastIdsRef = useRef<{ [key: string]: string }>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cats, td] = await Promise.all([
        api.getCategories(),
        api.getTodos(selectedCategory)
      ]);
      setCategories(cats);
      setTodos(td);
    } catch (err) {
      setError('Failed to load data. Please make sure backend is running.');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateTodo = async (text: string, category_id: number) => {
    const newTodo = await api.createTodo(text, category_id);
    if (selectedCategory === 'all' || selectedCategory === category_id.toString()) {
      setTodos(prev => [...prev, newTodo]);
    }
    toast.success('Task created successfully');
  };

  const executeAction = async (todoId: number, actionType: 'delete' | 'complete', isBulk: boolean = false) => {
    try {
      if (actionType === 'delete') {
        if (!isBulk) await api.deleteTodo(todoId);
        setTodos(prev => prev.filter(t => t.id !== todoId));
      } else {
        if (!isBulk) await api.updateTodoStatus(todoId, true);
        // Requirement says if task is completed it is removed from list, or we just keep it?
        // Let's filter it out if we want it "removed" as per requirement, or just update status.
        setTodos(prev => prev.filter(t => t.id !== todoId));
      }
    } catch (err) {
      console.error(err);
      toast.error('Action failed');
      fetchData(); // reload on error
    }
  };

  const handleActionWithUndo = (todo: Todo, actionType: 'delete' | 'complete') => {
    const actionId = `${actionType}-${todo.id}`;

    // Optimistic UI update
    setTodos(prev => {
      if (actionType === 'delete') return prev.filter(t => t.id !== todo.id);
      return prev.map(t => t.id === todo.id ? { ...t, completed: true } : t);
    });

    const toastId = toast(
      (t) => (
        <div className="flex items-center gap-4">
          <span>Task {actionType === 'delete' ? 'deleted' : 'completed'}</span>
          <button 
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md font-medium text-sm hover:bg-blue-200 transition-colors"
            onClick={() => {
              toast.dismiss(t.id);
              clearTimeout(timeoutsRef.current[actionId]);
              delete timeoutsRef.current[actionId];
              delete toastIdsRef.current[actionId];
              // Revert optimistic update
              setTodos(prev => {
                if (actionType === 'delete') return [...prev, todo].sort((a,b) => a.id - b.id);
                return prev.map(t => t.id === todo.id ? { ...t, completed: false } : t);
              });
            }}
          >
            Undo
          </button>
        </div>
      ),
      { duration: 5000, position: 'bottom-center' }
    );
    toastIdsRef.current[actionId] = toastId;

    // Schedule actual API call
    timeoutsRef.current[actionId] = setTimeout(async () => {
      await executeAction(todo.id, actionType);
      delete timeoutsRef.current[actionId];
      delete toastIdsRef.current[actionId];
    }, 5000);
  };

  const handleToggleComplete = async (todo: Todo) => {
    if (todo.completed) {
      const actionId = `complete-${todo.id}`;
      if (timeoutsRef.current[actionId]) {
        clearTimeout(timeoutsRef.current[actionId]);
        delete timeoutsRef.current[actionId];
        if (toastIdsRef.current[actionId]) {
          toast.dismiss(toastIdsRef.current[actionId]);
          delete toastIdsRef.current[actionId];
        }
        setTodos(prev => prev.map(t => t.id === todo.id ? { ...t, completed: false } : t));
      } else {
        try {
          setTodos(prev => prev.map(t => t.id === todo.id ? { ...t, completed: false } : t));
          await api.updateTodoStatus(todo.id, false);
        } catch (err) {
          toast.error('Failed to uncomplete task');
          fetchData();
        }
      }
    } else {
      handleActionWithUndo(todo, 'complete');
    }
  };

  const handleBulkAction = async (actionType: 'delete' | 'complete') => {
    if (selectedIds.size === 0) return;
    const idsArray = Array.from(selectedIds);
    
    // Optimistic update
    const savedTodos = [...todos];
    setTodos(prev => {
      if (actionType === 'delete') return prev.filter(t => !selectedIds.has(t.id));
      return prev.map(t => selectedIds.has(t.id) ? { ...t, completed: true } : t);
    });
    setSelectedIds(new Set());

    const bulkActionId = `bulk-${Date.now()}`;

    const toastId = toast(
      (t) => (
        <div className="flex items-center gap-4">
          <span>{idsArray.length} tasks {actionType === 'delete' ? 'deleted' : 'completed'}</span>
          <button 
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md font-medium text-sm"
            onClick={() => {
              toast.dismiss(t.id);
              clearTimeout(timeoutsRef.current[bulkActionId]);
              delete timeoutsRef.current[bulkActionId];
              setTodos(savedTodos);
            }}
          >
            Undo
          </button>
        </div>
      ),
      { duration: 5000, position: 'bottom-center' }
    );

    timeoutsRef.current[bulkActionId] = setTimeout(async () => {
      try {
        if (actionType === 'delete') {
          await api.bulkDeleteTodos(idsArray);
          setTodos(prev => prev.filter(t => !idsArray.includes(t.id)));
        } else {
          await api.bulkUpdateTodos(idsArray, true);
        }
      } catch(err) {
        toast.error('Bulk action failed');
        fetchData();
      } finally {
        delete timeoutsRef.current[bulkActionId];
      }
    }, 5000);
  };

  const toggleSelection = (id: number, selected: boolean) => {
    const newSet = new Set(selectedIds);
    if (selected) newSet.add(id);
    else newSet.delete(id);
    setSelectedIds(newSet);
  };

  const selectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedIds(new Set(todos.map(t => t.id)));
    else setSelectedIds(new Set());
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <Toaster />
      <div className="max-w-4xl mx-auto">
        <header className="mb-10 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-200">
            <LayoutList size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Tasks Manager</h1>
          <p className="text-gray-500">Organize your work, one task at a time.</p>
        </header>

        <TodoForm categories={categories} onSubmit={handleCreateTodo} />

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <input
                type="checkbox"
                onChange={selectAll}
                checked={todos.length > 0 && selectedIds.size === todos.length}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer ml-1"
              />
              <span className="text-sm font-medium text-gray-600">Select All</span>

              {selectedIds.size > 0 && (
                <div className="flex gap-2 ml-4">
                  <button onClick={() => handleBulkAction('complete')} className="text-sm px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-medium transition-colors">
                    Complete Selected
                  </button>
                  <button onClick={() => handleBulkAction('delete')} className="text-sm px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium transition-colors">
                    Delete Selected
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-sm font-medium text-gray-600 whitespace-nowrap">Filter by:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full sm:w-48 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
              >
                <option value="all">All Categories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Loader2 size={32} className="animate-spin mb-4 text-blue-500" />
                <p>Loading tasks...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12 text-red-400">
                <AlertCircle size={48} className="mb-4 text-red-500 opacity-50" />
                <p>{error}</p>
              </div>
            ) : todos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <div className="w-24 h-24 mb-6 rounded-full bg-gray-50 flex items-center justify-center">
                  <LayoutList size={40} className="text-gray-300" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No tasks found</h3>
                <p className="text-gray-400 max-w-sm text-center">
                  {selectedCategory === 'all'
                    ? "You don't have any tasks yet. Create one above to get started!"
                    : "No tasks in this category."}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {todos.map(todo => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    category={categories.find(c => c.id === todo.category_id)}
                    selected={selectedIds.has(todo.id)}
                    onSelect={toggleSelection}
                    onToggleStatus={handleToggleComplete}
                    onDelete={(t) => handleActionWithUndo(t, 'delete')}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
