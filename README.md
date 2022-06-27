# OpenTrustClaims Demo

See [Use Cases](https://docs.google.com/document/d/1iWRypT4aHS67MJhuCZj7e5gzcCr3HuKG0lO0g045ueY/edit) and related docs

To enter data, visit http://trustclaims.whatscookin.us

To deploy latest code, pull directly on server

```
ssh -l ubuntu -i [key] trustclaims.whatscookin.us
cd /home/ubuntu/trust_claim
git pull
npm run build
cp -r ./ /var/www/trust_claim/
```
TODO: ci pipeline
