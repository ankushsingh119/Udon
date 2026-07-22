import { NextRequest, NextResponse } from "next/server";

function extractBetween(html: string, startTag: string, endTag: string): string[] {
  const results: string[] = [];
  let pos = 0;
  while (true) {
    const startIdx = html.indexOf(startTag, pos);
    if (startIdx === -1) break;
    const endIdx = html.indexOf(endTag, startIdx + startTag.length);
    if (endIdx === -1) break;
    results.push(html.slice(startIdx + startTag.length, endIdx));
    pos = endIdx + endTag.length;
  }
  return results;
}

function extractAttr(html: string, tag: string, attr: string): string | null {
  const regex = new RegExp(`<${tag}\\s[^>]*${attr}=["']([^"']*)["'][^>]*/?>`, "i");
  const match = html.match(regex);
  return match ? match[1] : null;
}

function extractMetaContent(html: string, name: string): string | null {
  // Match <meta name="..." content="..."> or <meta property="..." content="...">
  // Also handles content before name/property
  const namePattern = `<meta\\s[^>]*(?:name|property)=["']${name}["'][^>]*>`;
  const nameRegex = new RegExp(namePattern, "i");
  const tagMatch = html.match(nameRegex);
  if (tagMatch) {
    const tag = tagMatch[0];
    // Extract content attribute from the matched tag
    const contentMatch = tag.match(/content=["']([^"']*)["']/i);
    if (contentMatch) return contentMatch[1];
    // Also check if content comes before name/property
    const contentMatch2 = tag.match(/content=["']([^"']*)["']/i);
    if (contentMatch2) return contentMatch2[1];
  }
  return null;
}

