import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

export type Todo = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
};

type TodosContextValue = {
  todos: Todo[];
  addTodo: (title: string) => void;
  toggleTodo: (id: string) => void;
  removeTodo: (id: string) => void;
  clearCompleted: () => void;
};

const TodosContext = createContext<TodosContextValue | undefined>(undefined);

const STORAGE_KEY = '@simple_todo/todos';

const isValidTodo = (value: unknown): value is Todo => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const maybe = value as Partial<Todo>;
  return (
    typeof maybe.id === 'string' &&
    typeof maybe.title === 'string' &&
    typeof maybe.createdAt === 'string' &&
    typeof maybe.completed === 'boolean'
  );
};

const sortByCreatedAtDesc = (items: Todo[]) =>
  [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

export function TodosProvider({ children }: { children: ReactNode }) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const hydrateTodos = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (!stored) {
          setTodos([]);
          return;
        }

        const parsed = JSON.parse(stored) as unknown;
        if (!Array.isArray(parsed)) {
          setTodos([]);
          return;
        }

        const normalized = parsed.filter(isValidTodo);
        setTodos(sortByCreatedAtDesc(normalized));
      } catch (error) {
        console.error('Failed to load todos', error);
        setTodos([]);
      } finally {
        setHydrated(true);
      }
    };

    hydrateTodos();
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    const persistTodos = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
      } catch (error) {
        console.error('Failed to persist todos', error);
      }
    };

    void persistTodos();
  }, [todos, hydrated]);

  const addTodo = useCallback((title: string) => {
    const trimmed = title.trim();
    if (!trimmed) {
      return;
    }

    const todo: Todo = {
      id: `todo-${Date.now()}`,
      title: trimmed,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    setTodos(prev => sortByCreatedAtDesc([todo, ...prev]));
  }, []);

  const toggleTodo = useCallback((id: string) => {
    setTodos(prev =>
      prev.map(todo => (todo.id === id ? { ...todo, completed: !todo.completed } : todo))
    );
  }, []);

  const removeTodo = useCallback((id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  }, []);

  const clearCompleted = useCallback(() => {
    setTodos(prev => prev.filter(todo => !todo.completed));
  }, []);

  const value = useMemo(
    () => ({
      todos,
      addTodo,
      toggleTodo,
      removeTodo,
      clearCompleted,
    }),
    [todos, addTodo, toggleTodo, removeTodo, clearCompleted]
  );

  return <TodosContext.Provider value={value}>{children}</TodosContext.Provider>;
}

export function useTodos() {
  const context = useContext(TodosContext);
  if (!context) {
    throw new Error('useTodos must be used within a TodosProvider');
  }
  return context;
}
