// 最小範例：node example.js
const seo = require('./index');

// 1) 文章（部落格 / 教學文）
const article = seo.generateArticleSchema({
  title: '如何用零依賴產生 schema.org 結構化資料',
  description: '一步步教你在 <head> 注入 JSON-LD，讓 Google 讀懂你的頁面。',
  content: '<p>結構化資料是 SEO 的關鍵……</p>',
  url: 'https://example.com/blog/json-ld',
  authorName: 'Jeffrey',
  publishedTime: '2026-07-01T08:00:00Z',
  tags: ['SEO', 'JSON-LD', 'schema.org'],
  readingTime: 5,
});
console.log('=== Article ===');
console.log(JSON.stringify(seo.cleanSchema(article), null, 2));

// 2) FAQ
const faq = seo.generateFAQSchema([
  { question: '需要安裝套件嗎？', answer: '不用，零依賴，複製 index.js 就能跑。' },
  { question: '支援 SSR 嗎？', answer: '支援，jsonLdScript() 直接回傳可注入的 <script> 字串。' },
]);
console.log('\n=== FAQ ===');
console.log(JSON.stringify(seo.cleanSchema(faq), null, 2));

// 3) 麵包屑 + 直接產出可注入 <head> 的 <script> 標籤
const breadcrumb = seo.generateBreadcrumbSchema([
  { name: '首頁', url: 'https://example.com' },
  { name: '部落格', url: 'https://example.com/blog' },
  { name: 'JSON-LD', url: 'https://example.com/blog/json-ld' },
]);
console.log('\n=== Breadcrumb <script> ===');
console.log(seo.jsonLdScript(breadcrumb));