function extractColors(html: string): { name: string; hex: string }[] {
  const colors = new Map<string, string>();

  const styleBlocks = extractBetween(html, "<style", "</style>");
  const colorRegex = /#([0-9a-fA-F]{3,8})\b/g;
  const rgbRegex = /rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)/g;
  const hslRegex = /hsl\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*\)/g;

  for (const block of styleBlocks) {
    let match;
    const text = block;

    while ((match = colorRegex.exec(text)) !== null) {
      let hex = match[1];
      if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
      if (hex.length === 6) colors.set(`#${hex.toLowerCase()}`, `#${hex.toLowerCase()}`);
    }
    colorRegex.lastIndex = 0;

    while ((match = rgbRegex.exec(text)) !== null) {
      const [, r, g, b] = match.map(Number);
      if (r <= 255 && g <= 255 && b <= 255) {
        const hex = `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
        colors.set(hex.toLowerCase(), hex.toLowerCase());
      }
    }
    rgbRegex.lastIndex = 0;

    while ((match = hslRegex.exec(text)) !== null) {
      const [, h, s, l] = match.map(Number);
      const a = s / 100;
      const b = l / 100;
      const f = (n: number) => {
        const k = (n + h / 30) % 12;
        const color = b - a * Math.min(b, 1 - b) * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color);
      };
      const hex = `#${[f(0), f(8), f(4)].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
      colors.set(hex.toLowerCase(), hex.toLowerCase());
    }
    hslRegex.lastIndex = 0;
  }

  const styleAttrRegex = /style=["'][^"']*background(?:-color)?:\s*([^;"']+)/gi;
  let match;
  while ((match = styleAttrRegex.exec(html)) !== null) {
    const val = match[1].trim();
    if (val.startsWith("#")) {
      let hex = val.slice(0, 7).toLowerCase();
      if (hex.length === 4) hex = "#" + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
      if (/^#[0-9a-f]{6}$/.test(hex)) colors.set(hex, hex);
    }
  }

  const themeMeta = extractMetaContent(html, "theme-color");
  if (themeMeta && themeMeta.startsWith("#")) {
    let hex = themeMeta.slice(0, 7).toLowerCase();
    if (hex.length === 4) hex = "#" + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    if (/^#[0-9a-f]{6}$/.test(hex)) colors.set(hex, hex);
  }

  const cssVarRegex = /--[\w-]*(?:color|bg|accent|primary|secondary|brand|theme)[^:]*:\s*([^;}{]+)/gi;
  while ((match = cssVarRegex.exec(html)) !== null) {
    const val = match[1].trim();
    if (val.startsWith("#")) {
      let hex = val.slice(0, 7).toLowerCase();
      if (hex.length === 4) hex = "#" + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
      if (/^#[0-9a-f]{6}$/.test(hex)) colors.set(hex, hex);
    }
  }

  const tailwindColorRegex = /(?:bg|text|border|from|to|via)-([a-z]+)-(?:50|100|200|300|400|500|600|700|800|900)\b/g;
  while ((match = tailwindColorRegex.exec(html)) !== null) {
    // skip tailwind classes, but note them
  }

  const filtered = Array.from(colors.values())
    .filter((hex) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      if (max - min < 15) return false;
      if (r > 240 && g > 240 && b > 240) return false;
      if (r < 15 && g < 15 && b < 15) return false;
      return true;
    })
    .slice(0, 8);

  if (filtered.length === 0) {
    return [
      { name: "Primary", hex: "#2563EB" },
      { name: "Secondary", hex: "#7C3AED" },
      { name: "Accent", hex: "#F59E0B" },
    ];
  }

  const names = ["Primary", "Secondary", "Accent", "Background", "Surface", "Muted", "Highlight", "Dark"];
  return filtered.map((hex, i) => ({
    name: names[i] || `Color ${i + 1}`,
    hex,
  }));
}

function extractFonts(html: string): { name: string; category: string }[] {
  const fonts = new Set<string>();

  const googleFontsLinkRegex = /href=["']([^"']*fonts\.googleapis\.com[^"']*)/gi;
  let match;
  while ((match = googleFontsLinkRegex.exec(html)) !== null) {
    const href = match[1];
    const familiesMatch = href.match(/family=([^&]+)/);
    if (familiesMatch) {
      familiesMatch[1].split("|").forEach((f) => {
        const name = f.split(":")[0].replace(/\+/g, " ");
        if (name) fonts.add(name);
      });
    }
  }

  const fontFamilyRegex = /font-family:\s*([^;}{]+)/gi;
  const styleBlocks = extractBetween(html, "<style", "</style>");
  for (const block of styleBlocks) {
    while ((match = fontFamilyRegex.exec(block)) !== null) {
      const families = match[1].replace(/['"]/g, "").split(",").map((f) => f.trim());
      families.forEach((f) => {
        const lower = f.toLowerCase();
        if (f && !["serif", "sans-serif", "monospace", "cursive", "fantasy", "system-ui", "-apple-system", "blinkmacsystemfont", "inherit", "initial", "unset"].includes(lower)) {
          fonts.add(f);
        }
      });
    }
    fontFamilyRegex.lastIndex = 0;
  }

  const inlineStyleFontRegex = /style=["'][^"']*font-family:\s*([^;"']+)/gi;
  while ((match = inlineStyleFontRegex.exec(html)) !== null) {
    const families = match[1].replace(/['"]/g, "").split(",").map((f) => f.trim());
    families.forEach((f) => {
      const lower = f.toLowerCase();
      if (f && !["serif", "sans-serif", "monospace", "cursive", "fantasy", "system-ui", "inherit", "initial", "unset"].includes(lower)) {
        fonts.add(f);
      }
    });
  }

  const linkTags = extractBetween(html, "<link", ">");
  for (const tag of linkTags) {
    if (tag.includes("fonts.googleapis.com") || tag.includes("fonts.gstatic.com")) {
      const hrefMatch = tag.match(/href=["']([^"']+)/);
      if (hrefMatch) {
        const famMatch = hrefMatch[1].match(/family=([^&]+)/);
        if (famMatch) {
          famMatch[1].split("|").forEach((f) => {
            const name = f.split(":")[0].replace(/\+/g, " ");
            if (name) fonts.add(name);
          });
        }
      }
    }
  }

  const sansSerif = ["Inter", "Roboto", "Open Sans", "Lato", "Montserrat", "Poppins", "Raleway", "Nunito", "Source Sans Pro", "Work Sans", "DM Sans", "Outfit", "Manrope", "Plus Jakarta Sans", "Figtree", "Urbanist", "Sora", "Lexend", "Space Grotesk", "Albert Sans", "Satoshi", "General Sans"];
  const serif = ["Playfair Display", "Merriweather", "Lora", "PT Serif", "Noto Serif", "Source Serif Pro", "Crimson Text", "Libre Baskerville", "Bitter", "Fraunces", "EB Garamond", "DM Serif Display"];
  const mono = ["Fira Code", "JetBrains Mono", "Source Code Pro", "IBM Plex Mono", "Roboto Mono", "Space Mono", "Inconsolata"];

  const result: { name: string; category: string }[] = [];
  fonts.forEach((f) => {
    const lower = f.toLowerCase();
    let category = "Sans-serif";
    if (serif.some((s) => lower.includes(s.toLowerCase()))) category = "Serif";
    else if (mono.some((m) => lower.includes(m.toLowerCase()))) category = "Monospace";
    else if (sansSerif.some((s) => lower.includes(s.toLowerCase()))) category = "Sans-serif";
    result.push({ name: f, category });
  });

  if (result.length === 0) {
    return [
      { name: "Inter", category: "Sans-serif" },
      { name: "Merriweather", category: "Serif" },
    ];
  }

  return result.slice(0, 4);
}

function extractText(html: string): string {
  let cleaned = html.replace(/<script[\s\S]*?<\/script>/gi, "");
  cleaned = cleaned.replace(/<style[\s\S]*?<\/style>/gi, "");
  cleaned = cleaned.replace(/<noscript[\s\S]*?<\/noscript>/gi, "");

  const titleMatch = cleaned.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, "").trim() : "";

  const metaDesc = extractMetaContent(cleaned, "description") || "";
  const ogDesc = extractMetaContent(cleaned, "og:description") || "";

  const h1Match = cleaned.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const h1 = h1Match ? h1Match[1].replace(/<[^>]+>/g, "").trim() : "";

  const h2Matches = cleaned.match(/<h2[^>]*>([\s\S]*?)<\/h2>/gi) || [];
  const h2s = h2Matches.slice(0, 5).map((m) => m.replace(/<[^>]+>/g, "").trim()).join(" ");

  const pMatches = cleaned.match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || [];
  const paragraphs = pMatches.slice(0, 10).map((m) => m.replace(/<[^>]+>/g, "").trim()).join(" ");

  return [title, metaDesc || ogDesc, h1, h2s, paragraphs].filter(Boolean).join("\n\n");
}

function analyzeTone(text: string): string[] {
  const tones: string[] = [];
  const lower = text.toLowerCase();

  if (/innovat|cutting.edge|next.gen|future|pioneering|disrupt/.test(lower)) tones.push("Innovative");
  if (/professional|enterprise|business|corporate|solution/.test(lower)) tones.push("Professional");
  if (/creative|design|art|inspire|imagine|dream/.test(lower)) tones.push("Creative");
  if (/trust|reliable|secure|safe|protect|depend/.test(lower)) tones.push("Trustworthy");
  if (/fast|quick|speed|instant|rapid|immediate/.test(lower)) tones.push("Fast-paced");
  if (/quality|premium|luxury|excellence|craft/.test(lower)) tones.push("Premium");
  if (/community|together|connect|share|social/.test(lower)) tones.push("Community-focused");
  if (/sustain|eco|green|nature|organic|environment/.test(lower)) tones.push("Sustainable");
  if (/simple|easy|clean|minimal|clear/.test(lower)) tones.push("Simple");
  if (/friendly|welcome|hello|join|discover/.test(lower)) tones.push("Friendly");
  if (/bold|fearless|daring|passion|energy/.test(lower)) tones.push("Bold");
  if (/elegant|refined|sophisticated|classic|timeless/.test(lower)) tones.push("Elegant");

  if (tones.length === 0) tones.push("Professional", "Clear", "Confident");
  return tones.slice(0, 6);
}

function extractSocialLinks(html: string): string[] {
  const links: string[] = [];
  const domains = ["twitter.com", "x.com", "facebook.com", "instagram.com", "linkedin.com", "youtube.com", "tiktok.com", "pinterest.com"];

  const linkRegex = /href=["'](https?:\/\/[^"']+)/gi;
  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1];
    if (domains.some((d) => href.includes(d))) {
      if (!links.includes(href)) links.push(href);
    }
  }

  return links.slice(0, 6);
}

function resolveUrl(src: string, baseUrl: string): string {
  if (src.startsWith("http")) return src;
  if (src.startsWith("//")) return "https:" + src;
  if (src.startsWith("/")) {
    try {
      const base = new URL(baseUrl);
      return `${base.origin}${src}`;
    } catch { return src; }
  }
  try {
    const base = new URL(baseUrl);
    return `${base.origin}/${src}`;
  } catch { return src; }
}

function isLogoUrl(src: string): boolean {
  const lower = src.toLowerCase();
  // Only match if "logo" or "icon" appears as a distinct segment in the URL path
  // e.g., /logo.png, /images/logo.svg, /icons/icon-192.png
  // But NOT inside hashes like /abc123logo456
  const pathPart = lower.split("?")[0].split("#")[0];
  return /(?:^|[\/_\-])logo(?:[\/_\-\.]|$)/.test(pathPart) ||
         /(?:^|[\/_\-])icon(?:[\/_\-\.]|$)/.test(pathPart);
}

function extractLogos(html: string, baseUrl: string): { url: string; type: string; format: string; width?: number; height?: number }[] {
  const logos: { url: string; type: string; format: string; width?: number; height?: number }[] = [];
  const seen = new Set<string>();

  // 1. <link rel="icon">, <link rel="apple-touch-icon">, <link rel="shortcut icon"> — highest confidence
  const linkTags = extractBetween(html, "<link", ">");
  for (const tag of linkTags) {
    const relMatch = tag.match(/rel=["']([^"']+)/i);
    const hrefMatch = tag.match(/href=["']([^"']+)/i);
    if (!relMatch || !hrefMatch) continue;
    const rel = relMatch[1].toLowerCase();
    if (rel.includes("icon") || rel.includes("apple-touch")) {
      const fullUrl = resolveUrl(hrefMatch[1], baseUrl);
      if (seen.has(fullUrl)) continue;
      seen.add(fullUrl);
      const format = fullUrl.endsWith(".svg") ? "SVG" : fullUrl.endsWith(".png") ? "PNG" : "ICO";
      const type = rel.includes("apple") ? "apple-touch-icon" : rel.includes("shortcut") ? "shortcut-icon" : "favicon";
      logos.push({ url: fullUrl, type, format });
    }
  }

  // 2. <meta property="og:image"> — high confidence
  const ogImage = extractMetaContent(html, "og:image");
  if (ogImage) {
    const fullUrl = resolveUrl(ogImage, baseUrl);
    if (!seen.has(fullUrl)) {
      seen.add(fullUrl);
      logos.push({ url: fullUrl, type: "og-image", format: "Unknown" });
    }
  }

  // 3. <img> tags with logo/icon in src path or alt text — only distinct path segments
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    const src = match[1];
    const altMatch = match[0].match(/alt=["']([^"']*)/i);
    const alt = altMatch ? altMatch[1].toLowerCase() : "";
    const srcLower = src.toLowerCase();
    const isLogo = isLogoUrl(src) || alt.includes("logo") || alt.includes("icon");
    if (!isLogo) continue;
    const fullUrl = resolveUrl(src, baseUrl);
    if (seen.has(fullUrl)) continue;
    seen.add(fullUrl);
    const format = srcLower.endsWith(".svg") ? "SVG" : srcLower.endsWith(".png") ? "PNG" : srcLower.endsWith(".webp") ? "WebP" : "Unknown";
    logos.push({ url: fullUrl, type: "img-logo", format });
  }

  return logos.slice(0, 8);
}

function extractBrandImages(html: string, baseUrl: string): { url: string; alt: string; type: string }[] {
  const images: { url: string; alt: string; type: string }[] = [];
  const seen = new Set<string>();

  // 1. <meta property="og:image"> — always include as hero candidate
  const ogImage = extractMetaContent(html, "og:image");
  if (ogImage) {
    const fullUrl = resolveUrl(ogImage, baseUrl);
    seen.add(fullUrl);
    images.push({ url: fullUrl, alt: "Open Graph image", type: "hero" });
  }

  // 2. <img> tags — include all reasonable images
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    const src = match[1];
    const altMatch = match[0].match(/alt=["']([^"']*)/i);
    const alt = altMatch ? altMatch[1] : "";

    // Skip data URIs and tracking pixels
    if (src.startsWith("data:")) continue;
    const srcLower = src.toLowerCase();
    if (srcLower.includes("1x1") || srcLower.includes("pixel") || srcLower.includes("track") || srcLower.includes("analytics")) continue;

    const fullUrl = resolveUrl(src, baseUrl);
    if (seen.has(fullUrl)) continue;
    seen.add(fullUrl);

    // Classify by alt/src keywords
    const altLower = alt.toLowerCase();
    let type = "brand-image";
    if (altLower.includes("hero") || srcLower.includes("hero")) type = "hero";
    else if (altLower.includes("banner") || srcLower.includes("banner")) type = "banner";
    else if (altLower.includes("product") || srcLower.includes("product")) type = "product";
    else if (altLower.includes("feature") || srcLower.includes("feature")) type = "feature";
    else if (altLower.includes("team") || srcLower.includes("team")) type = "team";
    else if (altLower.includes("background") || srcLower.includes("bg")) type = "background";

    images.push({ url: fullUrl, alt, type });
  }

  // 3. Background images in inline styles
  const bgRegex = /style=["'][^"']*background(?:-image)?:\s*url\(["']?([^"')]+)["']?\)/gi;
  while ((match = bgRegex.exec(html)) !== null) {
    const src = match[1];
    if (src.startsWith("data:")) continue;
    const fullUrl = resolveUrl(src, baseUrl);
    if (seen.has(fullUrl)) continue;
    seen.add(fullUrl);
    images.push({ url: fullUrl, alt: "Background image", type: "background" });
  }

  return images.slice(0, 12);
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith("http")) normalizedUrl = "https://" + normalizedUrl;

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(normalizedUrl);
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
    }

    // First request to get cookies
    const headers: Record<string, string> = {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
      "Cache-Control": "no-cache",
      "Sec-Ch-Ua": '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
      "Sec-Ch-Ua-Mobile": "?0",
      "Sec-Ch-Ua-Platform": '"macOS"',
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
      "Sec-Fetch-User": "?1",
      "Upgrade-Insecure-Requests": "1",
      "Referer": parsedUrl.origin,
    };

    let response;
    try {
      response = await fetch(parsedUrl.toString(), {
        headers,
        signal: AbortSignal.timeout(30000),
        redirect: "follow",
      });
    } catch {
      // Retry once with slightly different headers
      response = await fetch(parsedUrl.toString(), {
        headers: {
          ...headers,
          "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
          "Sec-Fetch-Site": "same-origin",
        },
        signal: AbortSignal.timeout(30000),
        redirect: "follow",
      });
    }

    if (!response.ok) {
      const errorDetail = `HTTP ${response.status}`;
      if (response.status === 403) {
        return NextResponse.json(
          { error: "This website blocks automated access. Try a different URL or a simpler page." },
          { status: 502 }
        );
      }
      if (response.status === 404) {
        return NextResponse.json(
          { error: "Page not found. Please check the URL and try again." },
          { status: 502 }
        );
      }
      return NextResponse.json({ error: `Failed to fetch: ${errorDetail}` }, { status: 502 });
    }

    const html = await response.text();

    // Limit HTML size to prevent memory issues (max 5MB)
    const limitedHtml = html.length > 5 * 1024 * 1024 ? html.slice(0, 5 * 1024 * 1024) : html;

    // Check if we got meaningful content
    if (limitedHtml.length < 100) {
      return NextResponse.json(
        { error: "The website returned empty or minimal content. It may be blocking automated requests." },
        { status: 502 }
      );
    }

    const ogTitle = extractMetaContent(limitedHtml, "og:title");
    const titleMatch = limitedHtml.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : "";
    const h1Match = limitedHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    const h1 = h1Match ? h1Match[1].replace(/<[^>]+>/g, "").trim() : "";
    const domain = parsedUrl.hostname.replace(/^www\./, "").split(".")[0];
    const brandName = ogTitle || h1 || title || domain.charAt(0).toUpperCase() + domain.slice(1);

    const colors = extractColors(limitedHtml);
    const fonts = extractFonts(limitedHtml);
    const text = extractText(limitedHtml);
    const tones = analyzeTone(text);
    const socialLinks = extractSocialLinks(limitedHtml);
    const logos = extractLogos(limitedHtml, normalizedUrl);
    const brandImages = extractBrandImages(limitedHtml, normalizedUrl);

    const metaDesc = extractMetaContent(limitedHtml, "description") || extractMetaContent(limitedHtml, "og:description") || "";
    const keywordsRaw = extractMetaContent(limitedHtml, "keywords") || "";
    const keywords = keywordsRaw.split(",").map((k) => k.trim()).filter(Boolean);

    const brandValues: string[] = [];
    if (/innovat/i.test(text)) brandValues.push("Innovation");
    if (/quality|excellence/i.test(text)) brandValues.push("Quality");
    if (/sustain|eco|green/i.test(text)) brandValues.push("Sustainability");
    if (/community|together/i.test(text)) brandValues.push("Community");
    if (/customer|user|people/i.test(text)) brandValues.push("Customer Focus");
    if (/design|craft|create/i.test(text)) brandValues.push("Design");
    if (/trust|secure|reliable/i.test(text)) brandValues.push("Trust");
    if (/speed|fast|quick/i.test(text)) brandValues.push("Speed");
    if (brandValues.length === 0) brandValues.push("Excellence", "Innovation", "Quality");

    const imageryStyle: string[] = [];
    if (/photo|image|picture/i.test(text)) imageryStyle.push("Photography-focused");
    if (/minimal|clean|simple/i.test(text)) imageryStyle.push("Clean & minimal");
    if (/color|vibrant|bold/i.test(text)) imageryStyle.push("Colorful");
    if (/elegant|refined|luxury/i.test(text)) imageryStyle.push("Elegant");
    if (imageryStyle.length === 0) imageryStyle.push("Clean", "Professional");

    const ogTitleContent = extractMetaContent(limitedHtml, "og:title") || "";
    const tagline = ogTitleContent.replace(brandName, "").trim().replace(/^[-–—|:]\s*/, "") || "";

    return NextResponse.json({
      name: brandName.replace(/\s+/g, " ").trim().slice(0, 60),
      url: normalizedUrl,
      colors,
      fonts,
      tone: tones,
      missionStatement: metaDesc?.slice(0, 300) || `We are ${brandName}, dedicated to delivering exceptional value through innovation and quality.`,
      targetAudience: `Users and professionals interested in ${brandName}'s products and services. People who value quality, reliability, and innovative solutions.`,
      brandValues,
      competitors: [],
      tagline: tagline || `The ${brandName} experience`,
      imageryStyle,
      socialLinks,
      description: metaDesc,
      keywords,
      logo: logos.length > 0 && logos[0].url !== "inline-svg" ? logos[0].url : null,
      logos,
      brandImages,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message.includes("timeout") || message.includes("aborted")) {
      return NextResponse.json(
        { error: "The website took too long to respond. Please try again or try a different URL." },
        { status: 504 }
      );
    }
    return NextResponse.json({ error: `Extraction failed: ${message}` }, { status: 500 });
  }
}
