# OpenTrustClaims 

## Embeddable web components

Drop LinkedTrust claims into any site — no React, no build step. One script tag,
one element. Source lives in [`public/`](public/); served from
`https://demos.linkedtrust.us/embed/`.

**Badge** — a claim as a verified card or row (what you see at
[live.linkedtrust.us/badge/124713](https://live.linkedtrust.us/badge/124713);
every badge page has copy-paste embed buttons):

```html
<script src="https://demos.linkedtrust.us/embed/badge.js" defer></script>
<linked-badge claim-id="124713" layout="row"></linked-badge>
```

Attributes: `claim-id` (required) · `layout` "card" | "row" · `theme` "light" | "dark"
· `compact` · `api-base` (default `https://live.linkedtrust.us`).

**Video recorder** — record-and-upload with live self-view, retake, and progress;
uploads to `/api/video/upload` and emits `video-uploaded {videoUrl}`:

```html
<script src="https://demos.linkedtrust.us/embed/video-recorder.js" defer></script>
<linked-video-recorder api-base="https://live.linkedtrust.us" max-duration="60"></linked-video-recorder>
```

Attributes: `api-base` (required) · `max-duration` seconds · `video-url` (mount
already-attached). Events: `video-uploaded`, `video-removed`.

**Claims feed** (`claims-feed.js`, `<linked-claims-feed>`) and **ATProto claims**
(`atproto-claims.js`, `<linked-claims-atproto>`) follow the same pattern — see the
usage header in each file.

Prefer an iframe? Every claim also has a bare embed page at
`https://live.linkedtrust.us/embed/<claim-id>`.



## TO RUN LOCALLY

### USING TERMINAL COMMANDS

```bash
git clone https://github.com/Whats-Cookin/trust_claim.git
cd trust_claim
yarn dev
```

and connect to `localhost:3000`


To run in a new location you must set these environment variables *i.e* inside a `.env` file in the root directory

```bash
VITE_GITHUB_CLIENT_ID=[...]
VITE_BACKEND_BASE_URL=http://localhost:9000
VITE_CERAMIC_URL='http://13.56.165.66/'
```

NB: This is a critical action !!!!
To avoid having to run the back end you may point to the live backend *BUT DO NOT WRITE JUNK TO IT*

```bash
VITE_CERAMIC_URL='https://ceramic.linkedtrust.us/'
VITE_BACKEND_BASE_URL='https://dev.linkedtrust.us'
VITE_DID_PRIVATE_KEY='...'
```


## Dev Server (VM 200 — dev.linkedtrust.us)

Repo is checked out at `/opt/shared/repos/trust_claim/`. Runs as a systemd service in vite dev mode.

**If you're already on the dev server:**

```bash
cd /opt/shared/repos/trust_claim
git pull
sudo systemctl restart tmp-trustclaim-dev-frontend.service
```

**If you're not on the dev server:**

```bash
ssh <your-user>@dev.linkedtrust.us
# then same commands as above
```

Service: `tmp-trustclaim-dev-frontend.service` (vite dev on port 3030)

## Production (VM 508 — live.linkedtrust.us)

CI/CD is not yet set up — deploys are manual.

```bash
ssh ubuntu@10.0.0.158
cd /data/trust_claim
git pull
yarn && yarn build
cp -r dist/ /var/www/trust_claim/
```

