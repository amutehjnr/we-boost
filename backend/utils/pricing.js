const { PlatformSetting } = require('../models');

const DEFAULT_SERVICE_RATES = {
  Basic: 10000,
  Moderate: 25000,
  High: 50000,
};

const DEFAULT_SERVICE_DESCRIPTIONS = {
  Basic:
    'Gradual delivery over a few days, from real-looking but lower-activity accounts. Our most affordable tier.',
  Moderate:
    'Faster delivery with a balanced mix of account quality — our most popular choice.',
  High:
    'Fastest delivery from premium, high-activity accounts for maximum credibility and retention.',
};

const DEFAULT_TASK_RATES = {
  Facebook: { Like: 10, Follow: 20, Comment: 25, Share: 30 },
  Instagram: { Like: 12, Follow: 25, Comment: 30, Share: 35 },
  TikTok: { Like: 15, Follow: 30, Comment: 35, Share: 40 },
  Twitter: { Like: 10, Follow: 25, Comment: 20, Retweet: 30 },
  YouTube: { Like: 20, Subscribe: 40, Comment: 30, Share: 35, View: 5 },
  Spotify: { Stream: 15 },
  Audiomack: { Stream: 12 },
  YoutubeMusic: { Stream: 18 },
  LinkedIn: { Like: 15, Follow: 30, Comment: 35, Share: 35 },
  Twitch: { Follow: 20, View: 8 },
  Telegram: { Join: 15, View: 5 },
};

function envServiceRates() {
  return {
    Basic: parseFloat(process.env.SERVICE_RATE_BASIC) || DEFAULT_SERVICE_RATES.Basic,
    Moderate:
      parseFloat(process.env.SERVICE_RATE_MODERATE) || DEFAULT_SERVICE_RATES.Moderate,
    High: parseFloat(process.env.SERVICE_RATE_HIGH) || DEFAULT_SERVICE_RATES.High,
  };
}

function deepMerge(base, override) {
  if (!override || typeof override !== 'object') return { ...base };
  const out = { ...base };
  for (const [k, v] of Object.entries(override)) {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      out[k] = deepMerge(base[k] || {}, v);
    } else if (v !== undefined && v !== null && v !== '') {
      out[k] = v;
    }
  }
  return out;
}

async function getPricing() {
  let stored = null;
  try {
    const row = await PlatformSetting.findOne({ where: { key: 'pricing' } });
    stored = row?.value || null;
  } catch (e) {
    console.error('Failed to load pricing settings:', e.message);
  }

  const serviceRates = stored?.serviceRates
    ? { ...stored.serviceRates }
    : envServiceRates();

  const serviceDescriptions = {
    ...DEFAULT_SERVICE_DESCRIPTIONS,
    ...(stored?.serviceDescriptions || {}),
  };

  const taskRates = deepMerge(DEFAULT_TASK_RATES, stored?.taskRates);

  for (const k of Object.keys(serviceRates)) {
    serviceRates[k] = parseFloat(serviceRates[k]) || 0;
  }
  for (const platform of Object.keys(taskRates)) {
    for (const action of Object.keys(taskRates[platform] || {})) {
      taskRates[platform][action] = parseFloat(taskRates[platform][action]) || 0;
    }
  }

  for (const k of Object.keys(serviceDescriptions)) {
    if (!(k in serviceRates)) delete serviceDescriptions[k];
  }

  return {
    serviceRates,
    serviceDescriptions,
    taskRates,
    platformReservePercent: parseFloat(stored?.platformReservePercent) || 0,
  };
}

async function savePricing(data) {
  const current = await getPricing();

  let serviceRates = current.serviceRates;
  if (data.serviceRates && typeof data.serviceRates === 'object') {
    serviceRates = {};
    for (const [k, v] of Object.entries(data.serviceRates)) {
      const name = String(k).trim();
      if (!name) continue;
      serviceRates[name] = parseFloat(v) || 0;
    }
  }

  let serviceDescriptions = { ...current.serviceDescriptions };
  if (data.serviceDescriptions && typeof data.serviceDescriptions === 'object') {
    serviceDescriptions = {};
    for (const [k, v] of Object.entries(data.serviceDescriptions)) {
      if (k in serviceRates) {
        serviceDescriptions[k] = String(v || '');
      }
    }
  } else {
    const nextDesc = {};
    for (const k of Object.keys(serviceRates)) {
      nextDesc[k] = serviceDescriptions[k] || '';
    }
    serviceDescriptions = nextDesc;
  }

  const taskRates = data.taskRates
    ? deepMerge(current.taskRates, data.taskRates)
    : current.taskRates;

  for (const platform of Object.keys(taskRates)) {
    for (const action of Object.keys(taskRates[platform] || {})) {
      taskRates[platform][action] = parseFloat(taskRates[platform][action]) || 0;
    }
  }

  const next = {
    serviceRates,
    serviceDescriptions,
    taskRates,
    platformReservePercent:
      data.platformReservePercent !== undefined
        ? parseFloat(data.platformReservePercent) || 0
        : current.platformReservePercent,
  };

  const [row] = await PlatformSetting.findOrCreate({
    where: { key: 'pricing' },
    defaults: { value: next },
  });
  await row.update({ value: next });
  return next;
}

module.exports = {
  DEFAULT_SERVICE_RATES,
  DEFAULT_TASK_RATES,
  getPricing,
  savePricing,
};