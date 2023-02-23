# OpenTrustClaims Demo

See [Use Cases](https://docs.google.com/document/d/1iWRypT4aHS67MJhuCZj7e5gzcCr3HuKG0lO0g045ueY/edit) and related docs

To enter data, visit http://trustclaims.whatscookin.us

To deploy latest code, pull directly on server

```
ssh -l ubuntu -i [key] trustclaims.whatscookin.us
cd /home/ubuntu/trust_claim
git pull
npm run build
cd /home/ubuntu/trust_claim/dist
cp -r ./ /var/www/trust_claim/
```
TODO: ci pipeline

To run in a new location you must set these environment variables

```
VITE_GITHUB_CLIENT_ID=[...]
VITE_BACKEND_BASE_URL=http://localhost:9000
```
To avoid having to run the back end you may point to the live backend
```
VITE_BACKEND_BASE_URL=http://ec2-54-177-89-176.us-west-1.compute.amazonaws.com
```

Then run

`npm run dev`

and connect to localhost:3000
