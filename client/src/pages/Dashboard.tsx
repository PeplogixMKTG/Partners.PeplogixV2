import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { type FormEvent, useCallback, useEffect, useState } from "react";

type Asset = {
  id: string;
  name: string;
  type: string;
  size: number;
};

type InquirySummary = {
  id: string;
  company: string;
  name: string;
  email: string;
  partnerships: string[];
  submittedAt: string;
};

type InquiryDetail = {
  id: string;
  data: Record<string, unknown>;
  logo: Asset | null;
  assets: Asset[];
  submittedAt: string;
};

const styles = `
.dashboard-page { min-height: 100vh; background: #f7f8f6; color: #003F6A; font-family: Geist, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
.dashboard-shell { width: min(1440px, calc(100% - 40px)); margin: 0 auto; padding: 30px 0 56px; }
.dashboard-header { display: flex; align-items: center; justify-content: space-between; gap: 24px; padding: 0 0 24px; border-bottom: 1px solid #d9dfdf; }
.dashboard-brand { display: flex; align-items: center; gap: 15px; min-width: 0; }
.dashboard-brand img { width: 168px; height: auto; max-height: 48px; object-fit: contain; object-position: left center; }
.dashboard-eyebrow { margin: 0 0 3px; color: #003F6A; font-size: 11px; font-weight: 800; letter-spacing: .15em; text-transform: uppercase; }
.dashboard-title { margin: 0; color: #003F6A; font-size: clamp(22px, 3vw, 31px); font-weight: 720; letter-spacing: -.04em; }
.dashboard-user { display: flex; align-items: center; gap: 12px; font-size: 13px; color: #536070; white-space: nowrap; }
.dashboard-user strong { display: block; color: #003F6A; font-size: 13px; }
.dashboard-user span { display: block; font-size: 11px; color: #003F6A; font-weight: 750; letter-spacing: .08em; text-transform: uppercase; }
.dashboard-button { appearance: none; border: 1px solid transparent; border-radius: 7px; padding: 10px 14px; background: #D8603D; color: #fff; cursor: pointer; font: inherit; font-size: 13px; font-weight: 750; line-height: 1.1; transition: background .18s ease, transform .18s ease, box-shadow .18s ease; }
.dashboard-button:hover:not(:disabled) { background: #b85440; transform: translateY(-1px); box-shadow: 0 5px 13px rgba(204,98,76,.18); }
.dashboard-button:focus-visible, .dashboard-row:focus-visible { outline: 3px solid rgba(0,63,106,.35); outline-offset: 2px; }
.dashboard-button:disabled { cursor: wait; opacity: .62; }
.dashboard-button--quiet { padding: 8px 11px; border-color: #cbd5d5; background: #fff; color: #003F6A; }
.dashboard-button--quiet:hover:not(:disabled) { background: #edf6f5; box-shadow: none; }
.dashboard-button--small { padding: 7px 10px; font-size: 12px; }
.dashboard-grid { display: grid; grid-template-columns: minmax(330px, .9fr) minmax(0, 1.45fr); gap: 22px; margin-top: 28px; }
.dashboard-panel { min-width: 0; border: 1px solid #d9dfdf; border-radius: 11px; background: #fff; box-shadow: 0 12px 35px rgba(0,63,106,.055); }
.dashboard-panel__heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 18px; padding: 20px 22px 16px; border-bottom: 1px solid #e6ebeb; }
.dashboard-panel__heading h2 { margin: 0; font-size: 17px; letter-spacing: -.02em; }
.dashboard-panel__heading p { margin: 4px 0 0; color: #687582; font-size: 12px; line-height: 1.45; }
.dashboard-count { display: inline-flex; align-items: center; justify-content: center; min-width: 27px; height: 27px; border-radius: 999px; background: #e5f1f0; color: #003F6A; font-size: 12px; font-weight: 800; }
.dashboard-list { max-height: calc(100vh - 204px); overflow: auto; }
.dashboard-row { display: block; width: 100%; padding: 17px 22px; border: 0; border-bottom: 1px solid #edf0f0; background: transparent; color: inherit; cursor: pointer; text-align: left; font: inherit; transition: background .16s ease, border-left-color .16s ease; border-left: 3px solid transparent; }
.dashboard-row:hover { background: #f7fbfb; }
.dashboard-row[aria-current="true"] { border-left-color: #003F6A; background: #f1f8f7; }
.dashboard-row__top { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
.dashboard-row__company { overflow: hidden; text-overflow: ellipsis; color: #003F6A; font-size: 14px; font-weight: 780; white-space: nowrap; }
.dashboard-row__date { flex: 0 0 auto; color: #71808b; font-size: 11px; }
.dashboard-row__contact { margin-top: 4px; overflow: hidden; color: #536070; font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
.dashboard-chips { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 10px; }
.dashboard-chip { display: inline-block; max-width: 100%; overflow: hidden; padding: 4px 7px; border: 1px solid #b9d9d5; border-radius: 4px; color: #176b76; font-size: 10px; font-weight: 700; line-height: 1.15; text-overflow: ellipsis; white-space: nowrap; }
.dashboard-empty { display: grid; min-height: 340px; place-items: center; padding: 34px; color: #64727e; font-size: 14px; line-height: 1.55; text-align: center; }
.dashboard-empty strong { display: block; margin-bottom: 6px; color: #003F6A; font-size: 16px; }
.dashboard-message { margin: 22px 0 0; padding: 12px 15px; border-radius: 7px; border: 1px solid #f0c4ba; background: #fff6f3; color: #963d2d; font-size: 13px; line-height: 1.45; }
.dashboard-detail { padding: 22px; }
.dashboard-detail__intro { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding-bottom: 20px; border-bottom: 1px solid #e6ebeb; }
.dashboard-detail__intro h2 { margin: 0; font-size: 23px; letter-spacing: -.035em; }
.dashboard-detail__intro p { margin: 5px 0 0; color: #667480; font-size: 12px; }
.dashboard-section { padding: 20px 0; border-bottom: 1px solid #e9eeee; }
.dashboard-section:last-child { padding-bottom: 0; border-bottom: 0; }
.dashboard-section h3 { margin: 0 0 12px; color: #003F6A; font-size: 11px; font-weight: 850; letter-spacing: .14em; text-transform: uppercase; }
.dashboard-fields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 11px 18px; margin: 0; }
.dashboard-field { min-width: 0; }
.dashboard-field dt { margin: 0 0 4px; color: #6a7782; font-size: 10px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
.dashboard-field dd { margin: 0; overflow-wrap: anywhere; color: #17204d; font-size: 13px; line-height: 1.45; white-space: pre-wrap; }
.dashboard-files { display: grid; gap: 8px; }
.dashboard-file { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 11px 12px; border: 1px solid #dce5e5; border-radius: 7px; background: #fbfcfc; }
.dashboard-file__name { overflow: hidden; color: #003F6A; font-size: 13px; font-weight: 720; text-overflow: ellipsis; white-space: nowrap; }
.dashboard-file__meta { margin-top: 3px; color: #73808b; font-size: 11px; }
.dashboard-status { display: inline-flex; align-items: center; gap: 7px; color: #5e6d78; font-size: 13px; }
.dashboard-status::before { width: 8px; height: 8px; border: 2px solid #003F6A; border-right-color: transparent; border-radius: 50%; content: ""; animation: dashboard-spin .8s linear infinite; }
.dashboard-auth { display: grid; min-height: 100vh; place-items: center; padding: 20px; background: #f7f8f6; font-family: Geist, ui-sans-serif, system-ui, sans-serif; }
.dashboard-auth__card { width: min(440px, 100%); padding: 38px; border: 1px solid #d9dfdf; border-radius: 12px; background: #fff; box-shadow: 0 18px 48px rgba(0,63,106,.09); text-align: center; }
.dashboard-auth__card img { width: 184px; height: auto; margin-bottom: 26px; }
.dashboard-auth__card h1 { margin: 0; color: #003F6A; font-size: 27px; letter-spacing: -.04em; }
.dashboard-auth__card p { margin: 12px 0 24px; color: #64727e; font-size: 14px; line-height: 1.6; }
.dashboard-auth__form { display: grid; gap: 12px; text-align: left; }
.dashboard-auth__form label { display: grid; gap: 6px; color: #536070; font-size: 12px; font-weight: 700; }
.dashboard-auth__form input { width: 100%; box-sizing: border-box; border: 1px solid #bfcaca; border-radius: 7px; padding: 11px 12px; color: #003F6A; font: inherit; letter-spacing: .03em; }
.dashboard-auth__form input:focus { border-color: #003F6A; outline: 3px solid rgba(0,63,106,.18); }
.dashboard-auth__actions { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-top: 18px; }
@keyframes dashboard-spin { to { transform: rotate(360deg); } }
@media (max-width: 900px) { .dashboard-grid { grid-template-columns: 1fr; } .dashboard-list { max-height: 430px; } }
@media (max-width: 640px) { .dashboard-shell { width: min(100% - 26px, 1440px); padding-top: 18px; } .dashboard-header { align-items: flex-start; } .dashboard-user strong, .dashboard-user span { display: none; } .dashboard-brand img { width: 132px; } .dashboard-grid { margin-top: 16px; gap: 14px; } .dashboard-panel__heading, .dashboard-detail { padding-left: 16px; padding-right: 16px; } .dashboard-row { padding-left: 16px; padding-right: 16px; } .dashboard-fields { grid-template-columns: 1fr; } }
`;

