// ─────────────────────────────────────────────────────────────────────────────
//  news-fetcher.js  |  RSS fetch, parse, filter, deduplicate
// ─────────────────────────────────────────────────────────────────────────────

const RSS_FEEDS = {
  electronics: [
    {
      name: 'EE Times',
      url: 'https://www.eetimes.com/feed/',
      weight: 10
    },
    {
      name: 'Electronic Design',
      url: 'https://www.electronicdesign.com/rss',
      weight: 9
    },
    {
      name: 'IEEE Spectrum',
      url: 'https://spectrum.ieee.org/feeds/feed.rss',
      weight: 10
    },
    {
      name: 'Semiconductor Engineering',
      url: 'https://semiengineering.com/feed/',
      weight: 10
    },
    {
      name: 'AnandTech',
      url: 'https://www.anandtech.com/rss/',
      weight: 8
    },
    {
      name: 'Tom\'s Hardware',
      url: 'https://www.tomshardware.com/feeds/all',
      weight: 7
    },
    {
      name: 'ExtremeTech',
      url: 'https://www.extremetech.com/feed',
      weight: 7
    },
    {
      name: 'EDN Network',
      url: 'https://www.edn.com/feed/',
      weight: 9
    }
  ],
  ai: [
    {
      name: 'MIT Tech Review – AI',
      url: 'https://www.technologyreview.com/topic/artificial-intelligence/feed',
      weight: 10
    },
    {
      name: 'VentureBeat AI',
      url: 'https://venturebeat.com/category/ai/feed/',
      weight: 9
    },
    {
      name: 'The Verge – AI',
      url: 'https://www.theverge.com/ai-artificial-intelligence/rss/index.xml',
      weight: 8
    },
    {
      name: 'Wired – AI',
      url: 'https://www.wired.com/feed/tag/ai/latest/rss',
      weight: 8
    },
    {
      name: 'AI News',
      url: 'https://www.artificialintelligence-news.com/feed/',
      weight: 9
    },
    {
      name: 'Google DeepMind Blog',
      url: 'https://deepmind.google/blog/rss.xml',
      weight: 10
    },
    {
      name: 'OpenAI Blog',
      url: 'https://openai.com/news/rss.xml',
      weight: 10
    },
    {
      name: 'Hugging Face Blog',
      url: 'https://huggingface.co/blog/feed.xml',
      weight: 9
    }
  ]
};

// ─── Electronics keyword filter ───────────────────────────────────────────────
const ELECTRONICS_KEYWORDS = [
  'semiconductor', 'chip', 'chipset', 'silicon', 'wafer', 'fab', 'foundry',
  'transistor', 'processor', 'cpu', 'gpu', 'fpga', 'asic', 'soc', 'mcu',
  'microcontroller', 'microprocessor', 'embedded', 'pcb', 'circuit', 'eda',
  'tsmc', 'intel', 'amd', 'nvidia', 'qualcomm', 'arm', 'samsung semiconductor',
  'broadcom', 'ti ', 'texas instruments', 'infineon', 'nxp', 'renesas',
  'stmicroelectronics', 'analog devices', 'onsemi', 'wolfson', 'maxim',
  'power electronics', 'mosfet', 'igbt', 'inverter', 'power supply',
  'battery technology', 'ev battery', 'solid state battery',
  'photonics', 'lidar sensor', 'rf electronics', 'antenna design',
  'consumer electronics', 'display technology', 'oled', 'microled', 'qled',
  'manufacturing', 'automotive electronics', 'industrial electronics',
  'robotics hardware', 'drone hardware', 'wearable hardware',
  'sensor', 'mems', 'ioe', 'iot hardware', 'smart device hardware',
  'electronics industry', 'supply chain', 'shortage', 'node nm',
  '3nm', '2nm', '5nm', '7nm', 'gate-all-around', 'gaa', 'finfet',
  'hbm', 'ddr5', 'lpddr', 'nand flash', 'memory chip', 'dram',
  'packaging', 'chiplet', 'heterogeneous integration', '3d stacking',
  'pcb design', 'signal integrity', 'emi', 'thermal management'
];

const ELECTRONICS_NEGATIVE = [
  'software update', 'app update', 'subscription', 'streaming', 'social media',
  'cybersecurity breach', 'data breach', 'privacy scandal', 'stock market',
  'movie', 'gaming title', 'esport', 'cryptocurrency', 'nft', 'metaverse hype'
];

// ─── AI keyword filter ────────────────────────────────────────────────────────
const AI_KEYWORDS = [
  'large language model', 'llm', 'foundation model', 'generative ai',
  'gpt', 'claude', 'gemini', 'llama', 'mistral', 'phi-', 'qwen',
  'artificial intelligence', 'machine learning', 'deep learning',
  'neural network', 'transformer model', 'diffusion model',
  'openai', 'anthropic', 'google deepmind', 'meta ai', 'microsoft ai',
  'hugging face', 'cohere', 'mistral ai', 'stability ai', 'midjourney',
  'ai regulation', 'ai policy', 'ai act', 'ai safety', 'ai alignment',
  'ai agent', 'agentic ai', 'autonomous ai', 'ai assistant',
  'ai model release', 'ai benchmark', 'ai research', 'ai breakthrough',
  'ai chip', 'ai accelerator', 'ai inference', 'ai training',
  'enterprise ai', 'ai deployment', 'ai product launch', 'ai startup',
  'ai investment', 'ai funding', 'ai acquisition',
  'computer vision', 'natural language processing', 'nlp',
  'reinforcement learning', 'rlhf', 'multimodal', 'text-to-image',
  'text-to-video', 'ai video', 'ai image generation', 'ai coding',
  'copilot', 'ai integration', 'ai tool', 'ai platform'
];

