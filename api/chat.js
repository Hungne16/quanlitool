import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
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
    
    const prompt = `Bạn là trợ lý AI quản lý công cụ. Dưới đây là danh sách các công cụ hiện có trong kho của người dùng:\n\n${toolsContext || 'Kho công cụ hiện trống.'}\n\nNgười dùng đang hỏi: "${message}".\n\nHãy gợi ý các công cụ phù hợp NHẤT từ danh sách trên để giúp họ giải quyết công việc. Khuyến khích giải thích ngắn gọn tại sao công cụ đó lại phù hợp. Nếu trong danh sách không có công cụ nào đáp ứng được, hãy cứ gợi ý một công cụ nổi tiếng bên ngoài nhưng nói rõ là nó chưa có trong kho. Hãy trả lời bằng tiếng Việt, định dạng markdown gọn gàng dễ đọc.`;

    const interaction = await client.interactions.create({
        model: "gemini-3.6-flash",
        input: prompt
    });

    res.status(200).json({ reply: interaction.output_text });
  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({ error: error.message || 'Lỗi máy chủ khi gọi AI' });
  }
}
