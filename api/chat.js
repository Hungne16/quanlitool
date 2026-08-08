import { GoogleGenAI } from '@google/genai';

// In-memory rate limiting map (resets on Vercel cold starts, but enough for basic spam prevention)
const rateLimitMap = new Map();
const LIMIT = 10; // Tối đa 10 câu/ngày
const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate Limiting Logic
  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  const now = Date.now();

  let userRecord = rateLimitMap.get(ip);
  if (!userRecord || now - userRecord.resetTime > WINDOW_MS) {
    userRecord = { count: 0, resetTime: now };
  }

  if (userRecord.count >= LIMIT) {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }

  // Clean up if map gets too large (prevent memory leak on long-running instances)
  if (rateLimitMap.size > 5000) {
    rateLimitMap.clear();
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(401).json({ error: 'Server API key not configured' });
  }

  try {
    const { message, toolsContext } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const client = new GoogleGenAI({ apiKey });
    
    const prompt = `Bạn là trợ lý AI quản lý công cụ. Dưới đây là danh sách các công cụ hiện có trong kho của người dùng:\n\n${toolsContext || 'Kho công cụ hiện trống.'}\n\nNgười dùng đang hỏi: "${message}".\n\nHãy gợi ý các công cụ phù hợp NHẤT từ danh sách trên để giúp họ giải quyết công việc. Nếu trong danh sách không có công cụ nào đáp ứng được, hãy gợi ý một công cụ nổi tiếng bên ngoài (để ID là rỗng).

BẮT BUỘC trả về ĐÚNG VÀ CHỈ định dạng JSON sau (không kèm markdown \`\`\`json):
{
  "message": "Câu trả lời của bạn, ĐỒNG THỜI hãy HƯỚNG DẪN NGẮN GỌN (1-2 đoạn) xem các công cụ này sẽ làm nhiệm vụ gì và giúp ích gì cho người dùng (dùng Markdown để in đậm/nghiêng nếu cần).",
  "recommendations": [
    {
      "id": "ID_CỦA_CÔNG_CỤ_TRONG_KHO_NẾU_CÓ",
      "score": 95, // Điểm đánh giá mức độ phù hợp (0-100)
      "reason": "Giải thích nhanh công cụ này làm nhiệm vụ gì (1-2 câu)"
    }
  ]
}`;

    const interaction = await client.interactions.create({
        model: "gemini-3.6-flash",
        input: prompt
    });

    // Nếu thành công thì mới tính là 1 lượt dùng
    userRecord.count += 1;
    rateLimitMap.set(ip, userRecord);

    res.status(200).json({ reply: interaction.output_text });
  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({ error: error.message || 'Lỗi máy chủ khi gọi AI' });
  }
}
