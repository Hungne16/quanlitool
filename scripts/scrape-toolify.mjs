/**
 * scrape-toolify.js
 * Cào công cụ AI từ Toolify.ai và đẩy vào Firestore dạng "pending"
 * Chạy: node scripts/scrape-toolify.js [category] [pages]
 * Ví dụ: node scripts/scrape-toolify.js "image-generator" 3
 *
 * Yêu cầu: đặt file serviceAccountKey.json vào thư mục scripts/
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// ──────────────────────────────────────
// CONFIG
// ──────────────────────────────────────
const CATEGORY_SLUG = process.argv[2] || 'text-to-image';   // slug trên toolify.ai
const MAX_PAGES     = parseInt(process.argv[3] || '2', 10);  // số trang cào
const BASE_URL      = 'https://www.toolify.ai';
const SERVICE_KEY   = path.join(__dirname, 'serviceAccountKey.json');

// Map slug → tên danh mục trong app của bạn
const CATEGORY_MAP = {
  'text-to-image':      'AI & Machine Learning',
  'ai-writing':         'AI & Machine Learning',
  'ai-code':            'Lập trình',
  'ai-productivity':    'Năng suất',
  'ai-design':          'Thiết kế',
  'ai-education':       'Đọc sách & Tin tức',
  'image-generator':    'AI & Machine Learning',
  'chatbot':            'AI & Machine Learning',
};

const appCategory = CATEGORY_MAP[CATEGORY_SLUG] || 'AI & Machine Learning';

// ──────────────────────────────────────
// INIT FIREBASE ADMIN
// ──────────────────────────────────────
let serviceAccount;
try {
  serviceAccount = require(SERVICE_KEY);
} catch {
  console.error(`\n❌ Không tìm thấy file: ${SERVICE_KEY}`);
  console.error('   Vui lòng tải serviceAccountKey.json từ Firebase Console:');
  console.error('   Project Settings → Service Accounts → Generate new private key\n');
  process.exit(1);
}

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

// ──────────────────────────────────────
// HELPERS
// ──────────────────────────────────────
const delay = (ms) => new Promise(r => setTimeout(r, ms));

const normalizeUrl = (href) => {
  if (!href) return null;
  if (href.startsWith('http')) return href;
  return BASE_URL + href;
};

// Kiểm tra tool đã tồn tại trong Firestore chưa (theo URL)
async function toolExists(url) {
  const snap = await db.collection('tools').where('url', '==', url).limit(1).get();
  return !snap.empty;
}

// ──────────────────────────────────────
// SCRAPER: lấy danh sách tool từ 1 trang
// ──────────────────────────────────────
async function scrapePage(slug, page) {
  const url = `${BASE_URL}/category/${slug}?page=${page}`;
  console.log(`\n🔍 Đang cào: ${url}`);

  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(data);
    const tools = [];

    // Toolify.ai: mỗi tool là 1 article / div card
    $('[class*="tool-item"], [class*="ToolCard"], article, .tool-card').each((_, el) => {
      const $el = $(el);

      // Tên tool
      const name = (
        $el.find('[class*="tool-name"], [class*="ToolName"], h2, h3, .name').first().text().trim()
      );

      // Mô tả
      const description = (
        $el.find('[class*="description"], [class*="desc"], p').first().text().trim()
      );

      // Link gốc của tool (không phải link toolify)
      const toolHref = $el.find('a[href*="://"]').not('[href*="toolify.ai"]').first().attr('href')
        || $el.find('a').first().attr('href');
      const url = normalizeUrl(toolHref);

      // Thumbnail
      const img = $el.find('img').first().attr('src') || $el.find('img').first().attr('data-src') || '';

      // Tags / keywords
      const tags = [];
      $el.find('[class*="tag"], [class*="badge"]').each((_, t) => {
        const txt = $(t).text().trim();
        if (txt && txt.length < 30) tags.push(txt);
      });

      if (name && url && url.startsWith('http') && !url.includes('toolify.ai')) {
        tools.push({ name, description: description || `${name} - công cụ AI hữu ích`, url, img, tags });
      }
    });

    console.log(`   ✅ Tìm thấy ${tools.length} tool`);
    return tools;

  } catch (err) {
    console.error(`   ❌ Lỗi cào trang ${page}: ${err.message}`);
    return [];
  }
}

// ──────────────────────────────────────
// PUSH VÀO FIRESTORE
// ──────────────────────────────────────
async function pushToFirestore(tools) {
  let added = 0;
  let skipped = 0;

  for (const tool of tools) {
    if (!tool.url || !tool.name) { skipped++; continue; }

    // Tránh trùng lặp
    if (await toolExists(tool.url)) {
      console.log(`   ⏭  Bỏ qua (đã có): ${tool.name}`);
      skipped++;
      continue;
    }

    const doc = {
      name: tool.name,
      description: tool.description || '',
      url: tool.url,
      img: tool.img || '',
      category: appCategory,
      tags: tool.tags || [],
      status: 'pending',          // ← Admin cần duyệt
      submittedBy: 'scraper-bot',
      submittedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      source: 'toolify.ai',
      ratings: {},
      comments: [],
    };

    await db.collection('tools').add(doc);
    console.log(`   ➕ Đã thêm: ${tool.name}`);
    added++;

    await delay(300); // tránh rate limit Firestore
  }

  return { added, skipped };
}

// ──────────────────────────────────────
// MAIN
// ──────────────────────────────────────
async function main() {
  console.log(`\n${'═'.repeat(55)}`);
  console.log(`🚀 TOOLIFY SCRAPER`);
  console.log(`   Category: ${CATEGORY_SLUG} → "${appCategory}"`);
  console.log(`   Pages   : 1 → ${MAX_PAGES}`);
  console.log(`${'═'.repeat(55)}`);

  let totalAdded = 0;
  let totalSkipped = 0;
  let allTools = [];

  for (let page = 1; page <= MAX_PAGES; page++) {
    const tools = await scrapePage(CATEGORY_SLUG, page);
    allTools = [...allTools, ...tools];
    if (tools.length === 0) {
      console.log(`   ⚠️  Không còn tool ở trang ${page}, dừng lại.`);
      break;
    }
    await delay(1500); // nghỉ giữa các trang
  }

  console.log(`\n📦 Tổng cộng ${allTools.length} tool tìm được. Đang push Firestore...`);
  const { added, skipped } = await pushToFirestore(allTools);
  totalAdded += added;
  totalSkipped += skipped;

  console.log(`\n${'═'.repeat(55)}`);
  console.log(`✅ HOÀN TẤT`);
  console.log(`   Đã thêm mới : ${totalAdded} tool (trạng thái: pending)`);
  console.log(`   Bỏ qua      : ${totalSkipped} tool (đã tồn tại)`);
  console.log(`   → Vào Admin Dashboard để duyệt các tool mới!\n`);
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
