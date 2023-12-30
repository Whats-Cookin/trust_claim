# OpenTrustClaims Demo

See [Use Cases](https://docs.google.com/document/d/1iWRypT4aHS67MJhuCZj7e5gzcCr3HuKG0lO0g045ueY/edit) and related docs

To enter data, visit [pro](http://trustclaims.whatscookin.us)

To deploy latest code, pull directly on server

```bash
ssh -l ubuntu -i [key] trustclaims.whatscookin.us
cd /data/trust_claim
git pull
yarn && yarn build
cd /data/trust_claim/dist
cp -r ./ /var/www/trust_claim/
```

TODO: ci pipeline

To run in a new location you must set these environment variables

```bash
VITE_GITHUB_CLIENT_ID=[...]
VITE_BACKEND_BASE_URL=http://localhost:9000
VITE_CERAMIC_URL='http://13.56.165.66/'
```

To avoid having to run the back end you may point to the live backend BUT DO NOT WRITE JUNK TO IT

```bash
VITE_CERAMIC_URL='https://ceramic.linkedtrust.us/'
VITE_BACKEND_BASE_URL='https://live.linkedtrust.us'
VITE_DID_PRIVATE_KEY='...'   # see vault

```

Then run

`yarn dev`

and connect to localhost:3000

