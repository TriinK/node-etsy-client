import queryString from 'query-string';
import axios from "axios";
import SusiRali from 'susi-rali';

const DEFAULT_DRY_MODE = false;// DEBUG // if true, then print get onto console instead of calling etsy

/**
 * this utility class implement ETSY (some) methods documented here:
 * https://www.etsy.com/developers/documentation/getting_started/api_basics#reference > API V2 Reference
 **/
class EtsyClientV2 {

  static debug = process.env.ETSY_DEBUG && process.env.ETSY_DEBUG === true;

  constructor(options) {
    if (!options) {
      options = {};
    }
    this.apiUrl = "apiUrl" in options ? options.apiUrl : (process.env.ETSY_API_ENDPOINT || 'https://openapi.etsy.com/v2');
    this.apiTimeoutMs = Number("apiTimeoutMs" in options ? options.apiTimeoutMs : (process.env.ETSY_API_TIMEOUT_MS || '20000'));
    this.apiTimeoutMs = (this.apiTimeoutMs > 1000 && this.apiTimeoutMs < 300000) ? this.apiTimeoutMs : 20000;
    this._assumeApiUrl();
    this.apiKey = "apiKey" in options ? options.apiKey : process.env.ETSY_API_KEY;
    this._assumeApiKey();
    this.shop   = "shop" in options ? options.shop : process.env.ETSY_SHOP;
    this.lang   = "lang" in options ? options.lang : process.env.ETSY_LANG;
    // configure rate limit on etsy call : max <etsyRateMaxQueries> per <etsyRateWindowSizeMs> ms
    // Etsy rate limit doc (10/sec) : https://www.etsy.com/developers/documentation/getting_started/api_basics#section_rate_limiting
    this.etsyRateWindowSizeMs = "etsyRateWindowSizeMs" in options ? options.etsyRateWindowSizeMs : (process.env.ETSY_RATE_WINDOWS_SIZE_MS  || 1000);
    this.etsyRateMaxQueries   = "etsyRateMaxQueries" in options ? options.etsyRateMaxQueries : (process.env.ETSY_RATE_MAX_QUERIES || null);
    this.dryMode              = "dryMode" in options ? options.dryMode : ("true" === process.env.ETSY_DRY_MODE || DEFAULT_DRY_MODE);

    this.initRateLimiter();
    this._axios = axios.create({
      baseURL: this.apiUrl,
      timeout: this.apiTimeoutMs
    });
    // DEBUG // console.debug(`EtsyClientV2 - apiUrl:${this.apiUrl} - dryMode:${this.dryMode} - ${this.limiterDesc}`);
  }

  initRateLimiter() {
    this.limiter = (this.etsyRateWindowSizeMs === null || this.etsyRateMaxQueries === null) ? null :
      new SusiRali({
          windowsMs:this.etsyRateWindowSizeMs,
          maxQueryPerWindow:this.etsyRateMaxQueries,
          debugEnabled: false
      });
    this.limiterDesc = (!this.isRateLimitEnabled()) ? "" : `Rate limit of ${this.etsyRateMaxQueries} queries per ${this.etsyRateWindowSizeMs}ms`;
  }

  isRateLimitEnabled() {
    return this.limiter !== null;
  }

  // https://www.etsy.com/developers/documentation/reference/shop#method_findallshops
  findAllShops(options) {
    return this.limitedEtsyApiFetch(`/shops`, options);
  }

  // https://www.etsy.com/developers/documentation/reference/shop#method_getshop
  getShop(options) {
     this._assumeShop();
     return this.limitedEtsyApiFetch(`/shops/${this.shop}`, options);
  }

  // https://www.etsy.com/developers/documentation/reference/shopsection#method_findallshopsections
  findAllShopSections(options) {
     this._assumeShop();
     return this.limitedEtsyApiFetch(`/shops/${this.shop}/sections`, options);
  }

  // https://www.etsy.com/developers/documentation/reference/listing#method_findallshoplistingsactive
  findAllShopListingsActive(options) {
     this._assumeShop();
     return this.limitedEtsyApiFetch(`/shops/${this.shop}/listings/active`, options);
  }

  // https://www.etsy.com/developers/documentation/reference/listing#method_getlisting
  getListing(listingId, options) {
     this._assumeField('listingId', listingId);
     return this.limitedEtsyApiFetch(`/listings/${listingId}`, options);
  }

