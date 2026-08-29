# Deployment — Dokploy Dev Server

This document describes how the BitMonkeyTech website is deployed to the
self-hosted **Dokploy** server (running on a Hostinger VPS), and how to add
new client dev sites to the same server.

---

## 1. How it fits together

**Dokploy** is a self-hosted PaaS (a Vercel/Netlify/Heroku alternative). It runs
on the VPS as Docker containers and provides a web UI for deploying apps from Git.

| Piece | Role |
|-------|------|
| **Traefik** | Reverse proxy bundled with Dokploy. Every request hits Traefik first; it routes by hostname to the right container and obtains/renews Let's Encrypt TLS certificates. |
| **Project** | Container for one or more Applications, databases, and Compose stacks. |
| **Application** | Points at a Git repo + branch, builds it, runs it as a container, and has Domains attached. |
| **Auto Deploy** | Dokploy's GitHub App installs a webhook on the repo. A push to the configured branch triggers pull → rebuild → redeploy. |

**Deploy trigger for this site:** push to the `dev` branch.

---

## 2. DNS

Managed wherever `bitmonkeytech.com`'s nameservers point (Hostinger hPanel → DNS,
or Cloudflare, etc.).

| Type | Host    | Value          | Purpose |
|------|---------|----------------|---------|
| A    | `dokploy` | `<VPS IP>`    | Reach the Dokploy panel at `dokploy.bitmonkeytech.com`. |
| A    | `*.dev`   | `<VPS IP>`    | Wildcard — **any** `<name>.dev.bitmonkeytech.com` resolves to the server. |

The wildcard record means **no DNS change is needed** when onboarding a new client
dev site. `bitmonkeytech.dev.bitmonkeytech.com` is matched by `*.dev`.

Notes:

- `*.dev` matches exactly one label — covers `x.dev.bitmonkeytech.com`, not
  `a.b.dev.bitmonkeytech.com`.
- Keep TTL low (300s) while making changes.
- **Cloudflare DNS:** set the records to "DNS only" (grey cloud). Orange-cloud
  proxying breaks Let's Encrypt HTTP-01 challenges.
- Verify: `dig +short bitmonkeytech.dev.bitmonkeytech.com` returns the VPS IP.

---

## 3. One-time server setup

### Secure the panel

1. Open `http://<VPS IP>:3000` and create the admin account immediately (first
   visitor owns the instance).
2. **Settings → Server / Web Domain**: set panel domain to
   `dokploy.bitmonkeytech.com`, enable HTTPS + Let's Encrypt, enter a
   notification email, save.
3. Reload at `https://dokploy.bitmonkeytech.com`.

### Connect GitHub

1. **Git → GitHub → Create GitHub App**.
2. Name it (e.g. `dokploy-bitmonkeytech`); it redirects to GitHub.
3. **Install** the app; grant access to the repo(s).
4. **Install & Authorize**. The webhook is configured automatically.

---

## 4. This site's Application

| Setting | Value |
|---------|-------|
| Project | `bitmonkeytech` |
| Application name | `bitmonkeytech-dev` |
| Provider | GitHub → this repo |
| Branch | `dev` (must match exactly, or Dokploy raises "Branch Not Match") |
| Build Type | **Static** (plain HTML/CSS/JS, no build step — served from an nginx container) |
| Publish Directory | `.` (repo root — `index.html` lives there) |
| Auto Deploy | **ON** (General tab) |

### Domain

Application → **Domains → Add Domain**:

| Field | Value |
|-------|-------|
| Host | `bitmonkeytech.dev.bitmonkeytech.com` |
| Container Port | `80` |
| HTTPS | on |
| Certificate | Let's Encrypt |

Because the wildcard DNS record already resolves this exact host to the server,
Traefik completes the HTTP-01 challenge and issues a normal per-host certificate
within a minute. Domain changes on Applications hot-reload — no redeploy needed.

Live at: `https://bitmonkeytech.dev.bitmonkeytech.com`

---

## 5. Day-to-day workflow

1. Work on the `dev` branch.
2. `git push origin dev`.
3. Dokploy auto-rebuilds and redeploys. Watch the **Deployments** tab for logs.

To deploy manually, use the **Deploy** button on the Application.

---

## 6. Adding a new client dev site

1. (Optional) **Create Project** for the client, or reuse an existing one.
2. **Create Service → Application**, name it (e.g. `clientname-dev`).
3. Provider: the client's GitHub repo; Branch: their dev branch.
4. Build Type as appropriate (Static for plain sites; Nixpacks/Dockerfile if
   there's a build step).
5. **Auto Deploy: ON**.
6. **Domains → Add Domain**: `clientname.dev.bitmonkeytech.com`, port `80` (or the
   app's port), HTTPS + Let's Encrypt.

No DNS change is required — the `*.dev` wildcard already covers the new subdomain.

### Automated onboarding

Steps 1–6 are automated by the **`bitmonkey-devops`** Claude Code plugin in the
[`BitMonkey-Tech/ops`](https://github.com/BitMonkey-Tech/ops) repo. It creates
the project, GitHub-wired application (static build, auto-deploy), and HTTPS
domain, then triggers the first deploy — from one command:

```
node onboard.mjs --client "Acme Co" --repo BitMonkey-Tech/acme-website
```

or, in Claude Code, `/onboard-client Acme Co  BitMonkey-Tech/acme-website`.
Setup and usage are in that repo's `README.md`.

---

## 7. Wildcard SSL (not currently needed)

Each Application registers an explicit hostname, and Traefik issues a separate
normal certificate per host via HTTP challenge. No API tokens required.

A true `*.dev.bitmonkeytech.com` wildcard certificate (Let's Encrypt **DNS-01**
challenge) would only be needed if:

- routing subdomains not explicitly registered in Dokploy, or
- hitting Let's Encrypt rate limits (50 certs/week per registered domain), or
- DNS is Cloudflare-proxied (orange cloud), so HTTP challenge cannot work.

That setup requires a DNS-provider API token (e.g. `CF_DNS_API_TOKEN`) added to
Traefik's environment, plus a `dnsChallenge` resolver in
**Settings → Traefik → `traefik.yml`**.

---

## References

- Dokploy — GitHub integration: <https://docs.dokploy.com/docs/core/github>
- Dokploy — Auto Deploy: <https://docs.dokploy.com/docs/core/auto-deploy>
- Dokploy — Domains: <https://docs.dokploy.com/docs/core/domains>
- Dokploy — Going Production: <https://docs.dokploy.com/docs/core/applications/going-production>
- Wildcard subdomain discussion: <https://github.com/Dokploy/dokploy/discussions/2051>
- Wildcard SSL in Dokploy/Traefik: <https://www.naps62.com/posts/wildcard-ssl-in-dokploy>
