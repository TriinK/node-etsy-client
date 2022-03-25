# node-etsy-client

[![NPM](https://nodei.co/npm/node-etsy-client.png?compact=true)](https://npmjs.org/package/node-etsy-client)

NodeJs Etsy [ReST API](https://www.etsy.com/developers/documentation) Client.

- compatible with JavaScript and TypeScript.

In addition, this library provide an extra [OAuth2Service](./src/OAuth2Service.js) service class useful to manage oAuth2 workflow: to build connect url, handle callback, and manage refresh token.

Have a look into [oauth.js sample](src/sample/oauth.js) to make some oAuth2 manual test.

## EtsyClientV3 - BETA
Features

- findAllShops
- getShop
- findAllShopSections
- findAllShopListingsActive
- getListing
- getVariationImages
- findAllListingImages
- getInventory
- getAttributes
- getProduct
- findAllListingShippingProfileEntries

# Quick start

First declare your api key :
```
export ETSY_API_KEY=xxxxxxxxxxx
```

install node-etsy-client

```
npm install node-etsy-client
```

then let's go, here is a `sample.js`:
```
const EtsyClientV2 = require('node-etsy-client')
async function doIt() {
  var client = new EtsyClientV2();
  var shops = await client.getShops({'shopd_name':'mony', limit':10});
  console.log(shops);
}
doIt();
```
You could play mocha tests to get more examples (cf. next section).

You could avoid using environment variable by using constructor options:
```
var client = new EtsyClientV3({apiKey:'mSecretHere'});
```

## Advanced usage


### Etsy client options
This section describes EtsyClientV2 available options.

Note about options precedence: first take option value from constructor if any, or
else try to retrieve related environment variable, or else apply default value.

- `apiUrl` : Etsy api endpoint - **required** (or env.`ETSY_API_ENDPOINT`) default value is (v2)`https://openapi.etsy.com/v2` / (v3)`https://openapi.etsy.com/v3`.
- `apiKey` : Etsy api key - **required** (or env.`ETSY_API_KEY`) without default value. Ask one from [Etsy portal](https://www.etsy.com/developers/documentation/getting_started/register)
- (v2)`shop`   : Etsy shop name - *optional* (or env.`ETSY_SHOP`) without default value.
- (v3)`shopId` : Etsy shop id - *optional* (or env.`ETSY_SHOP_ID`) without default value.
- `lang`   : Etsy language - *optional* (or env.`ETSY_LANG`) without default value. Example: `fr`
- `etsyRateWindowSizeMs` : Rate limit windows size in milliseconds - *optional* (or env.`ETSY_RATE_WINDOWS_SIZE_MS`) with default value: `1000`
- `etsyRateMaxQueries`   : Rate limit max query per windows size - *optional* (or env.`ETSY_RATE_MAX_QUERIES`) without default value
- `dryMode`              : print call instead of making real etsy call - *optional* (or env.`ETSY_DRY_MODE`) with default value: `false`

Note about rate limit options:

Rate limit is enabled if and only if `etsyRateWindowSizeMs` and `etsyRateMaxQueries` are both set.

This will configure rate limit on etsy call : max `etsyRateMaxQueries` per `etsyRateWindowSizeMs`ms.

For more details, cf. [susi-rali](https://github.com/creharmony/susi-rali)

### Rate limit
According to [their documentation](https://www.etsy.com/developers/documentation/getting_started/api_basics#section_rate_limiting),
Etsy restricts number of call to 10 per second (and 10k per day).

In order to never reach this (second windows) rate limit, node-etsy-client rely on [susi-rali](https://github.com/creharmony/susi-rali)
and offer an option to rate limit client calls.

To apply rate limit of 10 query per seconds (with wait on unavailable slot),
add `etsyRateMaxQueries` option:

```
var client = new EtsyClientV2({apiKey:'mSecretHere', etsyRateMaxQueries:10});
```

## ETSY API versions

| node-etsy-client<br/>version |   Classes    | Etsy API  |
|------------------------------|:------------:|:-----------------|
| &gt;= 1.0.0                  | EtsyClientV3 |               V3 |
| &gt;= 1.0.0                  | EtsyClientV2 |               V2 |
| 0.x.y                        |  EtsyClient  |               V2 |

Starting from 1.0.0-beta node-etsy-client provide an `EtsyClientV3` utility class dedicated to etsy 3 api calls.

For previous version < 1.0.0 (eg. `0.8.2`) node-etsy-client was providing only one utility class called `EtsyClient` which was dedicated to etsy v2 api calls. This class has been renamed into `EtsyClientV2`.

Etsy v2 API will remain unavailable for a given amount of time in 2022 :

- **WARNING** : v2 API will be discontinued : cf Etsy [migration page for more details](https://developers.etsy.com/documentation/migration/index#launch-stages)


### EtsyClientV2 (deprecated)


Features

- findAllShops(shop_name)
- getShop
- getShopSections
- findAllActiveListingsByShop
- getListing
- getListingVariationImages
- getListingImages
- getListingProperty



## How to contribute
You're not a dev ? just submit an issue (bug, improvements, questions). Or else:
* Clone
* Install deps
* setup your test environment (cf. [initEnv.example.sh](./env/initEnv.example.sh))
* Then mocha tests
```
git clone https://github.com/creharmony/node-etsy-client.git
cd node-etsy-client
npm install
# play test without etsy endpoint
npm run test
# play test with etsy endpoint
. ./env/initEnv.example.sh
npm run test
```
* you could also fork, feature branch, then submit a pull request.

### Services or activated bots

| badge  | name   | description  |
|--------|-------|:--------|
| ![CI/CD](https://github.com/creharmony/node-etsy-client/workflows/etsy_client_ci/badge.svg) |Github actions|Continuous tests.
| [![scheduled npm audit](https://github.com/creharmony/node-etsy-client/actions/workflows/audit.yml/badge.svg)](https://github.com/creharmony/node-etsy-client/actions/workflows/audit.yml) |Github actions|Continuous vulnerability audit.
|  |[Houndci](https://houndci.com/)|JavaScript  automated review (configured by `.hound.yml`)|
| [![Automated Release Notes by gren](https://img.shields.io/badge/%F0%9F%A4%96-release%20notes-00B2EE.svg)](https://github-tools.github.io/github-release-notes/)|[gren](https://github.com/github-tools/github-release-notes)|[Release notes](https://github.com/creharmony/node-etsy-client/releases) automation|
<!-- travis disabled
| [![Build Status](https://travis-ci.com/creharmony/node-etsy-client.svg?branch=main)](https://travis-ci.com/creharmony/node-etsy-client) |[Travis-ci](https://travis-ci.com/creharmony/node-etsy-client)|Continuous tests.
-->
