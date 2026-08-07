export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Set timeout to 10 seconds to give slow sites a chance
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  const fetchHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Connection': 'keep-alive'
  };

  try {
    // Try HEAD first to save bandwidth
    let response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: fetchHeaders
    });

    // If HEAD is not allowed (405) or returns 404/403, we should try a normal GET 
    // just in case the server blocks HEAD requests
    if (response.status === 405 || response.status === 404 || response.status === 403) {
      response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        headers: fetchHeaders
      });
    }

    clearTimeout(timeoutId);

    // Mặc định các mã lỗi 403 (Forbidden), 401 (Unauthorized), 429 (Rate Limit), 503 (Service Unavailable) 
    // thường là do tường lửa (Cloudflare) chặn Bot chặn Bot, nghĩa là trang web VẪN SỐNG.
    // Chỉ đánh dấu chết nếu là 404 (Not Found), 410 (Gone), 500 (Internal Error), hoặc các lỗi máy chủ nghiêm trọng khác.
    const falsePositives = [401, 403, 405, 406, 429, 502, 503];
    
    if (response.status >= 400 && !falsePositives.includes(response.status)) {
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
