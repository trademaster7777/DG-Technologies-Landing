import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const proxyMock = vi.fn();
vi.mock("@replit/connectors-sdk", () => ({
  ReplitConnectors: class {
    proxy = proxyMock;
  },
}));

const { sendLeadNotification } = await import("./mailer");

const baseLead = {
  id: 1,
  name: "Jane",
  email: "jane@example.com",
  phone: "555-0000",
  businessName: null,
  packageInterest: null,
  message: null,
};

function okResponse(id = "abc123") {
  return {
    ok: true,
    json: async () => ({ id }),
    text: async () => "",
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.LEAD_NOTIFY_EMAIL = "owner@example.com";
  proxyMock.mockResolvedValue(okResponse());
});

afterEach(() => {
  delete process.env.LEAD_NOTIFY_EMAIL;
  vi.useRealTimers();
});

describe("sendLeadNotification", () => {
  it("returns null without calling Resend when LEAD_NOTIFY_EMAIL is unset", async () => {
    delete process.env.LEAD_NOTIFY_EMAIL;
    await expect(sendLeadNotification(baseLead)).resolves.toBeNull();
    expect(proxyMock).not.toHaveBeenCalled();
  });

  it("HTML-escapes attacker-controlled name and message fields", async () => {
    await sendLeadNotification({
      ...baseLead,
      name: `<img src=x onerror=alert(1)>`,
      message: `<script>steal()</script> & "quotes" 'apos'`,
    });

    expect(proxyMock).toHaveBeenCalledTimes(1);
    const body = proxyMock.mock.calls[0]![2].body as { html: string };
    const html = body.html;

    // No raw attacker markup survives in the HTML body
    expect(html).not.toContain("<img src=x");
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;img src=x onerror=alert(1)&gt;");
    expect(html).toContain("&lt;script&gt;steal()&lt;/script&gt;");
    expect(html).toContain("&amp;");
    expect(html).toContain("&quot;quotes&quot;");
    expect(html).toContain("&#39;apos&#39;");
  });

  it("throws when the Resend API responds with an error status", async () => {
    proxyMock.mockResolvedValue({
      ok: false,
      status: 422,
      text: async () => "invalid from address",
      json: async () => ({}),
    });

    await expect(sendLeadNotification(baseLead)).rejects.toThrow(
      /Resend API error 422/,
    );
  });

  it("rejects with a timeout error when Resend never responds", async () => {
    vi.useFakeTimers();
    proxyMock.mockReturnValue(new Promise(() => {})); // never settles

    const promise = sendLeadNotification(baseLead);
    const assertion = expect(promise).rejects.toThrow(/timed out after 8000ms/);
    await vi.advanceTimersByTimeAsync(8_001);
    await assertion;
  });
});