  // https://www.etsy.com/developers/documentation/reference/listingvariationimage#method_getvariationimages
  getVariationImages(listingId, options) {
     this._assumeField('listingId', listingId);
     return this.limitedEtsyApiFetch(`/listings/${listingId}/variation-images`, options);
  }

  // https://www.etsy.com/developers/documentation/reference/listingimage#method_findalllistingimages
  findAllListingImages(listingId, options) {
     this._assumeField('listingId', listingId);
     return this.limitedEtsyApiFetch(`/listings/${listingId}/images`, options);
  }

  // https://www.etsy.com/developers/documentation/reference/listinginventory
  getInventory(listingId, options) {
     this._assumeField('listingId', listingId);
     return this.limitedEtsyApiFetch(`/listings/${listingId}/inventory`, options);
  }

  // https://www.etsy.com/developers/documentation/reference/propertyvalue#method_getattribute
  getAttributes(listingId, options) {
     this._assumeField('listingId', listingId);
     return this.limitedEtsyApiFetch(`/listings/${listingId}/attributes`, options);
  }

  // https://www.etsy.com/developers/documentation/reference/listingproduct#method_getproduct
  getProduct(listingId, productId, options) {
     this._assumeField('listingId', listingId);
     this._assumeField('productId', productId);
     return this.limitedEtsyApiFetch(`/listings/${listingId}/products/${productId}`, options);
  }

  // https://www.etsy.com/developers/documentation/reference/shippinginfo#method_findalllistingshippingprofileentries
  findAllListingShippingProfileEntries(listingId, options) {
     this._assumeField('listingId', listingId);
     return this.limitedEtsyApiFetch(`/listings/${listingId}/shipping/info`, options);
  }

  limitedEtsyApiFetch(endpoint, options) {
    var client = this;
    if (!client.isRateLimitEnabled()) {
      return client.safeEtsyApiFetch(endpoint, options);
    } else {
      return new Promise(async function(resolve, reject) {
        await client.limiter.limitedCall(() => client.safeEtsyApiFetch(endpoint, options))
                  .then(resolve).catch(reject);
      });
    }
  }

  safeEtsyApiFetch(endpoint, options) {
     this._assumeField('endpoint', endpoint);
     var client = this;
     return new Promise((resolve, reject) => {
         const getQueryString = queryString.stringify(client.getOptions(options));
         const url = `${client.apiUrl}${endpoint}?${getQueryString}`
         // DEBUG // console.log(url);
         client.nodeAxios(url)
           .then(response => EtsyClientV2._response(response, resolve, reject))
           .catch(requestError => {
             var secureError = {};
             client.secureErrorAttribute(secureError, requestError, "message");
             client.secureErrorAttribute(secureError, requestError, "code");
             reject(secureError);
           });
     });
  }

  secureErrorAttribute(secureError, sourceError, attribute) {
    if (!Object.keys(sourceError).includes(attribute)) {
      return;
    }
    secureError[attribute] = this.secureAttributeValue(sourceError[attribute]);
  }

  secureAttributeValue(value) {
    return (value === null || value === undefined) ? null : value.replace(new RegExp(this.apiKey,'g'), "**hidden**");
  }

  getOptions(options) {
    var merged = options ? options : {};
    merged['api_key'] = this.apiKey;
    if (this.lang != null && !("language" in merged)) {
      merged['language'] = this.lang;
    }
    return merged;
  }

  dryFetch(endpoint) {
    const response = {};
    response.status = 200;
    response.data = {endpoint};
    console.log(`[dry_get] ${endpoint}`);
    return Promise.resolve(response);
  }

  nodeAxios(endpoint) {
    const client = this;
    if (this.dryMode) {
      return this.dryFetch(endpoint);
    }
    return client._axios.get(endpoint);
  }

  _assumeShop() { if (!this.shop) { throw "shop is not defined";  } }
  _assumeApiUrl() { if (!this.apiUrl) { throw "apiUrl is required. ie. set ETSY_API_ENDPOINT environment variable.";  } }
  _assumeApiKey() { if (!this.apiKey) { throw "apiKey is required. ie. set ETSY_API_KEY environment variable.";  } }
  _assumeField(fieldName, fieldValue) { if (!fieldValue) { throw fieldName + " is required";  } }

  static _response(response, resolve, reject) {
    if (response.status >= 200 && response.status < 300) {
      resolve(response.data);
    } else {
      reject(response.data);
    }
  }
}
export default EtsyClientV2;