function getAuthHeaders(): HeadersInit {
  try {
    const previewToken = sessionStorage.getItem("manus-cookie");
    return previewToken ? { Authorization: `Bearer ${previewToken}` } : {};
  } catch {
    return {};
  }
}

async function apiFetch<T>(path: string): Promise<T> {
  const response = await fetch(path, {
    credentials: "include",
    cache: "no-store",
    headers: { Accept: "application/json", ...getAuthHeaders() },
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error || `Request failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}

async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(path, {
    method: "POST",
    credentials: "include",
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const responseBody = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(
      responseBody?.error || `Request failed (${response.status})`
    );
  }
  return response.json() as Promise<T>;
}

function displayDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Unknown date"
    : new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
}

function fileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function humanLabel(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, character => character.toUpperCase());
}

function displayValue(value: unknown): string {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "string") return value || "—";
  return value == null ? "—" : String(value);
}

function DetailFields({ data }: { data: Record<string, unknown> }) {
  const grouped = [
    [
      "Business information",
      [
        "company",
        "firstName",
        "lastName",
        "email",
        "phone",
        "hasWebsite",
        "website",
        "businessTypes",
        "businessOther",
      ],
    ],
    [
      "Partnership preferences",
      [
        "partnerships",
        "partnershipOther",
        "products",
        "monthlyVolume",
        "needs",
      ],
    ],
    [
      "Brand customization",
      [
        "primaryColor",
        "secondaryColor",
        "accentColor",
        "colorsNotFinal",
        "brandingInstructions",
      ],
    ],
    [
      "Storefront & fulfillment",
      [
        "storefrontType",
        "ownsDomain",
        "domain",
        "migration",
        "migrationUrl",
        "features",
        "featuresOther",
        "dropshipMode",
        "ecommerce",
        "platform",
        "fulfillmentServices",
        "fulfillmentOther",
        "ownInventory",
        "purchaseMode",
        "initialSize",
      ],
    ],
  ];

  return (
    <>
      {grouped.map(([title, keys]) => {
        const visible = (keys as string[]).filter(
          key => data[key] !== undefined && displayValue(data[key]) !== "—"
        );
        if (!visible.length) return null;
        return (
          <section className="dashboard-section" key={title as string}>
            <h3>{title}</h3>
            <dl className="dashboard-fields">
              {visible.map(key => (
                <div className="dashboard-field" key={key}>
                  <dt>{humanLabel(key)}</dt>
                  <dd>{displayValue(data[key])}</dd>
                </div>
              ))}
            </dl>
          </section>
        );
      })}
    </>
  );
}

export default function Dashboard() {
  const { user, loading, logout, refresh } = useAuth();
  const [inquiries, setInquiries] = useState<InquirySummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<InquiryDetail | null>(null);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activationCode, setActivationCode] = useState("");
  const [activating, setActivating] = useState(false);
  const [activationError, setActivationError] = useState<string | null>(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginPending, setLoginPending] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const authMode = window.__MANUS_CONFIG__?.authMode ?? "manus";

  const loadList = useCallback(async () => {
    setLoadingList(true);
    setError(null);
    try {
      const results = await apiFetch<InquirySummary[]>(
        "/api/partner/inquiries"
      );
      setInquiries(results);
      if (selectedId && !results.some(result => result.id === selectedId)) {
        setSelectedId(null);
        setDetail(null);
      }
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Unable to load inquiries"
      );
    } finally {
      setLoadingList(false);
    }
  }, [selectedId]);

  const selectInquiry = useCallback(async (id: string) => {
    setSelectedId(id);
    setDetail(null);
    setLoadingDetail(true);
    setError(null);
    try {
      const result = await apiFetch<InquiryDetail>(
        `/api/partner/inquiries/${encodeURIComponent(id)}`
      );
      setDetail(result);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Unable to load this inquiry"
      );
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  const downloadAsset = useCallback(async (asset: Asset) => {
    setDownloadingId(asset.id);
    setError(null);
    try {
      const response = await fetch(
        `/api/partner/assets/${encodeURIComponent(asset.id)}`,
        {
          credentials: "include",
          cache: "no-store",
          headers: getAuthHeaders(),
        }
      );
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(body?.error || "Unable to download this asset");
      }
      const url = URL.createObjectURL(await response.blob());
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = asset.name;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to download this asset"
      );
    } finally {
      setDownloadingId(null);
    }
  }, []);

  const activate = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setActivating(true);
      setActivationError(null);
      try {
        await apiPost<{ success: true }>("/api/partner/admin/activate", {
          code: activationCode.trim(),
        });
        setActivationCode("");
        await refresh();
      } catch (caught) {
        setActivationError(
          caught instanceof Error
            ? caught.message
            : "Unable to activate administrator access"
        );
      } finally {
        setActivating(false);
      }
    },
    [activationCode, refresh]
  );

  const passwordLogin = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setLoginPending(true);
      setLoginError(null);
      try {
        await apiPost<{ success: true }>("/api/admin/login", {
          email: loginEmail.trim(),
          password: loginPassword,
        });
        setLoginPassword("");
        await refresh();
      } catch (caught) {
        setLoginError(
          caught instanceof Error
            ? caught.message
            : "Unable to sign in securely."
        );
      } finally {
        setLoginPending(false);
      }
    },
    [loginEmail, loginPassword, refresh]
  );

  useEffect(() => {
    if (user?.role === "admin") void loadList();
  }, [loadList, user?.role]);

  if (loading) {
    return (
      <main className="dashboard-auth">
        <style>{styles}</style>
        <div className="dashboard-status">Checking your secure session</div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="dashboard-auth">
        <style>{styles}</style>
        <section
          className="dashboard-auth__card"
          aria-labelledby="dashboard-signin-title"
        >
          <img src="/brand/peplogix-logo.webp" alt="Peplogix" />
          <h1 id="dashboard-signin-title">Partner inquiries</h1>
          <p>
            Sign in with your authorized Peplogix account to review confidential
            partner submissions and brand assets.
          </p>
          {authMode === "password" ? (
            <form
              className="dashboard-auth__form"
              onSubmit={event => void passwordLogin(event)}
            >
              <label htmlFor="dashboard-admin-email">
                Email
                <input
                  id="dashboard-admin-email"
                  type="email"
                  autoComplete="username"
                  value={loginEmail}
                  onChange={event => setLoginEmail(event.target.value)}
                  required
                />
              </label>
              <label htmlFor="dashboard-admin-password">
                Password
                <input
                  id="dashboard-admin-password"
                  type="password"
                  autoComplete="current-password"
                  value={loginPassword}
                  onChange={event => setLoginPassword(event.target.value)}
                  required
                />
              </label>
              {loginError && (
                <p className="dashboard-message" role="alert">
                  {loginError}
                </p>
              )}
              <button
                className="dashboard-button"
                type="submit"
                disabled={loginPending || !loginEmail.trim() || !loginPassword}
              >
                {loginPending ? "Signing in…" : "Sign in securely"}
              </button>
            </form>
          ) : authMode === "manus" ? (
            <button
              className="dashboard-button"
              type="button"
              onClick={() => startLogin()}
            >
              Sign in securely
            </button>
          ) : (
            <p className="dashboard-message" role="alert">
              Dashboard access has not been configured. Set the admin
              environment variables described in the deployment README.
            </p>
          )}
        </section>
      </main>
    );
  }

  if (user.role !== "admin") {
    return (
      <main className="dashboard-auth">
        <style>{styles}</style>
        <section
          className="dashboard-auth__card"
          aria-labelledby="dashboard-denied-title"
        >
          <img src="/brand/peplogix-logo.webp" alt="Peplogix" />
          <h1 id="dashboard-denied-title">Access restricted</h1>
          <p>
            Your account is authenticated but has not been granted administrator
            access to partner inquiries. Enter the one-time activation code
            provided by Peplogix.
          </p>
          <form
            className="dashboard-auth__form"
            onSubmit={event => void activate(event)}
          >
            <label htmlFor="dashboard-activation-code">
              Activation code
              <input
                id="dashboard-activation-code"
                type="text"
                value={activationCode}
                onChange={event => setActivationCode(event.target.value)}
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                required
              />
            </label>
            {activationError && (
              <p className="dashboard-message" role="alert">
                {activationError}
              </p>
            )}
            <button
              className="dashboard-button"
              type="submit"
              disabled={activating || !activationCode.trim()}
            >
              {activating ? "Activating…" : "Activate access"}
            </button>
          </form>
          <div className="dashboard-auth__actions">
            <span />
            <button
              className="dashboard-button dashboard-button--quiet"
              type="button"
              onClick={() => void logout()}
            >
              Sign out
            </button>
          </div>
        </section>
      </main>
    );
  }

  const assets = detail
    ? [...(detail.logo ? [detail.logo] : []), ...detail.assets]
    : [];

  return (
    <main className="dashboard-page">
      <style>{styles}</style>
      <div className="dashboard-shell">
        <header className="dashboard-header">
          <div className="dashboard-brand">
            <img src="/brand/peplogix-logo.webp" alt="Peplogix" />
            <div>
              <p className="dashboard-eyebrow">Internal workspace</p>
              <h1 className="dashboard-title">Partner inquiries</h1>
            </div>
          </div>
          <div className="dashboard-user">
            <div>
              <strong>{user.name || user.email || "Administrator"}</strong>
              <span>Administrator</span>
            </div>
            <button
              className="dashboard-button dashboard-button--quiet dashboard-button--small"
              type="button"
              onClick={() => void logout()}
            >
              Sign out
            </button>
          </div>
        </header>

        {error && (
          <p className="dashboard-message" role="alert">
            {error}
          </p>
        )}

        <div className="dashboard-grid">
          <section
            className="dashboard-panel"
            aria-labelledby="inquiry-list-title"
          >
            <div className="dashboard-panel__heading">
              <div>
                <h2 id="inquiry-list-title">Submissions</h2>
                <p>Confidential, newest first.</p>
              </div>
              <div
                className="dashboard-count"
                aria-label={`${inquiries.length} submissions`}
              >
                {inquiries.length}
              </div>
            </div>
            {loadingList ? (
              <div className="dashboard-empty">
                <span className="dashboard-status">Loading submissions</span>
              </div>
            ) : inquiries.length ? (
              <div className="dashboard-list">
                {inquiries.map(inquiry => (
                  <button
                    className="dashboard-row"
                    type="button"
                    key={inquiry.id}
                    aria-current={
                      selectedId === inquiry.id ? "true" : undefined
                    }
                    onClick={() => void selectInquiry(inquiry.id)}
                  >
                    <span className="dashboard-row__top">
                      <span className="dashboard-row__company">
                        {inquiry.company}
                      </span>
                      <span className="dashboard-row__date">
                        {displayDate(inquiry.submittedAt)}
                      </span>
                    </span>
                    <span className="dashboard-row__contact">
                      {inquiry.name} · {inquiry.email}
                    </span>
                    <span className="dashboard-chips">
                      {inquiry.partnerships.map(partnership => (
                        <span className="dashboard-chip" key={partnership}>
                          {partnership}
                        </span>
                      ))}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="dashboard-empty">
                <div>
                  <strong>No submissions yet</strong>New partner inquiries will
                  appear here after they are submitted.
                </div>
              </div>
            )}
          </section>

          <section
            className="dashboard-panel"
            aria-live="polite"
            aria-label="Inquiry details"
          >
            {!selectedId ? (
              <div className="dashboard-empty">
                <div>
                  <strong>Select a submission</strong>Choose an inquiry to
                  review its information and protected brand files.
                </div>
              </div>
            ) : loadingDetail ? (
              <div className="dashboard-empty">
                <span className="dashboard-status">
                  Loading confidential details
                </span>
              </div>
            ) : detail ? (
              <article className="dashboard-detail">
                <div className="dashboard-detail__intro">
                  <div>
                    <h2>{displayValue(detail.data.company)}</h2>
                    <p>Submitted {displayDate(detail.submittedAt)}</p>
                  </div>
                  <button
                    className="dashboard-button dashboard-button--quiet dashboard-button--small"
                    type="button"
                    onClick={() => void selectInquiry(detail.id)}
                  >
                    Refresh
                  </button>
                </div>
                <DetailFields data={detail.data} />
                <section className="dashboard-section">
                  <h3>Protected files</h3>
                  {assets.length ? (
                    <div className="dashboard-files">
                      {assets.map(asset => (
                        <div className="dashboard-file" key={asset.id}>
                          <div>
                            <div className="dashboard-file__name">
                              {asset.name}
                              {detail.logo?.id === asset.id ? " · Logo" : ""}
                            </div>
                            <div className="dashboard-file__meta">
                              {asset.type} · {fileSize(asset.size)}
                            </div>
                          </div>
                          <button
                            className="dashboard-button dashboard-button--quiet dashboard-button--small"
                            type="button"
                            disabled={downloadingId === asset.id}
                            onClick={() => void downloadAsset(asset)}
                          >
                            {downloadingId === asset.id
                              ? "Preparing…"
                              : "Download"}
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="dashboard-file__meta">
                      No files were attached to this inquiry.
                    </p>
                  )}
                </section>
              </article>
            ) : (
              <div className="dashboard-empty">
                <div>
                  <strong>Details unavailable</strong>Select the submission
                  again or refresh the list.
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