const AI_NEGATIVE = [
  'horoscope', 'tarot', 'astrology', 'conspiracy', 'pseudoscience',
  'clickbait ai', 'will ai destroy', 'robot uprising', 'terminator'
];

// ─── XML parser (minimal, no dependencies) ───────────────────────────────────
function parseRSS(xmlText, sourceName) {
  const items = [];
  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
  let itemMatch;

  while ((itemMatch = itemRegex.exec(xmlText)) !== null) {
    const block = itemMatch[1];

    const title = extractTag(block, 'title');
    const link = extractTag(block, 'link') || extractAttr(block, 'link', 'href');
    const pubDate = extractTag(block, 'pubDate') || extractTag(block, 'published') || extractTag(block, 'dc:date') || extractTag(block, 'updated');
    const description = stripHtml(extractTag(block, 'description') || extractTag(block, 'summary') || '');

    if (title && link) {
      items.push({
        title: decodeEntities(title.trim()),
        url: link.trim(),
        source: sourceName,
        publishedAt: pubDate ? new Date(pubDate) : new Date(),
        description: description.substring(0, 200)
      });
    }
  }

  // Also try Atom format
  const entryRegex = /<entry[^>]*>([\s\S]*?)<\/entry>/gi;
  let entryMatch;
  while ((entryMatch = entryRegex.exec(xmlText)) !== null) {
    const block = entryMatch[1];
    const title = extractTag(block, 'title');
    const link = extractAttr(block, 'link', 'href') || extractTag(block, 'link');
    const pubDate = extractTag(block, 'published') || extractTag(block, 'updated');
    const summary = stripHtml(extractTag(block, 'summary') || extractTag(block, 'content') || '');

    if (title && link) {
      items.push({
        title: decodeEntities(title.trim()),
        url: link.trim(),
        source: sourceName,
        publishedAt: pubDate ? new Date(pubDate) : new Date(),
        description: summary.substring(0, 200)
      });
    }
  }

  return items;
}

function extractTag(text, tag) {
  const m = text.match(new RegExp(`<${tag}[^>]*>(?:<\\!\\[CDATA\\[)?(.*?)(?:\\]\\]>)?<\\/${tag}>`, 'si'));
  return m ? m[1] : null;
}

function extractAttr(text, tag, attr) {
  const m = text.match(new RegExp(`<${tag}[^>]+${attr}=["']([^"']+)["']`, 'i'));
  return m ? m[1] : null;
}

function stripHtml(html) {
  return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function decodeEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code)));
}

// ─── Relevance scoring ────────────────────────────────────────────────────────
function scoreItem(item, keywords, negatives) {
  const text = (item.title + ' ' + item.description).toLowerCase();
  let score = 0;

  for (const kw of keywords) {
    if (text.includes(kw.toLowerCase())) score += 2;
  }
  for (const neg of negatives) {
    if (text.includes(neg.toLowerCase())) score -= 5;
  }

  // Recency bonus (within last 24h = +3, 48h = +1)
  const ageMs = Date.now() - item.publishedAt.getTime();
  const ageHours = ageMs / (1000 * 60 * 60);
  if (ageHours < 24) score += 3;
  else if (ageHours < 48) score += 1;

  return score;
}

// ─── Deduplication ────────────────────────────────────────────────────────────
function similarity(a, b) {
  const wa = new Set(a.toLowerCase().split(/\W+/).filter(w => w.length > 3));
  const wb = new Set(b.toLowerCase().split(/\W+/).filter(w => w.length > 3));
  const intersection = [...wa].filter(w => wb.has(w)).length;
  const union = new Set([...wa, ...wb]).size;
  return union > 0 ? intersection / union : 0;
}

function deduplicate(items) {
  const unique = [];
  for (const item of items) {
    const isDup = unique.some(u => similarity(u.title, item.title) > 0.55);
    if (!isDup) unique.push(item);
  }
  return unique;
}

// ─── Fetch a single feed ──────────────────────────────────────────────────────
async function fetchFeed(feed) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(feed.url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'IndustryPulse/1.0 (RSS Reader)',
        'Accept': 'application/rss+xml, application/atom+xml, text/xml, */*'
      }
    });
    clearTimeout(timeout);
    if (!res.ok) return [];
    const text = await res.text();
    return parseRSS(text, feed.name);
  } catch (e) {
    clearTimeout(timeout);
    return [];
  }
}

// ─── Main fetch function ──────────────────────────────────────────────────────
async function fetchNews() {
  const [electronicsRaw, aiRaw] = await Promise.all([
    Promise.all(RSS_FEEDS.electronics.map(f => fetchFeed(f))),
    Promise.all(RSS_FEEDS.ai.map(f => fetchFeed(f)))
  ]);

  // Flatten
  const allElec = electronicsRaw.flat();
  const allAI = aiRaw.flat();

  // Score
  const scoredElec = allElec
    .map(item => ({ ...item, score: scoreItem(item, ELECTRONICS_KEYWORDS, ELECTRONICS_NEGATIVE) }))
    .filter(item => item.score > 0);

  const scoredAI = allAI
    .map(item => ({ ...item, score: scoreItem(item, AI_KEYWORDS, AI_NEGATIVE) }))
    .filter(item => item.score > 0);

  // Sort by score + recency
  const sortFn = (a, b) => (b.score - a.score) || (b.publishedAt - a.publishedAt);

  const topElec = deduplicate(scoredElec.sort(sortFn)).slice(0, 7);
  const topAI = deduplicate(scoredAI.sort(sortFn)).slice(0, 7);

  return {
    electronics: topElec,
    ai: topAI,
    fetchedAt: Date.now(),
    online: true
  };
}

// Export for use in renderer via window.fetchNews
window.newsFetcher = { fetchNews };
