export interface Category {
  id: number;
  name: string;
}

export interface Todo {
  id: number;
  text: string;
  category_id: number;
  completed: boolean;
}
