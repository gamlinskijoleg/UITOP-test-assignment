import axios from 'axios';
import type { Todo, Category } from '../types';

const API_URL = import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? 'http://localhost:3001' : '');

if (!API_URL) {
  throw new Error('VITE_API_URL is not set. Configure it in Vercel to point to the Render backend URL.');
}

export const api = axios.create({
  baseURL: API_URL,
});

export const getCategories = async (): Promise<Category[]> => {
  const res = await api.get('/categories');
  return res.data;
};

export const getTodos = async (categoryId?: string): Promise<Todo[]> => {
  const params = categoryId && categoryId !== 'all' ? { category: categoryId } : {};
  const res = await api.get('/todos', { params });
  return res.data;
};

export const createTodo = async (text: string, category_id: number): Promise<Todo> => {
  const res = await api.post('/todos', { text, category_id });
  return res.data;
};

export const updateTodoStatus = async (id: number, completed: boolean): Promise<Todo> => {
  const res = await api.patch(`/todos/${id}`, { completed });
  return res.data;
};

export const deleteTodo = async (id: number): Promise<void> => {
  await api.delete(`/todos/${id}`);
};

export const bulkUpdateTodos = async (ids: number[], completed: boolean): Promise<void> => {
  await api.patch('/todos/bulk/update', { ids, completed });
};

export const bulkDeleteTodos = async (ids: number[]): Promise<void> => {
  await api.post('/todos/bulk/delete', { ids });
};
