import appRootPath from 'app-root-path';
import fs from 'fs/promises';
import { fileExists } from './fileExists';

function formatCookies(cookies: Record<string, string>): string {
  return Object.entries(cookies)
    .map(([name, value]) => `${name}=${value}`)
    .join('; ');
}

async function parseNetscapeCookies(
  filePath: string
): Promise<Record<string, string>> {
  const cookies: Record<string, string> = {};
  const fileContent = await fs.readFile(filePath, 'utf-8');

  const lines = fileContent.split('\n');

  for (const line of lines) {
    if (line.startsWith('#') || line.trim() === '') {
      continue;
    }

    const parts = line.split('\t');
    if (parts.length >= 7) {
      const cookieName = parts[5];
      const cookieValue = parts[6];
      cookies[cookieName] = cookieValue;
    }
  }

  return cookies;
}

// This function works with NETSCAPE cookies
export async function getYtCookiesString(): Promise<string | null> {
  const cookiesPath = `${appRootPath}/cookies.txt`;
  const cookiesExist = await fileExists(cookiesPath);
  if (!cookiesExist) return null;

  const cookies = await parseNetscapeCookies(cookiesPath);
  const cookieString = formatCookies(cookies);

  return cookieString;
}
