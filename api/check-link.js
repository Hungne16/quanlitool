export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Set timeout to 6 seconds to avoid function timeout on serverless
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    // Try HEAD first to save bandwidth
    let response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    // If HEAD is not allowed (405) or returns 404, we should try a normal GET just in case the server blocks HEAD requests
    if (response.status === 405 || response.status === 404) {
      response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
    }

    clearTimeout(timeoutId);

    if (response.status >= 400) {
      return res.status(200).json({ isDead: true, status: response.status, reason: `HTTP ${response.status}` });
    }

    return res.status(200).json({ isDead: false, status: response.status });
  } catch (error) {
    clearTimeout(timeoutId);
    console.error(`Check link failed for ${url}:`, error.message);
    
    let reason = error.message;
    if (error.name === 'AbortError') {
      reason = 'Timeout (6s)';
    }

    return res.status(200).json({ isDead: true, reason });
  }
}
