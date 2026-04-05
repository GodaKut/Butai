import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-e770b7da/health", (c) => {
  return c.json({ status: "ok" });
});

// Scrape apartment details from URL
app.post("/make-server-e770b7da/scrape", async (c) => {
  try {
    const { url } = await c.req.json();
    
    if (!url || typeof url !== 'string') {
      return c.json({ error: "URL is required" }, 400);
    }

    console.log(`Scraping apartment data from: ${url}`);

    // Fetch the webpage with browser-like headers to avoid being blocked
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0',
      },
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch URL. Status: ${response.status} ${response.statusText}`);
      return c.json({ error: `Failed to fetch URL: ${response.statusText}` }, 400);
    }

    const html = await response.text();
    console.log(`Successfully fetched HTML, length: ${html.length}`);

    // Extract apartment details using regex patterns
    const extractText = (pattern: RegExp): string => {
      const match = html.match(pattern);
      return match ? match[1].trim() : '';
    };

    const extractNumber = (pattern: RegExp): number => {
      const match = html.match(pattern);
      if (!match) return 0;
      const numStr = match[1].replace(/[^\d]/g, '');
      return parseInt(numStr) || 0;
    };

    // Extract location from URL - the district/neighborhood
    const urlParts = url.split('/');
    const urlSlug = urlParts[urlParts.length - 2] || '';
    
    // Extract location (district/neighborhood) from URL pattern like "butai-vilniuje-zirmunuose"
    const locationPattern = /butai-([a-z-]+)/i;
    const locationMatch = url.match(locationPattern);
    let location = '';
    if (locationMatch) {
      const parts = locationMatch[1].split('-');
      // Skip "vilniuje" and get the neighborhood
      const filtered = parts.filter(p => p !== 'vilniuje');
      location = filtered.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
    }

    // Extract street address from URL
    const addressMatch = urlSlug.match(/([a-z-]+)-g-/i);
    let street = addressMatch ? addressMatch[1].replace(/-/g, ' ') + ' g.' : '';
    
    // Try to get more specific address from the page title
    const addressPattern = /<h1[^>]*class="[^"]*obj-header-text[^"]*"[^>]*>([^<]+)<\/h1>/i;
    const addressFromPage = extractText(addressPattern);
    if (addressFromPage) {
      street = addressFromPage;
    }

    // Combine location and street for full address
    const address = location ? `${street}, ${location}` : street;

    // Extract district (just the main area like "Vilnius")
    const district = 'Vilnius';

    // Extract price - looking for price in euros
    const pricePattern = /<span[^>]*class="[^"]*price-eur[^"]*"[^>]*>([^<]+)<\/span>/i;
    const priceAlt = /<div[^>]*class="[^"]*price[^"]*"[^>]*>.*?(\d[\d\s]*)\s*€/is;
    let price = extractNumber(pricePattern);
    if (price === 0) {
      price = extractNumber(priceAlt);
    }

    // Extract year built - looking for "Metai:" in Lithuanian
    const yearPattern = /Metai:<\/dt>\s*<dd[^>]*>(\d{4})/i;
    const yearAlt = /Statybos metai:<\/dt>\s*<dd[^>]*>(\d{4})/i;
    const yearAlt2 = /metai[^>]*>.*?(\d{4})/i;
    let yearBuilt = extractNumber(yearPattern);
    if (yearBuilt === 0) {
      yearBuilt = extractNumber(yearAlt);
    }
    if (yearBuilt === 0) {
      yearBuilt = extractNumber(yearAlt2);
    }
    if (yearBuilt === 0 || yearBuilt < 1800 || yearBuilt > new Date().getFullYear()) {
      yearBuilt = new Date().getFullYear();
    }

    // Extract floor information (robust for Aukštas and floor.svg)
    let floor = '';
    const floorSvgPattern = /<dt[^>]*>\s*<img[^>]*floor\.svg[^>]*>[\s\S]*?<\/dt>\s*<dd[^>]*>[\s\S]*?<span[^>]*>\s*(\d+)\s*<\/span>/i;
    const floorSvgMatch = html.match(floorSvgPattern);
    if (floorSvgMatch) {
      floor = floorSvgMatch[1];
    } else {
      const floorPattern = /Aukštas:<\/dt>\s*<dd[^>]*>([^<]+)<\/dd>/i;
      const floorAlt = /aukštas[^>]*>.*?(\d+)[^<]*<\//i;
      floor = extractText(floorPattern);
      if (!floor) {
        floor = extractText(floorAlt);
      }
    }

    // Extract image URL
    const imagePattern = /<meta\s+property="og:image"\s+content="([^"]+)"/i;
    const imageAlt = /<img[^>]*class="[^"]*main-photo[^"]*"[^>]*src="([^"]+)"/i;
    let imageUrl = extractText(imagePattern);
    if (!imageUrl) {
      imageUrl = extractText(imageAlt);
    }

    console.log('Extracted data:', { address, district, yearBuilt, price, floor, imageUrl });

    return c.json({
      address,
      district,
      yearBuilt,
      price,
      floor: floor ? Number(floor) : null,
      imageUrl,
      url,
    });
  } catch (error) {
    console.error('Scraping error:', error);
    return c.json({ error: `Failed to scrape apartment data: ${error.message}` }, 500);
  }
});

Deno.serve(app.fetch);