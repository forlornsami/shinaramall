import express, { type Express, type Request, type Response } from "express";
import fs from "fs";
import path from "path";
import { storage } from "./storage";

// Bot / crawler user-agent patterns
const BOT_UA = /googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|sogou|exabot|facebot|facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot|applebot|semrush|ahrefsbot|rogerbot|dotbot|serpstatbot|mj12bot|pinterestbot/i;

function isBot(req: Request): boolean {
  return BOT_UA.test(req.headers["user-agent"] || "");
}

function escHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Given the raw index.html string, replace/inject meta tags for SEO.
 */
function injectMeta(html: string, meta: {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url: string;
  type?: string;
  structuredData?: object;
  noscriptBody?: string;
}): string {
  const t = escHtml(meta.title);
  const d = escHtml(meta.description);
  const img = meta.image || "https://shinaramall.com/apple-touch-icon.png";
  const u = escHtml(meta.url);
  const type = meta.type || "website";
  const kw = meta.keywords ? `<meta name="keywords" content="${escHtml(meta.keywords)}" />` : "";
  const ld = meta.structuredData
    ? `<script type="application/ld+json">${JSON.stringify(meta.structuredData)}</script>`
    : "";

  const tags = `
    <title>${t}</title>
    <meta name="description" content="${d}" />
    ${kw}
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="${u}" />
    <meta property="og:type" content="${type}" />
    <meta property="og:url" content="${u}" />
    <meta property="og:title" content="${t}" />
    <meta property="og:description" content="${d}" />
    <meta property="og:image" content="${img}" />
    <meta property="og:image:width" content="800" />
    <meta property="og:image:height" content="800" />
    <meta property="og:site_name" content="Shinara Mall" />
    <meta property="og:locale" content="en_PK" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${t}" />
    <meta name="twitter:description" content="${d}" />
    <meta name="twitter:image" content="${img}" />
    ${ld}`;

  // Remove existing title, description, og, twitter, ld+json, robots, canonical blocks
  let result = html
    .replace(/<title>[^<]*<\/title>/gi, "")
    .replace(/<meta name="description"[^>]*>/gi, "")
    .replace(/<meta name="keywords"[^>]*>/gi, "")
    .replace(/<meta name="robots"[^>]*>/gi, "")
    .replace(/<link rel="canonical"[^>]*>/gi, "")
    .replace(/<meta property="og:[^>]*>/gi, "")
    .replace(/<meta name="twitter:[^>]*>/gi, "")
    .replace(/<meta property="twitter:[^>]*>/gi, "")
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/gi, "");

  // Inject before </head>
  result = result.replace("</head>", `${tags}\n  </head>`);

  // Add noscript fallback before </body> for content bots that don't execute JS
  if (meta.noscriptBody) {
    const ns = `<noscript><div style="display:none">${meta.noscriptBody}</div></noscript>`;
    result = result.replace("</body>", `${ns}\n</body>`);
  }

  return result;
}

async function buildMeta(req: Request): Promise<Parameters<typeof injectMeta>[1]> {
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const fullUrl = `${baseUrl}${req.originalUrl}`;
  const view = (req.query.view as string | undefined) || "";
  const search = (req.query.search as string | undefined) || "";

  const defaultMeta = {
    title: "Shinara Mall - Online Shopping Pakistan",
    description:
      "Shop the best products at Shinara Mall. Wide selection of quality items with secure Pakistani payment methods including EasyPaisa, JazzCash, and cash on delivery.",
    keywords: "online shopping Pakistan, ecommerce Pakistan, EasyPaisa, JazzCash, HBL, cash on delivery, buy online Pakistan, Shinara Mall",
    url: baseUrl + "/",
    type: "website",
  };

  try {
    // Product detail: ?view=product-{id}
    const productMatch = view.match(/^product-(.+)$/);
    if (productMatch) {
      const product = await storage.getProduct(productMatch[1]);
      if (product) {
        const price = (product as any).salePrice || product.price;
        const image = (product as any).imageUrls?.[0] || (product as any).imageUrl || "";
        const descRaw = (product as any).description?.replace(/<[^>]+>/g, "").trim() || "";
        return {
          title: `${product.name} - Shinara Mall`,
          description: descRaw
            ? descRaw.slice(0, 160)
            : `Buy ${product.name} at Shinara Mall. Rs. ${price}. Fast delivery across Pakistan.`,
          keywords: `${product.name}, buy online Pakistan, ${(product as any).categoryName || ""}`,
          image: image || undefined,
          url: `${baseUrl}/?view=product-${product.id}`,
          type: "product",
          structuredData: {
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            description: descRaw.slice(0, 500),
            image: image,
            sku: (product as any).sku || product.id,
            offers: {
              "@type": "Offer",
              price: String(price),
              priceCurrency: "PKR",
              availability: `https://schema.org/${(product as any).stock > 0 ? "InStock" : "OutOfStock"}`,
              url: `${baseUrl}/?view=product-${product.id}`,
              seller: { "@type": "Organization", name: "Shinara Mall" },
            },
          },
          noscriptBody: `<h1>${product.name}</h1><p>Rs. ${price}</p>${image ? `<img src="${image}" alt="${product.name}" />` : ""}`,
        };
      }
    }

    // Category: ?view=category-{id}
    const catMatch = view.match(/^category-(.+)$/);
    if (catMatch) {
      const category = await storage.getCategory(catMatch[1]);
      if (category) {
        return {
          title: `${category.name} - Shop Online | Shinara Mall`,
          description: `Shop ${category.name} products at Shinara Mall. Best prices with EasyPaisa, JazzCash and cash on delivery across Pakistan.`,
          keywords: `${category.name} online Pakistan, buy ${category.name}, Shinara Mall`,
          image: category.image || undefined,
          url: `${baseUrl}/?view=category-${category.id}`,
          type: "website",
          noscriptBody: `<h1>${category.name}</h1>`,
        };
      }
    }

    // Search results
    if (search) {
      return {
        ...defaultMeta,
        title: `Search: "${search}" - Shinara Mall`,
        description: `Search results for "${search}" at Shinara Mall. Find quality products with secure Pakistani payment methods.`,
        url: fullUrl,
      };
    }

    // Featured / products listing pages
    if (view === "featured") {
      return {
        ...defaultMeta,
        title: "Featured Products - Shinara Mall",
        description: "Discover our hand-picked featured products at Shinara Mall. Shop online with EasyPaisa, JazzCash, and cash on delivery across Pakistan.",
        url: `${baseUrl}/?view=featured`,
      };
    }

    if (view === "products") {
      return {
        ...defaultMeta,
        title: "All Products - Shinara Mall | Online Shopping Pakistan",
        description: "Browse all products at Shinara Mall. Wide selection with secure Pakistani payment methods and fast delivery.",
        url: `${baseUrl}/?view=products`,
      };
    }

    if (view === "categories") {
      return {
        ...defaultMeta,
        title: "Shop by Category - Shinara Mall",
        description: "Browse all product categories at Shinara Mall. Find what you need with EasyPaisa, JazzCash, and cash on delivery.",
        url: `${baseUrl}/?view=categories`,
      };
    }
  } catch (err) {
    console.error("[SEO] Error building meta:", err);
  }

  // Homepage / default
  const storeJsonLd = {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    name: "Shinara Mall",
    url: baseUrl,
    logo: `${baseUrl}/apple-touch-icon.png`,
    description: defaultMeta.description,
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
  return { ...defaultMeta, structuredData: storeJsonLd };
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(import.meta.dirname, "public");

  if (!fs.existsSync(distPath)) {
    console.warn(`[static] dist/public not found at ${distPath} — skipping static file serving`);
    app.use("*", (_req, res) => {
      res.status(404).json({ message: "Not found" });
    });
    return;
  }

  app.use(express.static(distPath));

  // Fallback: serve index.html for all non-file routes.
  // For crawler bots, inject server-side meta tags into the HTML.
  app.use("*", async (req: Request, res: Response) => {
    try {
      const indexPath = path.resolve(distPath, "index.html");
      let html = fs.readFileSync(indexPath, "utf-8");

      if (isBot(req)) {
        const meta = await buildMeta(req);
        html = injectMeta(html, meta);
      }

      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.send(html);
    } catch (err) {
      res.status(500).send("Server error");
    }
  });
}
