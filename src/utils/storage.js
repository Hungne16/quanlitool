import { collection, doc, getDocs, getDoc, setDoc, addDoc, updateDoc, deleteDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "../config/firebase";

export const DEFAULT_CATEGORIES = [
  'AI & Machine Learning',
  'Lập trình',
  'Thiết kế',
  'Năng suất',
  'Đọc sách & Tin tức',
  'Khác'
];

// --- CATEGORIES ---

export const getCategories = async () => {
  try {
    const docRef = doc(db, "settings", "categories");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().list;
    } else {
      await saveCategories(DEFAULT_CATEGORIES);
      return DEFAULT_CATEGORIES;
    }
  } catch (error) {
    console.error("Error getting categories:", error);
    return DEFAULT_CATEGORIES;
  }
};

export const saveCategories = async (categories) => {
  try {
    const docRef = doc(db, "settings", "categories");
    await setDoc(docRef, { list: categories });
  } catch (error) {
    console.error("Error saving categories:", error);
  }
};

// --- TAGS ---

export const GLOBAL_DEFAULT_TAGS = [
  'UI/UX',
  'Open Source',
  'Developer Tools',
  'Marketing',
  'SEO',
  'Design',
  'Productivity',
  'Analytics',
  'Free',
  'API',
  'No-Code'
];

export const getTags = async () => {
  try {
    const docRef = doc(db, "settings", "tags");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().list;
    } else {
      await saveTags(GLOBAL_DEFAULT_TAGS);
      return GLOBAL_DEFAULT_TAGS;
    }
  } catch (error) {
    console.error("Error getting tags:", error);
    return GLOBAL_DEFAULT_TAGS;
  }
};

export const saveTags = async (tags) => {
  try {
    const docRef = doc(db, "settings", "tags");
    await setDoc(docRef, { list: tags });
  } catch (error) {
    console.error("Error saving tags:", error);
  }
};

// --- TOOLS ---

export const getTools = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "tools"));
    const tools = [];
    
    // Migration: Default tags mapping for old data without tags
    const DEFAULT_TAGS = {
      'AI & Machine Learning': ['ai', 'bot', 'llm', 'chat', 'machine-learning'],
      'Lập trình': ['code', 'developer', 'ide', 'framework', 'programming'],
      'Thiết kế': ['design', 'ui', 'ux', 'graphics', 'assets'],
      'Năng suất': ['productivity', 'work', 'office', 'tools', 'management'],
      'Đọc sách & Tin tức': ['reading', 'news', 'books', 'articles'],
      'Khác': ['misc', 'other']
    };

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      let tags = data.tags;
      
      // Auto-assign tags if none exist
      if (!tags || tags.length === 0) {
        if (data.category && DEFAULT_TAGS[data.category]) {
          // Take first 3 tags randomly or deterministically
          tags = DEFAULT_TAGS[data.category].slice(0, 3);
        } else {
          tags = ['tool'];
        }
      }

      tools.push({ id: doc.id, ...data, tags });
    });
    return tools;
  } catch (error) {
    console.error("Error getting tools:", error);
    return [];
  }
};

export const saveTool = async (tool) => {
  try {
    const newTool = {
      ...tool,
      createdAt: new Date().toISOString()
    };
    const docRef = await addDoc(collection(db, "tools"), newTool);
    
    // Add points to user if they are logged in
    if (tool.submittedBy && tool.submittedBy !== 'guest') {
      await addPoints(tool.submittedBy, 10);
    }
    
    return { id: docRef.id, ...newTool };
  } catch (error) {
    console.error("Error saving tool:", error);
    throw error;
  }
};

export const addPoints = async (uid, amount) => {
  if (!uid || uid === 'guest') return;
  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const data = userSnap.data();
      const currentPoints = data.points || 0;
      await updateDoc(userRef, { points: currentPoints + amount });
    }
  } catch (error) {
    console.error("Error adding points:", error);
  }
};

export const updateTool = async (id, updates) => {
  try {
    const docRef = doc(db, "tools", id);
    await updateDoc(docRef, updates);
  } catch (error) {
    console.error("Error updating tool:", error);
  }
};

export const deleteTool = async (id) => {
  try {
    const docRef = doc(db, "tools", id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting tool:", error);
  }
};

export const toggleFavorite = async (uid, toolId, isCurrentlyFavorite) => {
  if (!uid) {
    console.error("Must be logged in to favorite tools");
    return;
  }
  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const data = userSnap.data();
      let favorites = data.favorites || [];
      if (isCurrentlyFavorite) {
        favorites = favorites.filter(id => id !== toolId);
      } else {
        favorites.push(toolId);
      }
      await updateDoc(userRef, { favorites });
    }
  } catch (error) {
    console.error("Error toggling favorite:", error);
  }
};

