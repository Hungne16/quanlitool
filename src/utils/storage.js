const STORAGE_KEY = 'tool_manager_data_v2';

// Default categories in Vietnamese
export const DEFAULT_CATEGORIES = [
  'Tất cả',
  'AI & Machine Learning',
  'Lập trình',
  'Thiết kế',
  'Năng suất',
  'Đọc sách & Tin tức',
  'Khác'
];

export const getTools = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveTool = (tool) => {
  const tools = getTools();
  const newTool = {
    ...tool,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString()
  };
  tools.push(newTool);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tools));
  return newTool;
};

export const deleteTool = (id) => {
  const tools = getTools();
  const updatedTools = tools.filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTools));
  return updatedTools;
};

// V2 Initial Data - 5 useful tools per category
const initialData = [
  // AI & Machine Learning
  { id: 'ai-1', title: 'ChatGPT', description: 'Trợ lý AI thông minh từ OpenAI, giúp giải đáp mọi thắc mắc và hỗ trợ công việc hiệu quả.', url: 'https://chat.openai.com', category: 'AI & Machine Learning', createdAt: new Date().toISOString() },
  { id: 'ai-2', title: 'Claude', description: 'AI an toàn và thông minh từ Anthropic, rất giỏi trong việc phân tích văn bản dài và lập trình.', url: 'https://claude.ai', category: 'AI & Machine Learning', createdAt: new Date().toISOString() },
  { id: 'ai-3', title: 'Midjourney', description: 'Công cụ AI tạo ảnh nghệ thuật đỉnh cao thông qua các dòng lệnh prompt.', url: 'https://midjourney.com', category: 'AI & Machine Learning', createdAt: new Date().toISOString() },
  { id: 'ai-4', title: 'Perplexity AI', description: 'Công cụ tìm kiếm kết hợp AI, cung cấp câu trả lời có trích dẫn nguồn uy tín.', url: 'https://www.perplexity.ai', category: 'AI & Machine Learning', createdAt: new Date().toISOString() },
  { id: 'ai-5', title: 'Hugging Face', description: 'Cộng đồng AI lớn nhất thế giới, nơi chia sẻ các mô hình Machine Learning mã nguồn mở.', url: 'https://huggingface.co', category: 'AI & Machine Learning', createdAt: new Date().toISOString() },

  // Lập trình
  { id: 'dev-1', title: 'GitHub', description: 'Nền tảng lưu trữ mã nguồn và làm việc nhóm lớn nhất dành cho lập trình viên.', url: 'https://github.com', category: 'Lập trình', createdAt: new Date().toISOString() },
  { id: 'dev-2', title: 'Stack Overflow', description: 'Diễn đàn hỏi đáp không thể thiếu để gỡ rối các vấn đề lập trình.', url: 'https://stackoverflow.com', category: 'Lập trình', createdAt: new Date().toISOString() },
  { id: 'dev-3', title: 'Vercel', description: 'Nền tảng triển khai (deploy) ứng dụng web frontend nhanh chóng và tối ưu.', url: 'https://vercel.com', category: 'Lập trình', createdAt: new Date().toISOString() },
  { id: 'dev-4', title: 'CodePen', description: 'Môi trường viết code frontend trực tuyến để test và chia sẻ các ý tưởng UI.', url: 'https://codepen.io', category: 'Lập trình', createdAt: new Date().toISOString() },
  { id: 'dev-5', title: 'Supabase', description: 'Giải pháp mã nguồn mở thay thế Firebase, cung cấp Postgres database và Authentication.', url: 'https://supabase.com', category: 'Lập trình', createdAt: new Date().toISOString() },

  // Thiết kế
  { id: 'des-1', title: 'Figma', description: 'Công cụ thiết kế giao diện UI/UX trên trình duyệt, hỗ trợ cộng tác thời gian thực rất mạnh.', url: 'https://figma.com', category: 'Thiết kế', createdAt: new Date().toISOString() },
  { id: 'des-2', title: 'Dribbble', description: 'Cộng đồng dành cho các nhà thiết kế chia sẻ portfolio và tìm kiếm cảm hứng UI/UX.', url: 'https://dribbble.com', category: 'Thiết kế', createdAt: new Date().toISOString() },
  { id: 'des-3', title: 'Behance', description: 'Nền tảng của Adobe giúp khám phá và chia sẻ các dự án sáng tạo từ khắp nơi trên thế giới.', url: 'https://www.behance.net', category: 'Thiết kế', createdAt: new Date().toISOString() },
  { id: 'des-4', title: 'Coolors', description: 'Công cụ tạo và khám phá các bảng màu (color palettes) siêu nhanh cho thiết kế.', url: 'https://coolors.co', category: 'Thiết kế', createdAt: new Date().toISOString() },
  { id: 'des-5', title: 'Spline', description: 'Công cụ thiết kế 3D trên trình duyệt, tạo ra các trải nghiệm web 3D tương tác dễ dàng.', url: 'https://spline.design', category: 'Thiết kế', createdAt: new Date().toISOString() },

  // Năng suất
  { id: 'prod-1', title: 'Notion', description: 'Không gian làm việc tất cả trong một: ghi chú, quản lý dự án, wiki và database.', url: 'https://notion.so', category: 'Năng suất', createdAt: new Date().toISOString() },
  { id: 'prod-2', title: 'Obsidian', description: 'Phần mềm ghi chú Markdown tạo mạng lưới liên kết kiến thức như não bộ.', url: 'https://obsidian.md', category: 'Năng suất', createdAt: new Date().toISOString() },
  { id: 'prod-3', title: 'Todoist', description: 'Ứng dụng quản lý công việc và to-do list được đánh giá cao về độ hiệu quả.', url: 'https://todoist.com', category: 'Năng suất', createdAt: new Date().toISOString() },
  { id: 'prod-4', title: 'Linear', description: 'Trình theo dõi issue và quản lý dự án siêu tốc độ dành cho các team phần mềm hiện đại.', url: 'https://linear.app', category: 'Năng suất', createdAt: new Date().toISOString() },
  { id: 'prod-5', title: 'Trello', description: 'Quản lý dự án theo phong cách bảng Kanban trực quan và siêu dễ dùng.', url: 'https://trello.com', category: 'Năng suất', createdAt: new Date().toISOString() },

  // Đọc sách & Tin tức
  { id: 'news-1', title: 'Hacker News', description: 'Nguồn tin tức công nghệ và khởi nghiệp cập nhật nhất từ Y Combinator.', url: 'https://news.ycombinator.com', category: 'Đọc sách & Tin tức', createdAt: new Date().toISOString() },
  { id: 'news-2', title: 'Medium', description: 'Nền tảng xuất bản và đọc các bài viết chuyên sâu về mọi lĩnh vực từ các chuyên gia.', url: 'https://medium.com', category: 'Đọc sách & Tin tức', createdAt: new Date().toISOString() },
  { id: 'news-3', title: 'Feedly', description: 'Trình đọc RSS thông minh giúp tổng hợp tin tức từ các blog và báo bạn yêu thích.', url: 'https://feedly.com', category: 'Đọc sách & Tin tức', createdAt: new Date().toISOString() },
  { id: 'news-4', title: 'Goodreads', description: 'Cộng đồng lớn nhất thế giới để theo dõi, đánh giá và tìm kiếm sách hay để đọc.', url: 'https://goodreads.com', category: 'Đọc sách & Tin tức', createdAt: new Date().toISOString() },
  { id: 'news-5', title: 'TechCrunch', description: 'Trang báo điện tử hàng đầu đưa tin về các công ty công nghệ và startup.', url: 'https://techcrunch.com', category: 'Đọc sách & Tin tức', createdAt: new Date().toISOString() },
];

export const initStorage = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
  }
};
