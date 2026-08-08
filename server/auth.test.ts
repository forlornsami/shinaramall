/**
 * Integration tests for the email-verification auth flows.
 *
 * The storage layer and email service are fully mocked so the tests
 * run without a real database or SMTP connection.
 */
import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";
import express from "express";
import supertest from "supertest";
import type { Server } from "http";

// ── Module mocks ──────────────────────────────────────────────────────────────
// vi.mock calls are hoisted to the top of the compiled output, so the factory
// functions run before any other module-level code in this file.

/**
 * Auto-stub every method on the storage mock with vi.fn() so we don't have
 * to enumerate all ~100 methods that registerRoutes wires up at startup.
 * The Proxy creates a new vi.fn() on first access and caches it, giving each
 * individual test the ability to override specific methods via mockResolvedValue.
 */
vi.mock("./storage", () => {
  const cache: Record<string, ReturnType<typeof vi.fn>> = {};
  const storageMock = new Proxy(cache, {
    get(target, prop: string) {
      if (!(prop in target)) {
        target[prop] = vi.fn().mockResolvedValue(undefined);
      }
      return target[prop];
    },
  });
  return { storage: storageMock };
});

vi.mock("./emailService", () => ({
  sendVerificationEmail: vi.fn().mockResolvedValue({ success: true }),
  sendOrderConfirmationEmail: vi.fn().mockResolvedValue({ success: true }),
  sendOrderStatusUpdateEmail: vi.fn().mockResolvedValue({ success: true }),
  sendPaymentVerifiedEmail: vi.fn().mockResolvedValue({ success: true }),
  sendPasswordResetEmail: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock("./notificationHelper", () => ({
  shouldSendAdminNotification: vi.fn().mockResolvedValue(false),
  shouldSendEmailNotification: vi.fn().mockResolvedValue(false),
  invalidateNotificationSettingsCache: vi.fn(),
}));

vi.mock("./notificationSender", () => ({
  sendAdminNotification: vi.fn().mockResolvedValue(undefined),
  sendCustomerNotification: vi.fn().mockResolvedValue(undefined),
  defaultNotificationMessages: {},
}));

vi.mock("./db", () => ({
  db: {},
}));

// ── Imports (after mocks) ─────────────────────────────────────────────────────

import { registerRoutes } from "./routes";
import { storage } from "./storage";

// ── Helpers ───────────────────────────────────────────────────────────────────

/** A minimal user object that the storage mock can return. */
function makeUser(overrides: Record<string, unknown> = {}) {
  return {
    id: "user-123",
    email: "test@example.com",
    passwordHash:
      // bcrypt hash of "correct-password" with salt rounds=10 — pre-computed
      // so the non-login tests don't need to run bcrypt.
      "$2b$10$abcdefghijklmnopqrstuvuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu",
    firstName: "Test",
    lastName: "User",
    mobile: null,
    isActive: true,
    emailVerified: false,
    emailVerificationToken: "valid-token-abc",
    emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    profileImageUrl: null,
    shippingAddress: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

// ── App setup ─────────────────────────────────────────────────────────────────

let app: express.Express;
let server: Server;

beforeEach(async () => {
  // Clear call-counts (not implementations) so each test starts fresh.
  vi.clearAllMocks();

  app = express();
  app.use(express.json());
  server = await registerRoutes(app);
});

afterAll(() => {
  server?.close();
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("POST /api/auth/register", () => {
  const validPayload = {
    email: "newuser@example.com",
    password: "password123",
    firstName: "New",
    lastName: "User",
  };

  it("new registration: responds 201 with REGISTRATION_SUCCESS and does NOT issue a JWT", async () => {
    vi.mocked(storage.getUserByEmail).mockResolvedValue(null);
    vi.mocked(storage.createUser).mockResolvedValue(
      makeUser({ email: validPayload.email }),
    );

    const res = await supertest(app)
      .post("/api/auth/register")
      .send(validPayload);

    expect(res.status).toBe(201);
    expect(res.body.code).toBe("REGISTRATION_SUCCESS");
    // No JWT must be issued
    expect(res.body.token).toBeUndefined();
    expect(res.body.user).toBeUndefined();
  });

  it("duplicate signup with UNVERIFIED email: returns VERIFICATION_RESENT without creating a new user", async () => {
    const existingUnverified = makeUser({
      email: validPayload.email,
      emailVerified: false,
    });
    vi.mocked(storage.getUserByEmail).mockResolvedValue(existingUnverified);
    vi.mocked(storage.updateUser).mockResolvedValue(existingUnverified);

    const res = await supertest(app)
      .post("/api/auth/register")
      .send(validPayload);

    expect(res.status).toBe(200);
    expect(res.body.code).toBe("VERIFICATION_RESENT");
    // Must NOT have created a new user row
    expect(vi.mocked(storage.createUser)).not.toHaveBeenCalled();
    // Must have rotated the verification token on the existing user
    expect(vi.mocked(storage.updateUser)).toHaveBeenCalledWith(
      existingUnverified.id,
      expect.objectContaining({ emailVerificationToken: expect.any(String) }),
    );
    // No token in response
    expect(res.body.token).toBeUndefined();
  });

  it("duplicate signup with VERIFIED email: returns 400 with 'already exists' message", async () => {
    const existingVerified = makeUser({
      email: validPayload.email,
      emailVerified: true,
    });
    vi.mocked(storage.getUserByEmail).mockResolvedValue(existingVerified);

    const res = await supertest(app)
      .post("/api/auth/register")
      .send(validPayload);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already exists/i);
    expect(vi.mocked(storage.createUser)).not.toHaveBeenCalled();
  });
});

describe("POST /api/auth/resend-verification-email", () => {
  const endpoint = "/api/auth/resend-verification-email";
  const payload = { email: "unverified@example.com" };

  const unverifiedUser = () =>
    makeUser({
      email: payload.email,
      emailVerified: false,
      emailVerificationToken: "existing-token",
      emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

  it("returns generic success for a non-existent email without sending", async () => {
    const { sendVerificationEmail } = await import("./emailService");
    vi.mocked(storage.getUserByEmail).mockResolvedValue(null);

    const res = await supertest(app).post(endpoint).send(payload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(vi.mocked(sendVerificationEmail)).not.toHaveBeenCalled();
  });

  it("returns generic success for an already-verified email without sending", async () => {
    const { sendVerificationEmail } = await import("./emailService");
    vi.mocked(storage.getUserByEmail).mockResolvedValue(
      makeUser({ email: payload.email, emailVerified: true }),
    );

    const res = await supertest(app).post(endpoint).send(payload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(vi.mocked(sendVerificationEmail)).not.toHaveBeenCalled();
  });

  it("sends a verification email for an unverified account", async () => {
    const { sendVerificationEmail } = await import("./emailService");
    vi.mocked(storage.getUserByEmail).mockResolvedValue(unverifiedUser());
    vi.mocked(storage.updateUser).mockResolvedValue(unverifiedUser());

    const res = await supertest(app).post(endpoint).send(payload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(vi.mocked(sendVerificationEmail)).toHaveBeenCalledTimes(1);
  });

  it("concurrent requests for an expired-token account never exceed 3 sends in the same hour", async () => {
    const { sendVerificationEmail } = await import("./emailService");

    // Expired token — forces the endpoint to rotate the token (the case
    // that was previously vulnerable to the race condition).
    const expiredUser = makeUser({
      email: payload.email,
      emailVerified: false,
      emailVerificationToken: "old-token",
      emailVerificationExpires: new Date(Date.now() - 1000), // already expired
    });

    vi.mocked(storage.getUserByEmail).mockResolvedValue(expiredUser);
    vi.mocked(storage.updateUser).mockResolvedValue(expiredUser);

    // Fire 5 concurrent requests; only the first 3 should result in sends.
    const responses = await Promise.all(
      Array.from({ length: 5 }, () =>
        supertest(app).post(endpoint).send(payload),
      ),
    );

    // All responses must be 200 (generic success — no info leak)
    for (const r of responses) {
      expect(r.status).toBe(200);
    }

    // Critical assertion: never more than 3 sends regardless of concurrency
    expect(vi.mocked(sendVerificationEmail).mock.calls.length).toBeLessThanOrEqual(3);
  });

  it("returns generic success (not a rate-limit error) when throttled", async () => {
    const { sendVerificationEmail } = await import("./emailService");
    vi.mocked(storage.getUserByEmail).mockResolvedValue(unverifiedUser());
    vi.mocked(storage.updateUser).mockResolvedValue(unverifiedUser());

    // Exhaust the quota
    await Promise.all(
      Array.from({ length: 3 }, () =>
        supertest(app).post(endpoint).send(payload),
      ),
    );

    vi.mocked(sendVerificationEmail).mockClear();

    // 4th request should be throttled but still return generic success
    const res = await supertest(app).post(endpoint).send(payload);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(vi.mocked(sendVerificationEmail)).not.toHaveBeenCalled();
  });
});

describe("POST /api/auth/login", () => {
  const credentials = { email: "test@example.com", password: "correct-password" };

  it("unverified account: returns 403 with EMAIL_NOT_VERIFIED code and no token", async () => {
    const bcrypt = await import("bcryptjs");
    const passwordHash = await bcrypt.hash(credentials.password, 10);

    vi.mocked(storage.getUserByEmail).mockResolvedValue(
      makeUser({ passwordHash, emailVerified: false }),
    );

    const res = await supertest(app)
      .post("/api/auth/login")
      .send(credentials);

    expect(res.status).toBe(403);
    expect(res.body.code).toBe("EMAIL_NOT_VERIFIED");
    expect(res.body.token).toBeUndefined();
  });

  it("verified account: returns 200 with a JWT and user object (no password hash exposed)", async () => {
    const bcrypt = await import("bcryptjs");
    const passwordHash = await bcrypt.hash(credentials.password, 10);

    vi.mocked(storage.getUserByEmail).mockResolvedValue(
      makeUser({ passwordHash, emailVerified: true }),
    );

    const res = await supertest(app)
      .post("/api/auth/login")
      .send(credentials);

    expect(res.status).toBe(200);
    expect(typeof res.body.token).toBe("string");
    expect(res.body.token.length).toBeGreaterThan(0);
    expect(res.body.user).toBeDefined();
    // Must not leak the password hash to the client
    expect(res.body.user.passwordHash).toBeUndefined();
  });
});
