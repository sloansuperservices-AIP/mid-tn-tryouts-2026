const https = require('https');

const GH_TOKEN = process.env.GH_TOKEN;
const GH_OWNER = process.env.GH_OWNER;
const GH_REPO  = process.env.GH_REPO;
const GH_PATH  = 'data/tryout-live.json';

function ghRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: 'api.github.com',
      path: `/repos/${GH_OWNER}/${GH_REPO}/contents/${path}`,
      method,
      headers: {
        'Authorization': `token ${GH_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'midtn-netlify-sync',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
      }
    }, res => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(raw) }));
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

function ghRaw(path) {
  return new Promise((resolve, reject) => {
    https.get({
      hostname: 'raw.githubusercontent.com',
      path: `/${GH_OWNER}/${GH_REPO}/main/${path}`,
      headers: {
        'Authorization': `token ${GH_TOKEN}`,
        'User-Agent': 'midtn-netlify-sync'
      }
    }, res => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => resolve(raw));
    }).on('error', reject);
  });
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // GET — return current data
    if (event.httpMethod === 'GET') {
      const raw = await ghRaw(GH_PATH);
      return { statusCode: 200, headers, body: raw };
    }

    // POST — merge and write data
    if (event.httpMethod === 'POST') {
      const incoming = JSON.parse(event.body);
      if (!Array.isArray(incoming)) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Expected array' }) };
      }

      // Get current file + SHA
      const meta = await ghRequest('GET', GH_PATH);
      let current = [];
      try {
        const raw = await ghRaw(GH_PATH);
        current = JSON.parse(raw);
      } catch(e) {}

      // Merge: incoming data wins for any athlete by id
      const merged = [...current];
      const idMap = {};
      merged.forEach((a, i) => { idMap[a.id] = i; });

      incoming.forEach(a => {
        if (!a.id) return;
        if (idMap[a.id] !== undefined) {
          // merge — keep richer data
          const existing = merged[idMap[a.id]];
          merged[idMap[a.id]] = {
            ...existing,
            ...a,
            metrics: {
              ...existing.metrics,
              ...a.metrics
            }
          };
        } else {
          idMap[a.id] = merged.length;
          merged.push(a);
        }
      });

      const encoded = Buffer.from(JSON.stringify(merged)).toString('base64');
      await ghRequest('PUT', GH_PATH, {
        message: 'sync: netlify function update',
        content: encoded,
        sha: meta.body.sha
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ ok: true, athletes: merged.length })
      };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};
