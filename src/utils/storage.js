const STORAGE_KEY = 'tool_manager_data_v2';
const CATEGORY_STORAGE_KEY = 'tool_manager_categories_v2';

// Default categories in Vietnamese
export const DEFAULT_CATEGORIES = [
  'AI & Machine Learning',
  'Lập trình',
  'Thiết kế',
  'Năng suất',
  'Đọc sách & Tin tức',
  'Khác'
];

export const getCategories = () => {
  const data = localStorage.getItem(CATEGORY_STORAGE_KEY);
  return data ? JSON.parse(data) : DEFAULT_CATEGORIES;
};

export const saveCategories = (categories) => {
  localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(categories));
};

export const getTools = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveTool = (tool) => {
  const tools = getTools();
  const newTool = {
    ...tool,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
    isFavorite: false
  };
  tools.push(newTool);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tools));
  return newTool;
};

export const updateTool = (id, updates) => {
  const tools = getTools();
  const updatedTools = tools.map(t => t.id === id ? { ...t, ...updates } : t);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTools));
  return updatedTools;
};

export const deleteTool = (id) => {
  const tools = getTools();
  const updatedTools = tools.filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTools));
  return updatedTools;
};

export const toggleFavorite = (id) => {
  const tools = getTools();
  const updatedTools = tools.map(t => {
    if (t.id === id) {
      return { ...t, isFavorite: !t.isFavorite };
    }
    return t;
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTools));
  return updatedTools;
};

export const exportData = () => {
  const data = {
    tools: getTools(),
    categories: getCategories()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `quanlitool_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const importData = (jsonData) => {
  try {
    const data = JSON.parse(jsonData);
    if (data.tools && Array.isArray(data.tools)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.tools));
    }
    if (data.categories && Array.isArray(data.categories)) {
      localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(data.categories));
    }
    return true;
  } catch (error) {
    console.error('Import failed:', error);
    return false;
  }
};

// V2 Initial Data
const initialData = [
  // AI & Machine Learning
  { id: 'ai-1', title: 'ChatGPT', description: 'Trợ lý AI thông minh từ OpenAI.', url: 'https://chat.openai.com', category: 'AI & Machine Learning', createdAt: new Date().toISOString(), isFavorite: true },
  { id: 'dev-1', title: 'GitHub', description: 'Nền tảng lưu trữ mã nguồn lớn nhất.', url: 'https://github.com', category: 'Lập trình', createdAt: new Date().toISOString(), isFavorite: true },
];

export const initStorage = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
  }
  const cats = localStorage.getItem(CATEGORY_STORAGE_KEY);
  if (!cats) {
    localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(DEFAULT_CATEGORIES));
  }
};
