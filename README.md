<p align="center">
  <img src="logo.svg" width="96" height="96" alt="seo-schema-kit logo">
</p>

# seo-schema-kit 🔎

**零依賴的 schema.org / JSON-LD 結構化資料產生器。** 純函式，吃一個 props 物件、回一個乾淨的 JSON-LD，塞進 `<head>` 就能讓 Google 讀懂你的頁面、爭取複合式搜尋結果（Rich Results）。

> 沒有相依套件、沒有框架綁定，前後端／SSR 都能用。支援 Article / HowTo / Organization / LocalBusiness / ProfessionalService / Breadcrumb / FAQ / WebSite / Course。

## 安裝

```bash
npm i github:Jeffrey0117/seo-schema-kit     # 或直接複製 index.js（零依賴）
```

## 用法

```js
const seo = require('seo-schema-kit');

// 1) 產生 JSON-LD 物件
const article = seo.generateArticleSchema({
  title: '文章標題',
  description: '摘要',
  content: '<p>內文 HTML……</p>',
  url: 'https://example.com/blog/foo',
  authorName: 'Jeffrey',
  publishedTime: '2026-07-01T08:00:00Z',
  tags: ['SEO', 'JSON-LD'],
  readingTime: 5,
});

// 2) 轉成可注入的 <script> 標籤（會自動 clean 掉 undefined、escape "<"）
const tag = seo.jsonLdScript(article);

// 3) SSR：把 tag 直接插進 <head>
const html = `<!doctype html><html><head>
  <title>文章標題</title>
  ${tag}
</head><body>…</body></html>`;
```

一頁多個 schema 也可以一次丟陣列給 `jsonLdScript`：

```js
const tags = [
  seo.jsonLdScript(seo.generateWebSiteSchema({ name: '站名', url: 'https://example.com' })),
  seo.jsonLdScript(seo.generateBreadcrumbSchema(items)),
  seo.jsonLdScript(seo.generateFAQSchema(faqs)),
].join('\n');
```

## API

所有 `generate*` 皆為純函式，回傳 plain JS object（含可能的 `undefined` 欄位，交給 `cleanSchema` / `jsonLdScript` 清理）。

| 函式 | 說明 |
|---|---|
| `generateArticleSchema(props)` | 文章／部落格。`title, description, content, url, authorName, publishedTime` 為主，選填 `imageUrl, tags, readingTime, wordCount, category, modifiedTime`。 |
| `generateHowToSchema(props)` | 教學文（HowTo），含 `steps[]`、`totalTime`、`estimatedCost`。 |
| `generateOrganizationSchema(props)` | 組織／品牌，含 `logoUrl, sameAs, contactPoint, address`。 |
| `generateLocalBusinessSchema(props)` | 服務業（繼承 Organization），多 `priceRange, openingHours, geo`。 |
| `generateProfessionalServiceSchema(props)` | 專業服務（繼承 LocalBusiness），`@type` 為 ProfessionalService。 |
| `generateBreadcrumbSchema(items)` | 麵包屑，`items` 為 `{ name, url }[]`。 |
| `generateFAQSchema(faqs)` | FAQ 頁，`faqs` 為 `{ question, answer }[]`。 |
| `generateWebSiteSchema(props)` | 首頁 WebSite，帶 `searchUrl` 時自動加站內搜尋 SearchAction。 |
| `generateCourseSchema(props)` | 課程，含 `provider, instructor, price, duration`。 |
| `cleanSchema(obj)` | 遞迴移除 `undefined`／`null`／空陣列／空物件。 |
| `schemaToJsonLd(objOrArray)` | 清理後轉成 JSON 字串。 |
| `jsonLdScript(objOrArray)` | 回傳 `<script type="application/ld+json">…</script>` 字串（已 clean + escape，SSR 友善）。 |

## 設計重點

- **零依賴**：只用純 JS，複製 `index.js` 就能跑，不綁 React／框架。
- **純函式**：同輸入同輸出、無副作用，好測試、好快取。
- **SSR 友善**：`jsonLdScript` 直接回傳可注入 `<head>` 的字串，並 escape `<` 擋 `</script>` 提前截斷／XSS。
- **自動清理**：選填欄位沒給就自動移除，輸出乾淨、通過 Rich Results 驗證。

## 範例

```bash
npm run example     # = node example.js，印出 Article / FAQ / Breadcrumb 的 JSON-LD
```

## License

MIT © Jeffrey0117
