async function api(path, options = {}) {
  const r = await fetch('/api/' + path, {
    credentials: 'same-origin',
    cache: 'no-store',
    ...options
  });

  const contentType = r.headers.get('content-type') || '';
  const body = await r.text();

  if (!contentType.includes('application/json')) {
    throw new Error(
      `API /api/${path} returned HTTP ${r.status} instead of JSON`
    );
  }

  let data;
  try {
    data = JSON.parse(body);
  } catch {
    throw new Error(`API /api/${path} returned invalid JSON`);
  }

  if (!r.ok) {
    throw new Error(data.error || `Request failed (${r.status})`);
  }

  return data;
}
