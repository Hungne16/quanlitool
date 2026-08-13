import { executeWithKeyRotation } from './utils/gemini.js';
import { Crawl4AI } from 'crawl4ai';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url, apiKey: clientApiKey, categories, tags } = req.body;
  if (!url || !url.startsWith('http')) {
    return res.status(400).json({ error: 'Invalid URL provided' });
  }

  // GEMINI_API_KEY checking is now handled inside executeWithKeyRotation

  try {
    console.log(`[analyze] Starting analysis for: ${url}`);
    
    // Initialize Crawl4AI client
    const crawlerUrl = process.env.CRAWL4AI_API_URL || 'http://localhost:11235';
    const crawlerToken = process.env.CRAWL4AI_API_TOKEN || '';
    const crawler = new Crawl4AI({ baseUrl: crawlerUrl, apiToken: crawlerToken });
    
    let mainMarkdown = '';
    let mainHtml = '';

    const fetchHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5'
    };

    try {
      console.log(`[analyze] Crawling main URL with Crawl4AI...`);
      const mainCrawl = await crawler.crawl({
        urls: [url],
        browser_config: { headless: true },
      });
      
      if (!mainCrawl || mainCrawl.length === 0 || !mainCrawl[0].success) {
        throw new Error('Crawl4AI returned unsuccessful response.');
      }
      
      const mainData = mainCrawl[0];
      mainMarkdown = mainData.markdown || '';
      mainHtml = mainData.html || '';
    } catch (crawlerError) {
      console.warn(`[analyze] Crawl4AI failed (${crawlerError.message}). Falling back to native fetch...`);
      const fallbackResponse = await fetch(url, { headers: fetchHeaders });
      if (!fallbackResponse.ok) {
        throw new Error(`SCRAPE_ERROR: Trình trích xuất không thể truy cập trang web này (Lỗi ${fallbackResponse.status}). Website có thể chặn bot.`);
      }
      mainHtml = await fallbackResponse.text();
      const $fallback = cheerio.load(mainHtml);
      $fallback('script, style, noscript, iframe, svg, img, video').remove();
      mainMarkdown = $fallback('body').text().replace(/\s+/g, ' ').trim();
    }

    // Parse HTML to find sub-pages (Pricing, Features, Docs, API, About)
    const $ = cheerio.load(mainHtml || '<html/>');
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
        console.warn(`[analyze] Crawl4AI failed for sub-pages. Falling back to native fetch...`);
        // Fallback for sub-pages
        await Promise.all(subUrlsArray.map(async (subUrl) => {
          try {
            const subRes = await fetch(subUrl, { headers: fetchHeaders });
            if (subRes.ok) {
              const subHtml = await subRes.text();
              const $sub = cheerio.load(subHtml);
              $sub('script, style, noscript, iframe, svg, img, video').remove();
              const subText = $sub('body').text().replace(/\s+/g, ' ').trim();
              combinedContent += `Trang con (${subUrl}):\n${subText.substring(0, 8000)}\n\n`;
            }
          } catch (fetchErr) {
            console.warn(`Failed to fetch subpage ${subUrl}:`, fetchErr.message);
          }
        }));
      }
    }

    console.log(`[analyze] Analyzing with Gemini...`);
    
    const sanitizedContent = combinedContent.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');

    const categoryConstraint = categories && categories.length > 0 
      ? `CHỈ CHỌN 1 TRONG CÁC DANH MỤC SAU: ${categories.join(', ')}. Nếu không phù hợp với cái nào, hãy chọn danh mục gần nhất.`
      : `Danh mục (ví dụ: AI, Development, Design, Productivity, v.v...)`;

    const tagsConstraint = tags && tags.length > 0
      ? `["CHỈ CHỌN TỐI ĐA 3-5 TAG TỪ DANH SÁCH SAU: ${tags.join(', ')}", "NẾU KHÔNG CÓ THÌ ĐỂ RỖNG"]`
      : `["tag1", "tag2"]`;

    const prompt = `Dưới đây là nội dung được trích xuất từ một website phần mềm/công cụ.
Nhiệm vụ của bạn là phân tích và trả về thông tin dưới dạng JSON theo đúng schema yêu cầu. 
Nếu không tìm thấy thông tin cho một trường nào đó, hãy để chuỗi rỗng "" hoặc mảng rỗng []. Không tự bịa thông tin.

Nội dung website:
${sanitizedContent.substring(0, 40000)}

Trả về ĐÚNG VÀ CHỈ JSON theo cấu trúc sau, không kèm markdown, không có thẻ code block \`\`\`json:
{
  "title": "Tên công cụ/phần mềm",
  "shortDescription": "Mô tả ngắn gọn (khoảng 1-2 câu)",
  "fullDescription": "Mô tả chi tiết hơn",
  "category": "${categoryConstraint}",
  "tags": ${tagsConstraint},
  "pricing": "CHỈ CHỌN 1 TRONG CÁC GIÁ TRỊ: Miễn phí, Mã nguồn mở, Freemium, Trả phí",
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

    const aiText = await executeWithKeyRotation(prompt, clientApiKey, "gemini-3.5-flash");
    
    let resultJson = {};
    try {
      resultJson = JSON.parse(aiText);
    } catch (e) {
      console.error("[analyze] JSON parse error, cleaning string...", e);
      // Fallback clean up if it accidentally includes markdown code blocks
      const cleanJson = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
      resultJson = JSON.parse(cleanJson);
    }

    // Force category to "Repo" if it's a GitHub URL
    if (url.toLowerCase().includes('github.com')) {
      resultJson.category = 'Repo';
    }

    // Extract logo from HTML headers since images are stripped from the AI prompt
    let extractedLogoUrl = '';
    if (mainHtml) {
      const $head = cheerio.load(mainHtml);
      extractedLogoUrl = $head('meta[property="og:image"]').attr('content') ||
                $head('link[rel="apple-touch-icon"]').attr('href') ||
                $head('link[rel="icon"]').attr('href') ||
                $head('link[rel="shortcut icon"]').attr('href') ||
                '';
      
      if (extractedLogoUrl && !extractedLogoUrl.startsWith('http') && !extractedLogoUrl.startsWith('data:')) {
        try {
          extractedLogoUrl = new URL(extractedLogoUrl, url).href;
        } catch (e) {
          extractedLogoUrl = '';
        }
      }
    }

    if (!resultJson.logo || resultJson.logo === '') {
      resultJson.logo = extractedLogoUrl;
    }

    console.log(`[analyze] Analysis complete for ${url}`);
    return res.status(200).json(resultJson);

  } catch (error) {
    console.error('[analyze] Error:', error);
    
    let errorMessage = error.message || 'Internal Server Error';
    
    if (errorMessage.includes('SCRAPE_ERROR:')) {
      return res.status(400).json({ error: errorMessage.replace('SCRAPE_ERROR: ', '') });
    }
    
    if (errorMessage.includes('429') || errorMessage.includes('Quota exceeded') || errorMessage.includes('rate-limit')) {
      errorMessage = 'Lỗi API AI: Vượt quá giới hạn gọi AI của Google (Quota Exceeded). Vui lòng đợi 15 giây hoặc nhập API Key của riêng bạn!';
    }
    
    return res.status(500).json({ error: errorMessage });
  }
}
