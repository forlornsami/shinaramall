import express, { type Express, type Request, type Response } from "express";
import fs from "fs";
import path from "path";
import { storage } from "./storage";

// ─── Bot detection ────────────────────────────────────────────────────────────
const BOT_UA =
  /googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|sogou|exabot|facebot|facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot|applebot|semrush|ahrefsbot|rogerbot|dotbot|serpstatbot|mj12bot|pinterestbot/i;

function isBot(req: Request): boolean {
  return BOT_UA.test(req.headers["user-agent"] || "");
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function esc(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function fmtPrice(p: any): string {
  const n = parseFloat(p);
  return isNaN(n) ? "" : `Rs. ${n.toLocaleString("en-PK")}`;
}

function stripHtml(s: string): string {
  return (s || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

// ─── Full pre-rendered HTML page for bots ────────────────────────────────────
async function renderBotPage(req: Request): Promise<string> {
  const proto = (req.headers["x-forwarded-proto"] as string)?.split(",")[0]?.trim() || req.protocol;
  const baseUrl = `${proto}://${req.get("host")}`;
  const view   = (req.query.view   as string | undefined) || "";
  const search = (req.query.search as string | undefined) || "";

  const SITE = "Shinara Mall";
  const DEFAULT_DESC = "Shop the best products at Shinara Mall — Pakistan's trusted online store. Pay with EasyPaisa, JazzCash, HBL bank transfer, or cash on delivery. Fast delivery across Pakistan.";
  const DEFAULT_KW   = "online shopping Pakistan, ecommerce Pakistan, EasyPaisa, JazzCash, HBL, cash on delivery, buy online Pakistan, Shinara Mall";
  const LOGO_URL     = `${baseUrl}/apple-touch-icon.png`;

  // ── Fetch data ──────────────────────────────────────────────────────────────
  let title       = `${SITE} - Online Shopping Pakistan`;
  let description = DEFAULT_DESC;
  let keywords    = DEFAULT_KW;
  let canonical   = `${baseUrl}/`;
  let pageType    = "website";
  let ogImage     = LOGO_URL;
  let structuredData: object | null = null;
  let bodyHtml    = "";

  try {
    // ── Product page ──────────────────────────────────────────────────────────
    const productMatch = view.match(/^product-(.+)$/);
    if (productMatch) {
      const product = await storage.getProduct(productMatch[1]);
      if (product) {
        const price   = (product as any).salePrice || product.price;
        const img     = (product as any).imageUrls?.[0] || (product as any).imageUrl || "";
        const rawDesc = stripHtml((product as any).description || "");
        const catId   = (product as any).categoryId;

        title       = `${esc(product.name)} - Buy Online | ${SITE}`;
        description = rawDesc
          ? rawDesc.slice(0, 160)
          : `Buy ${product.name} at ${SITE} for ${fmtPrice(price)}. Secure payment & fast delivery across Pakistan.`;
        keywords    = `${product.name}, buy ${product.name} online Pakistan, ${SITE}`;
        canonical   = `${baseUrl}/?view=product-${product.id}`;
        pageType    = "product";
        ogImage     = img || LOGO_URL;

        structuredData = {
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: rawDesc.slice(0, 500),
          image: img,
          sku: (product as any).sku || product.id,
          offers: {
            "@type": "Offer",
            price: String(price),
            priceCurrency: "PKR",
            availability: `https://schema.org/${(product as any).stock > 0 ? "InStock" : "OutOfStock"}`,
            url: canonical,
            seller: { "@type": "Organization", name: SITE },
          },
        };

        // Breadcrumb + product detail content
        bodyHtml = `
<nav aria-label="breadcrumb" style="font-size:13px;color:#64748b;margin-bottom:16px;">
  <a href="${baseUrl}/" style="color:#2563eb;">Home</a> &rsaquo;
  ${catId ? `<a href="${baseUrl}/?view=category-${esc(catId)}" style="color:#2563eb;">Category</a> &rsaquo;` : ""}
  <span>${esc(product.name)}</span>
</nav>
<div style="display:flex;gap:32px;flex-wrap:wrap;">
  ${img ? `<img src="${esc(img)}" alt="${esc(product.name)}" style="width:320px;max-width:100%;border-radius:8px;object-fit:cover;" />` : ""}
  <div style="flex:1;min-width:240px;">
    <h1 style="font-size:26px;font-weight:700;color:#0f172a;margin:0 0 8px;">${esc(product.name)}</h1>
    <p style="font-size:22px;font-weight:700;color:#2563eb;margin:0 0 12px;">${fmtPrice(price)}</p>
    ${(product as any).salePrice && (product as any).price !== (product as any).salePrice
      ? `<p style="font-size:14px;color:#94a3b8;text-decoration:line-through;margin:0 0 8px;">${fmtPrice((product as any).price)}</p>` : ""}
    ${rawDesc ? `<p style="color:#334155;line-height:1.7;margin:12px 0;">${esc(rawDesc.slice(0, 600))}</p>` : ""}
    <p style="color:#475569;font-size:14px;">✓ Pay with EasyPaisa, JazzCash, HBL or Cash on Delivery</p>
    <p style="color:#475569;font-size:14px;">✓ Fast delivery across Pakistan</p>
    <a href="${canonical}" style="display:inline-block;margin-top:16px;padding:12px 28px;background:#2563eb;color:#fff;border-radius:6px;text-decoration:none;font-weight:600;">
      Shop Now
    </a>
  </div>
</div>`;
      }
    }

    // ── Category page ─────────────────────────────────────────────────────────
    const catMatch = view.match(/^category-(.+)$/);
    if (!productMatch && catMatch) {
      const [category, allProducts] = await Promise.all([
        storage.getCategory(catMatch[1]),
        storage.getProducts({ categoryId: catMatch[1] } as any).catch(() => [] as any[]),
      ]);
      if (category) {
        title       = `${esc(category.name)} - Shop Online | ${SITE}`;
        description = `Shop ${category.name} products at ${SITE}. Best prices with EasyPaisa, JazzCash and cash on delivery across Pakistan.`;
        keywords    = `${category.name} online Pakistan, buy ${category.name}, ${SITE}`;
        canonical   = `${baseUrl}/?view=category-${category.id}`;
        ogImage     = (category as any).imageUrl || LOGO_URL;

        const prods: any[] = Array.isArray(allProducts) ? allProducts.slice(0, 30) : [];
        bodyHtml = `
<h1 style="font-size:28px;font-weight:700;color:#0f172a;margin:0 0 8px;">${esc(category.name)}</h1>
<p style="color:#475569;margin:0 0 24px;">${prods.length} products available</p>
<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:16px;">
  ${prods.map(p => {
    const img   = p.imageUrls?.[0] || p.imageUrl || "";
    const price = p.salePrice || p.price;
    return `
  <div style="border:1px solid #e2e8f0;border-radius:8px;padding:12px;background:#fff;">
    ${img ? `<img src="${esc(img)}" alt="${esc(p.name)}" style="width:100%;height:140px;object-fit:cover;border-radius:4px;margin-bottom:8px;" />` : ""}
    <h3 style="font-size:13px;font-weight:600;color:#1e293b;margin:0 0 4px;">${esc(p.name)}</h3>
    <p style="font-size:14px;font-weight:700;color:#2563eb;margin:0 0 8px;">${fmtPrice(price)}</p>
    <a href="${baseUrl}/?view=product-${p.id}" style="font-size:12px;color:#2563eb;">View Product</a>
  </div>`;
  }).join("")}
</div>`;
      }
    }

    // ── Homepage / listing pages ───────────────────────────────────────────────
    if (!productMatch && !catMatch) {
      const [featured, categories, storeSettings] = await Promise.all([
        storage.getProducts({ featured: true } as any).catch(() => [] as any[]),
        storage.getCategories().catch(() => [] as any[]),
        storage.getStoreSettings().catch(() => null as any),
      ]);

      const storeName = storeSettings?.storeName || SITE;
      const storeDesc = storeSettings?.storeDescription || DEFAULT_DESC;
      const storeLogo = storeSettings?.storeLogo || LOGO_URL;

      if (view === "products" || view === "featured") {
        title       = view === "featured"
          ? `Featured Products - ${storeName}`
          : `All Products - ${storeName} | Online Shopping Pakistan`;
        description = view === "featured"
          ? `Discover hand-picked featured products at ${storeName}. Shop with EasyPaisa, JazzCash, and cash on delivery.`
          : `Browse all products at ${storeName}. Best prices with secure Pakistani payment methods and fast delivery.`;
        canonical   = `${baseUrl}/?view=${view}`;
      } else if (view === "categories") {
        title       = `Shop by Category - ${storeName}`;
        description = `Browse all product categories at ${storeName}. Find what you need with EasyPaisa, JazzCash, and cash on delivery.`;
        canonical   = `${baseUrl}/?view=categories`;
      } else if (search) {
        title       = `Search: "${search}" - ${storeName}`;
        description = `Search results for "${search}" at ${storeName}. Find quality products with secure Pakistani payment methods.`;
        canonical   = `${baseUrl}/?search=${encodeURIComponent(search)}`;
      } else {
        title       = `${storeName} - Online Shopping Pakistan`;
        description = storeDesc;
        canonical   = `${baseUrl}/`;
        ogImage     = storeLogo || LOGO_URL;
      }

      const featuredList: any[] = Array.isArray(featured) ? featured.slice(0, 12) : [];
      const catList: any[]      = Array.isArray(categories) ? categories.slice(0, 12) : [];

      structuredData = {
        "@context": "https://schema.org",
        "@type": "OnlineStore",
        name: storeName,
        url: baseUrl,
        logo: storeLogo || LOGO_URL,
        description: storeDesc,
        address: { "@type": "PostalAddress", addressCountry: "PK" },
        paymentAccepted: "EasyPaisa, JazzCash, HBL Bank Transfer, Cash on Delivery",
        currenciesAccepted: "PKR",
        areaServed: "PK",
        potentialAction: {
          "@type": "SearchAction",
          target: { "@type": "EntryPoint", urlTemplate: `${baseUrl}/?search={search_term_string}` },
          "query-input": "required name=search_term_string",
        },
      };

      bodyHtml = `
<header style="margin-bottom:32px;">
  ${storeLogo ? `<img src="${esc(storeLogo)}" alt="${esc(storeName)}" style="height:48px;margin-bottom:12px;" />` : ""}
  <h1 style="font-size:32px;font-weight:800;color:#0f172a;margin:0 0 8px;">${esc(storeName)}</h1>
  <p style="font-size:16px;color:#475569;max-width:640px;line-height:1.7;">${esc(storeDesc)}</p>
  <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:16px;">
    <span style="background:#eff6ff;color:#2563eb;padding:4px 12px;border-radius:20px;font-size:13px;">✓ EasyPaisa</span>
    <span style="background:#eff6ff;color:#2563eb;padding:4px 12px;border-radius:20px;font-size:13px;">✓ JazzCash</span>
    <span style="background:#eff6ff;color:#2563eb;padding:4px 12px;border-radius:20px;font-size:13px;">✓ HBL Bank Transfer</span>
    <span style="background:#eff6ff;color:#2563eb;padding:4px 12px;border-radius:20px;font-size:13px;">✓ Cash on Delivery</span>
  </div>
</header>

${catList.length > 0 ? `
<section style="margin-bottom:40px;">
  <h2 style="font-size:22px;font-weight:700;color:#1e293b;margin:0 0 16px;">Shop by Category</h2>
  <div style="display:flex;flex-wrap:wrap;gap:10px;">
    ${catList.map(c => `
    <a href="${baseUrl}/?view=category-${c.id}"
       style="padding:8px 18px;border:1px solid #cbd5e1;border-radius:6px;color:#1e293b;text-decoration:none;font-size:14px;font-weight:500;background:#f8fafc;">
      ${esc(c.name)}
    </a>`).join("")}
  </div>
</section>` : ""}

${featuredList.length > 0 ? `
<section>
  <h2 style="font-size:22px;font-weight:700;color:#1e293b;margin:0 0 16px;">Featured Products</h2>
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:16px;">
    ${featuredList.map(p => {
      const img   = p.imageUrls?.[0] || p.imageUrl || "";
      const price = p.salePrice || p.price;
      const desc  = stripHtml(p.description || "");
      return `
    <div style="border:1px solid #e2e8f0;border-radius:8px;padding:12px;background:#fff;">
      ${img ? `<img src="${esc(img)}" alt="${esc(p.name)}" style="width:100%;height:140px;object-fit:cover;border-radius:4px;margin-bottom:8px;" />` : ""}
      <h3 style="font-size:13px;font-weight:600;color:#1e293b;margin:0 0 4px;">${esc(p.name)}</h3>
      ${desc ? `<p style="font-size:11px;color:#64748b;margin:0 0 6px;">${esc(desc.slice(0, 80))}</p>` : ""}
      <p style="font-size:14px;font-weight:700;color:#2563eb;margin:0 0 8px;">${fmtPrice(price)}</p>
      <a href="${baseUrl}/?view=product-${p.id}"
         style="font-size:12px;color:#fff;background:#2563eb;padding:5px 12px;border-radius:4px;text-decoration:none;">
        View Product
      </a>
    </div>`;
    }).join("")}
  </div>
</section>` : ""}

<footer style="margin-top:48px;padding-top:24px;border-top:1px solid #e2e8f0;color:#94a3b8;font-size:13px;">
  <p>&copy; ${new Date().getFullYear()} ${esc(storeName)} &mdash; Pakistan's trusted online store.</p>
  <p style="margin-top:4px;">
    <a href="${baseUrl}/?view=products" style="color:#2563eb;margin-right:12px;">All Products</a>
    <a href="${baseUrl}/?view=categories" style="color:#2563eb;margin-right:12px;">Categories</a>
    <a href="${baseUrl}/sitemap.xml" style="color:#2563eb;">Sitemap</a>
  </p>
</footer>`;
    }
  } catch (err) {
    console.error("[SEO] Error building bot page:", err);
  }

  // ── Assemble full HTML document ─────────────────────────────────────────────
  const ldTag = structuredData
    ? `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}" />
  <meta name="keywords" content="${esc(keywords)}" />
  <meta name="robots" content="index, follow" />
  <meta name="google-site-verification" content="39pGgkiyVNLH0RMod-wssjAujyXZdKfDDfRtYeBq8l4" />
  <link rel="canonical" href="${esc(canonical)}" />
  <meta property="og:type" content="${pageType}" />
  <meta property="og:url" content="${esc(canonical)}" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:image" content="${esc(ogImage)}" />
  <meta property="og:site_name" content="${esc(SITE)}" />
  <meta property="og:locale" content="en_PK" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(title)}" />
  <meta name="twitter:description" content="${esc(description)}" />
  <meta name="twitter:image" content="${esc(ogImage)}" />
  ${ldTag}
  <style>
    *{box-sizing:border-box;}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;
         margin:0;padding:24px;background:#f8fafc;color:#1e293b;line-height:1.6;}
    .container{max-width:1100px;margin:0 auto;background:#fff;padding:32px;border-radius:12px;
               box-shadow:0 1px 3px rgba(0,0,0,.08);}
    a{color:#2563eb;}
    img{max-width:100%;}
    h1,h2,h3{line-height:1.3;}
  </style>
</head>
<body>
  <div class="container">
    ${bodyHtml}
  </div>
</body>
</html>`;
}

// ─── Express static server ────────────────────────────────────────────────────
export function serveStatic(app: Express) {
  const distPath = path.resolve(import.meta.dirname, "public");

  if (!fs.existsSync(distPath)) {
    console.warn(`[static] dist/public not found — skipping static file serving`);
    app.use("*", (_req, res) => res.status(404).json({ message: "Not found" }));
    return;
  }

  app.use(express.static(distPath));

  // Fallback for all non-file routes
  app.use("*", async (req: Request, res: Response) => {
    try {
      if (isBot(req)) {
        // Bots get a fully pre-rendered HTML page with real content
        const html = await renderBotPage(req);
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.setHeader("Cache-Control", "public, max-age=300"); // 5-min cache for bots
        return res.send(html);
      }

      // Regular users get the React SPA
      const indexPath = path.resolve(distPath, "index.html");
      const html = fs.readFileSync(indexPath, "utf-8");
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.send(html);
    } catch (err) {
      console.error("[static] Error serving page:", err);
      res.status(500).send("Server error");
    }
  });
}
