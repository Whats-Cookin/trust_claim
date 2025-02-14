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


## DEPLOYING to PRODUCTION
```
ssh -i [key] ubuntu@68.183.144.184
nvm use 20
cd /data/trust_claim
git pull
yarn && yarn build
cd /data/trust_claim/dist
cp -r ./ /var/www/trust_claim/
```
This deploys to [dev.linkedtrust.us](dev.linkedtrust.us)*

## Information About Our Server

See [Use Cases](https://docs.google.com/document/d/1iWRypT4aHS67MJhuCZj7e5gzcCr3HuKG0lO0g045ueY/edit) and related docs

To enter test data, visit the dev version [linkedtrust Dev](https://dev.linkedtrust.us)

<a name="test, build and deploy"></a> The frontend is fully working with Jenkins CI/CD Integration for the develop branch, deployin to https://dev.linkedtrust.us

The logs can be found on [jenkins last build](http://68.183.144.184:8080/job/Trustclaim_frontend/lastBuild/)
And for Auth Details to the pipeline, kindly refer to vault [jenkins logins](https://vault.whatscookin.us/app/passwords/view/63d7e1a5-0fab-45a6-b880-cd55530d7d1d), this creds would help you to gain access into the CI/CD pipeline and figure out why the test didn't run as it should, and also review the console outputs to figure out what the issue might be.

For SSH Access into the dev server, kindly refer to this creds in the vault [dev server ssh creds](https://vault.whatscookin.us/app/passwords/view/cbe52954-3f7a-4e5d-9bb7-039389acc42c) this would help you ssh into the dev server

