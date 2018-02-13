# Substitutions

This repository provides a nodejs server downloading substitutions from *.edupage.org sites and presenting them on mobile-friendly website and sending them on Messenger.

## Configuring

How to configure your server.

### Setting up HTTPS

Your certificates and key should be placed in `certs/` and named `wsskey.pem` (key), `wsscert.pem` (certificate) and `cacert.pem` (CA certificate).

If you don't have SSL certificates you can generate them for free using [Let's encrypt](https://letsencrypt.org/)

### Config file

You have to add a `config` file to `myModules/`. It contains data necessary to interact with Facebook.

It should look like this:

```javascript
var config = {};
config.clientId = '1xxxxxxxxxxxxxx2'; //App id - displayed in app dashboard on developers.facebook.com
config.url='https://your.url'; //website url (main, used to interact with Facebook)
config.appSecret='4xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxc'; //App secret displayed in app dashboard
config.appToken='0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxQ'; //App token - see below
config.webhookToken='WebhookVerificationToken'; //used to verify url of your webhook - more below
config.pageToken='Exxxx...xxxxxxxxxxxxxxxF'; //Page access token - see below
config.adm1='1xxxxxxxxxxxxxx1'; //1st adminitrator messenger id (new message and new user notifications)
config.adm2='1xxxxxxxxxxxxxx8'; //2nd adminitrator messenger id (new message notifications)
config.pageId = '5xxxxxxxxxxx5'; //Page id as which bot responds (can be found on https://findmyfbid.com/)
module.exports = config; //allow other modules to access your config
```

Read how to [generate app token](https://developers.facebook.com/docs/facebook-login/access-tokens#apptokens).

Read how to [setup a webhook](https://developers.facebook.com/docs/messenger-platform/guides/setup#webhook_setup) and [get a page access token](https://developers.facebook.com/docs/messenger-platform/guides/setup#page_access_token).

### Dependencies

To install all required modules run:
```bash
$ npm install
```

## Starting

To start a server (listening on port 8080) run:
```bash
$ node index.js
```
or 
```bash
$ npm start
```

## License

See the [LICENSE](LICENSE.md) (MIT).

## Facebook docs

Facebook login [datasheet](https://developers.facebook.com/docs/facebook-login/web).

Messenger [bot](https://developers.facebook.com/docs/messenger-platform).
