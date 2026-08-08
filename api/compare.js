import { executeWithKeyRotation } from './utils/gemini.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { tool1, tool2 } = req.body;
    
    if (!tool1 || !tool2) {
      return res.status(400).json({ error: 'Missing tools for comparison' });
    }

    const prompt = `Bạn là một chuyên gia đánh giá phần mềm. Hãy so sánh 2 công cụ sau đây một cách khách quan nhất:

Công cụ A: ${tool1.title || tool1.name} (Danh mục: ${tool1.category})
Mô tả: ${tool1.description || ''}
Tính năng: ${tool1.features ? tool1.features.join(', ') : ''}

Công cụ B: ${tool2.title || tool2.name} (Danh mục: ${tool2.category})
Mô tả: ${tool2.description || ''}
Tính năng: ${tool2.features ? tool2.features.join(', ') : ''}

Dựa trên chức năng, độ phổ biến, tính ứng dụng và đánh giá chung, hãy chỉ định xem công cụ nào ưu việt hơn, hoặc nếu ngang tài ngang sức thì trả về "draw".
BẮT BUỘC trả về ĐÚNG VÀ CHỈ định dạng JSON sau (không kèm markdown \`\`\`json):
{
  "winnerId": "${tool1.id}", // Hoặc "${tool2.id}", hoặc "draw" nếu thực sự hoà
  "prosA": ["Ưu điểm 1 của A", "Ưu điểm 2 của A"],
  "consA": ["Nhược điểm 1 của A"],
  "prosB": ["Ưu điểm 1 của B", "Ưu điểm 2 của B"],
  "consB": ["Nhược điểm 1 của B"],
  "verdict": "Lời bình luận cuối cùng giải thích tại sao công cụ chiến thắng lại tốt hơn (khoảng 2-3 câu)."
}`;

    const aiText = await executeWithKeyRotation(prompt, null, "gemini-3.5-flash");
    
    let resultJson;
    try {
      resultJson = JSON.parse(aiText.trim());
    } catch (e) {
      // Cleanup common markdown artifacts if JSON.parse fails
      const cleanedText = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
      resultJson = JSON.parse(cleanedText);
    }

    res.status(200).json(resultJson);
  } catch (error) {
    console.error('Comparison API Error:', error);
    res.status(500).json({ error: error.message || 'Lỗi máy chủ khi gọi AI' });
  }
}
