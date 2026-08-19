import { describe, expect, test } from 'vitest';

import getLeadsHandler from '../api/get-leads.js';
import sendUpdateHandler from '../api/send-update.js';
import verifyAdminHandler from '../api/verify-admin.js';

function createResponse() {
  return {
    statusCode: 200,
    headers: {},
    body: undefined,
    setHeader(name, value) {
      this.headers[name] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
    end() {
      return this;
    },
  };
}

describe('admin API authentication', () => {
  test('verify-admin sets a signed HTTP-only admin session cookie', async () => {
    const previousPassword = process.env.ADMIN_PASSWORD;
    const previousSessionSecret = process.env.ADMIN_SESSION_SECRET;
    process.env.ADMIN_PASSWORD = 'configured-secret';
    process.env.ADMIN_SESSION_SECRET = 'configured-session-secret';

    try {
      const req = {
        method: 'POST',
        headers: {},
        body: { password: 'configured-secret' },
      };
      const res = createResponse();

      await verifyAdminHandler(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.headers['Set-Cookie']).toContain('prezzemolo_admin_session=');
      expect(res.headers['Set-Cookie']).toContain('HttpOnly');
      expect(res.headers['Set-Cookie']).toContain('SameSite=Strict');
    } finally {
      if (previousPassword === undefined) {
        delete process.env.ADMIN_PASSWORD;
      } else {
        process.env.ADMIN_PASSWORD = previousPassword;
      }
      if (previousSessionSecret === undefined) {
        delete process.env.ADMIN_SESSION_SECRET;
      } else {
        process.env.ADMIN_SESSION_SECRET = previousSessionSecret;
      }
    }
  });

  test('get-leads rejects requests without a signed admin session', async () => {
    const previous = process.env.ADMIN_PASSWORD;
    process.env.ADMIN_PASSWORD = 'configured-secret';

    try {
      const req = { method: 'GET', headers: {} };
      const res = createResponse();

      await getLeadsHandler(req, res);

      expect(res.statusCode).toBe(401);
      expect(res.body.error).toBe('Non autorizzato');
    } finally {
      if (previous === undefined) {
        delete process.env.ADMIN_PASSWORD;
      } else {
        process.env.ADMIN_PASSWORD = previous;
      }
    }
  });

  test('get-leads rejects legacy password headers without a signed admin session', async () => {
    const previous = process.env.ADMIN_PASSWORD;
    process.env.ADMIN_PASSWORD = 'configured-secret';

    try {
      const req = {
        method: 'GET',
        headers: { 'x-admin-password': 'configured-secret' },
      };
      const res = createResponse();

      await getLeadsHandler(req, res);

      expect(res.statusCode).toBe(401);
      expect(res.body.error).toBe('Non autorizzato');
    } finally {
      if (previous === undefined) {
        delete process.env.ADMIN_PASSWORD;
      } else {
        process.env.ADMIN_PASSWORD = previous;
      }
    }
  });

  test('send-update checks admin session before request body validation', async () => {
    const previous = process.env.ADMIN_PASSWORD;
    process.env.ADMIN_PASSWORD = 'configured-secret';

    try {
      const req = { method: 'POST', headers: {}, body: {} };
      const res = createResponse();

      await sendUpdateHandler(req, res);

      expect(res.statusCode).toBe(401);
      expect(res.body.error).toBe('Non autorizzato');
    } finally {
      if (previous === undefined) {
        delete process.env.ADMIN_PASSWORD;
      } else {
        process.env.ADMIN_PASSWORD = previous;
      }
    }
  });

  test('send-update rejects legacy password headers before request body validation', async () => {
    const previous = process.env.ADMIN_PASSWORD;
    process.env.ADMIN_PASSWORD = 'configured-secret';

    try {
      const req = {
        method: 'POST',
        headers: { 'x-admin-password': 'configured-secret' },
        body: {},
      };
      const res = createResponse();

      await sendUpdateHandler(req, res);

      expect(res.statusCode).toBe(401);
      expect(res.body.error).toBe('Non autorizzato');
    } finally {
      if (previous === undefined) {
        delete process.env.ADMIN_PASSWORD;
      } else {
        process.env.ADMIN_PASSWORD = previous;
      }
    }
  });
});
