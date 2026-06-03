import express, { Request, Response } from 'express';
import cors from 'cors';
import db from './db';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Get categories
app.get('/categories', (req: Request, res: Response) => {
  try {
    const categories = db.prepare('SELECT * FROM categories').all();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get todos
app.get('/todos', (req: Request, res: Response) => {
  try {
    const categoryId = req.query.category;
    let todos;
    if (categoryId && categoryId !== 'all') {
      todos = db.prepare('SELECT * FROM todos WHERE category_id = ?').all(categoryId);
    } else {
      todos = db.prepare('SELECT * FROM todos').all();
    }
    // Convert completed 1/0 to true/false
    const formattedTodos = todos.map((t: any) => ({ ...t, completed: !!t.completed }));
    res.json(formattedTodos);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

// Create todo
app.post('/todos', (req: Request, res: Response) => {
  try {
    const { text, category_id } = req.body;
    
    if (!text || !category_id) {
      return res.status(400).json({ error: 'Text and category_id are required' });
    }

    // Check limit
    const countRes = db.prepare('SELECT COUNT(*) as count FROM todos WHERE category_id = ?').get(category_id) as { count: number };
    if (countRes.count >= 5) {
      return res.status(400).json({ error: 'Category has reached the maximum of 5 tasks' });
    }

    const info = db.prepare('INSERT INTO todos (text, category_id, completed) VALUES (?, ?, 0)').run(text, category_id);
    const newTodo = db.prepare('SELECT * FROM todos WHERE id = ?').get(info.lastInsertRowid) as any;
    
    res.status(201).json({ ...newTodo, completed: !!newTodo.completed });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

// Update todo status
app.patch('/todos/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;
    
    if (completed === undefined) {
      return res.status(400).json({ error: 'completed status is required' });
    }

    const info = db.prepare('UPDATE todos SET completed = ? WHERE id = ?').run(completed ? 1 : 0, id);
    if (info.changes === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    const updatedTodo = db.prepare('SELECT * FROM todos WHERE id = ?').get(id) as any;
    res.json({ ...updatedTodo, completed: !!updatedTodo.completed });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

// Delete todo
app.delete('/todos/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const info = db.prepare('DELETE FROM todos WHERE id = ?').run(id);
    if (info.changes === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

// Bulk update
app.patch('/todos/bulk/update', (req: Request, res: Response) => {
  try {
    const { ids, completed } = req.body;
    if (!Array.isArray(ids) || completed === undefined) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    const stmt = db.prepare('UPDATE todos SET completed = ? WHERE id = ?');
    const transaction = db.transaction((todos: number[]) => {
      for (const id of todos) {
        stmt.run(completed ? 1 : 0, id);
      }
    });
    transaction(ids);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to bulk update' });
  }
});

// Bulk delete
app.post('/todos/bulk/delete', (req: Request, res: Response) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids)) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    const stmt = db.prepare('DELETE FROM todos WHERE id = ?');
    const transaction = db.transaction((todos: number[]) => {
      for (const id of todos) {
        stmt.run(id);
      }
    });
    transaction(ids);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to bulk delete' });
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
  });
}

export default app;
