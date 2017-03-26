# Substitutions

This repository provides a nodejs server downloading substitutions from *.edupage.org sites and presenting them on mobile-friendly website and sending them on Messenger.

## Configuring

How to configure your server.

### Setting up HTTPS

Your certificates and key should be placed in `./certs/` and named `wsskey.pem` (key), `wsscert.pem` (certificate) and `cacert.pem` (CA certificate).

If you don't have SSL certificates you can generate them for free using [Let's encrypt](https://letsencrypt.org/)

### Config file

You have to add a `config` file to `myModules/`. It contains data necessary to interact with Facebook.

It should look like this:

```javascript
var config = {};
config.clientId = '1xxxxxxxxxxxxxx2'; //App id - displayed in app dashboard on developers.facebook.com
config.url='https://your.url'; //website url
config.appSecret='4xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxc'; //App secret displayed in app dashboard
config.appToken='0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxQ'; //App token - see below
config.webhookToken='WebhookVerificationToken'; //used to verify url of your webhook - more below
config.pageToken='Exxxx...xxxxxxxxxxxxxxxF'; //Page access token - see below
config.adm1='1xxxxxxxxxxxxxx1'; //1st adminitrator messenger id (new message and new user notifications)
config.adm2='1xxxxxxxxxxxxxx8'; //2nd adminitrator messenger id (new message notifications)
module.exports = config; //allow other modules to access your config
```

Read how to [generate app token](https://developers.facebook.com/docs/facebook-login/access-tokens#apptokens).

Read how to [setup a webhook](https://developers.facebook.com/docs/messenger-platform/guides/setup#webhook_setup) and [get a page access token](https://developers.facebook.com/docs/messenger-platform/guides/setup#page_access_token).

### Dependencies

Run `npm install` to install all required modules.

## Sterting

To start a server (listening on port 8080) run `node index.js` or `npm start`.

## License

See the [LICENSE](LICENSE.md) (MIT).
