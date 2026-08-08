// @vitest-environment jsdom
/**
 * Tests for the unverified-email banner in AccountView.
 *
 * The auth hook, toast, AddressBook, and the global fetch are mocked so the
 * tests run without a real server, database, or network connection.
 */
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AccountView from "./AccountView";

// ── Module mocks ──────────────────────────────────────────────────────────────

// Stub out AddressBook — it makes its own queries and is not under test here.
vi.mock("@/components/storefront/AddressBook", () => ({
  default: () => <div data-testid="stub-address-book" />,
}));

// Stub toast so we don't need a Toaster provider in the tree.
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

// Stub queryClient helpers imported by AccountView
vi.mock("@/lib/queryClient", () => ({
  queryClient: { invalidateQueries: vi.fn() },
  apiRequest: vi.fn().mockResolvedValue({}),
}));

// Control the auth state via this mock
const mockUseAuth = vi.fn();
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => mockUseAuth(),
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeUser(overrides: Record<string, unknown> = {}) {
  return {
    id: "user-1",
    email: "test@example.com",
    firstName: "Alice",
    lastName: "Smith",
    emailVerified: false,
    profileImageUrl: null,
    mobile: null,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function renderAccountView() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <AccountView />
    </QueryClientProvider>,
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("AccountView — unverified-email banner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default fetch stub — overridden per test when needed.
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      }),
    );
  });

  it("shows the banner when emailVerified is false", () => {
    mockUseAuth.mockReturnValue({
      user: makeUser({ emailVerified: false }),
      isAuthenticated: true,
    });

    renderAccountView();

    expect(
      screen.getByTestId("banner-unverified-email"),
    ).toBeInTheDocument();
  });

  it("hides the banner when emailVerified is true", () => {
    mockUseAuth.mockReturnValue({
      user: makeUser({ emailVerified: true }),
      isAuthenticated: true,
    });

    renderAccountView();

    expect(
      screen.queryByTestId("banner-unverified-email"),
    ).not.toBeInTheDocument();
  });

  it("Resend button becomes disabled with countdown text after a successful send", async () => {
    mockUseAuth.mockReturnValue({
      user: makeUser({ emailVerified: false }),
      isAuthenticated: true,
    });

    renderAccountView();

    const button = screen.getByTestId("button-resend-verification");

    // Button is initially enabled
    expect(button).not.toBeDisabled();

    await userEvent.click(button);

    // After a successful response the 60-second cooldown kicks in —
    // the button must be disabled and show the countdown label.
    await waitFor(() => {
      expect(button).toBeDisabled();
    });

    expect(button.textContent).toMatch(/resend in \d+s/i);
  });

  it("clicking Resend calls POST /api/auth/resend-verification-email", async () => {
    mockUseAuth.mockReturnValue({
      user: makeUser({ emailVerified: false }),
      isAuthenticated: true,
    });

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
    vi.stubGlobal("fetch", mockFetch);

    renderAccountView();

    await userEvent.click(screen.getByTestId("button-resend-verification"));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/auth/resend-verification-email",
        expect.objectContaining({ method: "POST" }),
      );
    });
  });
});
