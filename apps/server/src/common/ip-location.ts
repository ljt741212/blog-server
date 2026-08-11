import IP2Region from 'ip2region';

let instance: IP2Region | null = null;

function getSearcher(): IP2Region {
  if (!instance) {
    instance = new IP2Region();
  }
  return instance;
}

export function ipToLocation(ip: string): string | null {
  if (!ip || ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') {
    return '本地';
  }
  try {
    const result = getSearcher().search(ip);
    if (!result) return null;
    const parts = [result.country, result.province, result.city].filter(
      Boolean,
    );
    return parts.length > 0 ? parts.join(' ') : null;
  } catch {
    return null;
  }
}
