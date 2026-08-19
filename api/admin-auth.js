import crypto from 'crypto';

const COOKIE_NAME = 'prezzemolo_admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 12;

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET?.trim() || process.env.ADMIN_PASSWORD?.trim() || '';
}

function sign(payload) {
  return crypto.createHmac('sha256', getSessionSecret()).update(payload).digest('base64url');
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function readCookie(req, name) {
  const cookieHeader =
    req.headers?.cookie ||
    req.headers?.Cookie ||
    req.headers?.get?.('cookie') ||
    '';

  return String(cookieHeader)
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

function shouldUseSecureCookie() {
  return process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);
}

export function createAdminSessionCookie() {
  const secret = getSessionSecret();
  if (!secret) return null;

  const payload = Buffer.from(
    JSON.stringify({ iat: Math.floor(Date.now() / 1000) }),
  ).toString('base64url');
  const token = `${payload}.${sign(payload)}`;
  const attributes = [
    `${COOKIE_NAME}=${token}`,
    'Path=/',
    `Max-Age=${SESSION_TTL_SECONDS}`,
    'HttpOnly',
    'SameSite=Strict',
  ];

  if (shouldUseSecureCookie()) {
    attributes.push('Secure');
  }

  return attributes.join('; ');
}

export function requireAdminSession(req, res) {
  const secret = getSessionSecret();
  const token = readCookie(req, COOKIE_NAME);
  if (!secret || !token) {
    res.status(401).json({ error: 'Non autorizzato' });
    return false;
  }

  const [payload, signature] = token.split('.');
  if (!payload || !signature || !safeEqual(signature, sign(payload))) {
    res.status(401).json({ error: 'Non autorizzato' });
    return false;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    const now = Math.floor(Date.now() / 1000);
    const valid =
      typeof parsed.iat === 'number' &&
      parsed.iat <= now + 60 &&
      now - parsed.iat <= SESSION_TTL_SECONDS;

    if (!valid) {
      res.status(401).json({ error: 'Non autorizzato' });
      return false;
    }

    return true;
  } catch {
    res.status(401).json({ error: 'Non autorizzato' });
    return false;
  }
}
