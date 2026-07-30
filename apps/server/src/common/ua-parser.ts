import Bowser from 'bowser';

/**
 * 从原始 User-Agent 中提取 "操作系统 + 浏览器" 的简短描述。
 * 解析失败时返回原始 UA。
 */
export function parseUserAgent(raw?: string | null): string {
  if (!raw) return '';

  const parsed = Bowser.parse(raw);

  const os = formatOS(parsed);
  const browser = formatBrowser(parsed);

  if (!os && !browser) return raw;
  if (!os) return browser || raw;
  if (!browser) return os;

  return `${os} + ${browser}`;
}

function formatOS(parsed: Bowser.Parser.ParsedResult): string {
  const name = parsed.os.name;
  const version = parsed.os.version;

  if (!name) return '';

  // 统一 macOS 名称
  if (name === 'macOS') {
    return version ? `macOS ${version}` : 'macOS';
  }

  // Windows 版本号映射
  if (name === 'Windows') {
    if (!version) return 'Windows';
    // NT 10.0 → 10, NT 6.1 → 7, NT 6.3 → 8.1
    const map: Record<string, string> = {
      '10.0': '10',
      '6.3': '8.1',
      '6.2': '8',
      '6.1': '7',
    };
    const mapped = map[version];
    return mapped ? `Windows ${mapped}` : `Windows ${version}`;
  }

  return version ? `${name} ${version}` : name;
}

function formatBrowser(parsed: Bowser.Parser.ParsedResult): string {
  const name = parsed.browser.name;
  const version = parsed.browser.version;

  if (!name) return '';

  // 只取主版本号
  const major = version ? version.split('.')[0] : '';

  return major ? `${name} ${major}` : name;
}
