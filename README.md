# OpenTrustClaims 


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

