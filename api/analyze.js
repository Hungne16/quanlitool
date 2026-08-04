import { GoogleGenAI } from '@google/genai';
import { Crawl4AI } from 'crawl4ai';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url, apiKey: clientApiKey } = req.body;
  if (!url || !url.startsWith('http')) {
    return res.status(400).json({ error: 'Invalid URL provided' });
  }

  const geminiApiKey = process.env.GEMINI_API_KEY || clientApiKey;
  if (!geminiApiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on server and not provided by client' });
  }

  try {
    console.log(`[analyze] Starting analysis for: ${url}`);
    
    // Initialize Crawl4AI client
    // By default it connects to http://localhost:11235 or process.env.CRAWL4AI_API_URL
    const crawler = new Crawl4AI(); 
    
    console.log(`[analyze] Crawling main URL...`);
    const mainCrawl = await crawler.crawl({
      urls: [url],
      browser_config: { headless: true },
    });
    
    if (!mainCrawl || mainCrawl.length === 0 || !mainCrawl[0].success) {
      throw new Error('Failed to crawl the main URL using Crawl4AI.');
    }
    
    const mainData = mainCrawl[0];
    const mainMarkdown = mainData.markdown || '';
    const mainHtml = mainData.html || '';

    // Parse HTML to find sub-pages (Pricing, Features, Docs, API, About)
    const $ = cheerio.load(mainHtml);
    const subPagesToFind = ['pricing', 'features', 'docs', 'api', 'about'];
    const subUrlsToCrawl = new Set();
    
    $('a').each((i, el) => {
      const href = $(el).attr('href');
      const text = $(el).text().toLowerCase();
      
      if (href) {
        subPagesToFind.forEach(keyword => {
          if (text.includes(keyword) || href.toLowerCase().includes(keyword)) {
            // resolve relative URLs
            try {
              const absoluteUrl = new URL(href, url).href;
              // Ensure we stay on the same domain or close to it
              if (absoluteUrl.startsWith('http')) {
                subUrlsToCrawl.add(absoluteUrl);
              }
            } catch (e) {
              // ignore invalid URLs
            }
          }
        });
      }
    });

    // Limit to max 5 unique sub-urls to avoid timeout/too much data
    const subUrlsArray = Array.from(subUrlsToCrawl).slice(0, 5);
    let combinedContent = `Trang chủ (${url}):\n${mainMarkdown.substring(0, 15000)}\n\n`; // Limit main content

    if (subUrlsArray.length > 0) {
      console.log(`[analyze] Crawling ${subUrlsArray.length} sub-pages...`, subUrlsArray);
      try {
        const subCrawls = await crawler.crawl({
          urls: subUrlsArray,
          browser_config: { headless: true }
        });
        
        subCrawls.forEach((c, index) => {
          if (c.success && c.markdown) {
            combinedContent += `Trang con (${subUrlsArray[index]}):\n${c.markdown.substring(0, 8000)}\n\n`; // Limit subpage content
          }
        });
      } catch (err) {
        console.warn(`[analyze] Failed to crawl sub-pages: ${err.message}`);
      }
    }

    console.log(`[analyze] Analyzing with Gemini...`);
    
    const aiClient = new GoogleGenAI({ apiKey: geminiApiKey });
    const prompt = `Dưới đây là nội dung được trích xuất từ một website phần mềm/công cụ.
Nhiệm vụ của bạn là phân tích và trả về thông tin dưới dạng JSON theo đúng schema yêu cầu. 
Nếu không tìm thấy thông tin cho một trường nào đó, hãy để chuỗi rỗng "" hoặc mảng rỗng []. Không tự bịa thông tin.

Nội dung website:
${combinedContent.substring(0, 40000)}

Trả về ĐÚNG VÀ CHỈ JSON theo cấu trúc sau, không kèm markdown, không có thẻ code block \`\`\`json:
{
  "title": "Tên công cụ/phần mềm",
  "shortDescription": "Mô tả ngắn gọn (khoảng 1-2 câu)",
  "fullDescription": "Mô tả chi tiết hơn",
  "category": "Danh mục (ví dụ: AI, Development, Design, Productivity, v.v...)",
  "tags": ["tag1", "tag2"],
  "pricing": "Mô hình giá (Free, Freemium, Paid, Contact Sales, ...)",
  "platforms": ["Web", "Windows", "macOS", "iOS", "Android"],
  "company": "Tên công ty/Tổ chức phát triển",
  "website": "${url}",
  "logo": "URL logo nếu tìm thấy trong nội dung, nếu không để trống",
  "hasApi": true,
  "targetUsers": ["Developers", "Designers", "Students"],
  "features": ["Tính năng 1", "Tính năng 2", "Tính năng 3"],
  "languages": ["English", "Vietnamese"],
  "confidence": 90
}`;

    const interaction = await aiClient.interactions.create({
      model: "gemini-3.6-flash",
      input: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const aiText = interaction.output_text;
    
    let resultJson = {};
    try {
      resultJson = JSON.parse(aiText);
    } catch (e) {
      console.error("[analyze] JSON parse error, cleaning string...", e);
      // Fallback clean up if it accidentally includes markdown code blocks
      const cleanJson = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
      resultJson = JSON.parse(cleanJson);
    }

    console.log(`[analyze] Analysis complete for ${url}`);
    return res.status(200).json(resultJson);

  } catch (error) {
    console.error('[analyze] Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
