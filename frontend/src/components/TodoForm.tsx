import React from 'react';
import { useForm } from 'react-hook-form';
import type { Category } from '../types';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

interface TodoFormProps {
  categories: Category[];
  onSubmit: (text: string, category_id: number) => Promise<void>;
}

interface FormValues {
  text: string;
  category_id: string;
}

export const TodoForm: React.FC<TodoFormProps> = ({ categories, onSubmit }) => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>();

  const handleFormSubmit = async (data: FormValues) => {
    try {
      await onSubmit(data.text, parseInt(data.category_id, 10));
      reset();
    } catch {
      toast.error('Failed to create task');
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-4 md:flex-row md:items-start mb-8">
      <div className="flex-1">
        <input
          {...register('text', { required: 'Task description is required' })}
          placeholder="What needs to be done?"
          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        {errors.text && <p className="text-red-500 text-sm mt-1">{errors.text.message}</p>}
      </div>

      <div className="w-full md:w-64">
        <select
          {...register('category_id', { required: 'Please select a category' })}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">Select category...</option>
          {categories.map(c => (
             <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        {errors.category_id && <p className="text-red-500 text-sm mt-1">{errors.category_id.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center min-w-30 disabled:opacity-70"
      >
        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Add Task'}
      </button>
    </form>
  );
};
