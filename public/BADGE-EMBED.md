# LinkedTrust Embeddable Badge

A framework-agnostic web component for embedding LinkedTrust claim badges on any website. No React, no npm, no build step.

## For site owners embedding badges

Add this to your HTML:

```html
<script src="https://linkedtrust.us/badge.js"></script>

<linked-badge claim-id="124443"></linked-badge>
```

### Options

| Attribute | Default | Description |
|-----------|---------|-------------|
| `claim-id` | (required) | Numeric claim ID |
| `theme` | `light` | `light` or `dark` |
| `compact` | — | Add for smaller 320px variant |
| `api-base` | `https://live.linkedtrust.us` | Override API URL |

### Examples

```html
<!-- Basic -->
<linked-badge claim-id="124443"></linked-badge>

<!-- Dark theme, compact -->
<linked-badge claim-id="124443" theme="dark" compact></linked-badge>

<!-- Multiple badges -->
<linked-badge claim-id="124443"></linked-badge>
<linked-badge claim-id="124445"></linked-badge>
```

### How it works

- Fetches claim data from the public LinkedTrust API (`live.linkedtrust.us`)
- Renders inside Shadow DOM (no CSS conflicts with your site)
- Shows: video (if attached), star rating, statement, endorser name + link, and a link to the full claim on LinkedTrust
- Zero dependencies, ~10KB

## Deployment

The files live in `public/` and are served as static assets by Vite in prod:

```
public/badge.js          ← the web component
public/badge-demo.html   ← demo/test page
public/BADGE-EMBED.md    ← this file
```

After deploying the trust_claim frontend:

- `badge.js` is available at `https://linkedtrust.us/badge.js`
- Demo page at `https://linkedtrust.us/badge-demo.html`

### Deploy steps

1. Pull latest on the prod server
2. Build: `yarn build` (Vite copies `public/` contents to `dist/`)
3. Restart/redeploy the frontend as usual

No special config needed — Vite serves everything in `public/` as static files at the root path.