// --- RATING & REPORTING ---

export const rateTool = async (toolId, userId, score) => {
  if (!userId) return;
  try {
    const toolRef = doc(db, "tools", toolId);
    const toolSnap = await getDoc(toolRef);
    if (toolSnap.exists()) {
      const toolData = toolSnap.data();
      const ratings = toolData.ratings || {};
      const isNewRating = !(userId in ratings);
      ratings[userId] = score;
      await updateDoc(toolRef, { ratings });
      
      if (isNewRating) {
        await addPoints(userId, 2);
      }
    }
  } catch (error) {
    console.error("Error rating tool:", error);
    throw error;
  }
};

export const updateUserProfile = async (userId, data) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, data);
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

export const addComment = async (toolId, commentData) => {
  try {
    const toolRef = doc(db, "tools", toolId);
    await updateDoc(toolRef, {
      comments: arrayUnion({
        ...commentData,
        createdAt: new Date().toISOString()
      })
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    throw error;
  }
};

export const deleteComment = async (toolId, commentData) => {
  try {
    const toolRef = doc(db, "tools", toolId);
    // Use arrayRemove to remove the exact comment object
    await updateDoc(toolRef, {
      comments: arrayRemove(commentData)
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    throw error;
  }
};

export const reportTool = async (toolId, userId, reason, toolName) => {
  try {
    const report = {
      toolId,
      toolName,
      reportedBy: userId || 'guest',
      reason,
      status: 'unread',
      createdAt: new Date().toISOString()
    };
    await addDoc(collection(db, "reports"), report);
  } catch (error) {
    console.error("Error reporting tool:", error);
    throw error;
  }
};

export const getUnreadReports = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "reports"));
    const reports = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.status === 'unread') {
        reports.push({ id: doc.id, ...data });
      }
    });
    // Sort by newest first
    return reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    console.error("Error getting reports:", error);
    return [];
  }
};

export const markReportAsRead = async (reportId) => {
  try {
    const reportRef = doc(db, "reports", reportId);
    await updateDoc(reportRef, { status: 'read' });
  } catch (error) {
    console.error("Error marking report as read:", error);
  }
};

// --- IMPORT/EXPORT (Using JSON) ---

export const exportData = async () => {
  const tools = await getTools();
  const categories = await getCategories();
  
  const data = { tools, categories };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `quanlitool_backup_firestore_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const importData = async (jsonData) => {
  try {
    const data = JSON.parse(jsonData);
    
    // Import Categories
    if (data.categories && Array.isArray(data.categories)) {
      await saveCategories(data.categories);
    }

    // Import Tools (delete old ones and add new)
    if (data.tools && Array.isArray(data.tools)) {
      // First, get current tools and delete them
      const currentTools = await getTools();
      for (const t of currentTools) {
        await deleteTool(t.id);
      }
      
      // Add imported tools
      for (const t of data.tools) {
        const { id, ...toolData } = t; // Exclude old ID to let Firestore auto-generate
        await addDoc(collection(db, "tools"), toolData);
      }
    }
    return true;
  } catch (error) {
    console.error('Import failed:', error);
    return false;
  }
};

// --- INITIALIZATION ---
export const initStorage = async () => {
  // Only add initial data if the tools collection is completely empty
  const tools = await getTools();
  if (tools.length === 0) {
    const initialData = [
      { title: 'ChatGPT', description: 'Trợ lý AI thông minh từ OpenAI.', url: 'https://chat.openai.com', category: 'AI & Machine Learning', createdAt: new Date().toISOString(), isFavorite: true },
      { title: 'GitHub', description: 'Nền tảng lưu trữ mã nguồn lớn nhất.', url: 'https://github.com', category: 'Lập trình', createdAt: new Date().toISOString(), isFavorite: true },
    ];
    for (const t of initialData) {
      await addDoc(collection(db, "tools"), t);
    }
  }
};

// --- ANALYTICS ---
export const trackPageView = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const docRef = doc(db, "analytics", today);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      await updateDoc(docRef, { pageViews: docSnap.data().pageViews + 1 });
    } else {
      await setDoc(docRef, { pageViews: 1, date: today });
    }
  } catch (error) {
    console.error("Error tracking page view:", error);
  }
};

export const getAnalyticsData = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "analytics"));
    const data = [];
    querySnapshot.forEach((doc) => {
      data.push(doc.data());
    });
    return data.sort((a, b) => new Date(a.date) - new Date(b.date));
  } catch (error) {
    console.error("Error getting analytics:", error);
    return [];
  }
};

