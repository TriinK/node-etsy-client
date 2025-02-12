declare module 'node-etsy-client' {
  type EtsyClientOptions = Partial<{
    apiUrl: string;
    apiKey: string;
    lang: string;
    shop: string;
  }>

  export default class EtsyClientV2 {
    constructor(options?: EtsyClientOptions);

    findAllShops(options?: EtsyClientOptions): Promise<string | object>;

    getShop(options?: EtsyClientOptions): Promise<string | object>;

    findAllShopSections(npoptions?: EtsyClientOptions): Promise<string | object>;
   /**
    * Finds all active Listings associated with a Shop.
    * 
    * (NOTE: If calling on behalf of a shop owner in the context of listing
    * management, be sure to include the parameter `include_private: true`.
    * This will return private listings that are not publicly visible in the
    * shop, but which can be managed. This is an experimental feature and may
    * change.)
    */
   findAllShopListingsActive(options?: Partial<{
     limit: number;
     offset: number;
     page: number;
     shop_id: number | string;
     keywords: string;
     sort_on: object;
     sort_order: object;
     min_price: number;
     max_price: number;
     color: any;
     color_accuracy: any;
     tags: string[];
     taxonomy_id: number;
     translate_keywords: boolean;
     include_private: boolean;
   }>): Promise<string | object>;
 
   getListing(listingId: number, options?: object): Promise<string | object>;
 
   getVariationImages(listingId: number, options?: object): Promise<string | object>;
 
   findAllListingImages(listingId: number, options?: object): Promise<string | object>;

   getInventory(listingId: number, options?: object): Promise<string | object>;

   getAttributes(listingId: number, options?: object): Promise<string | object>;

   getProduct(listingId: number, productId: number, options?: object): Promise<string | object>;

   getOptions(options: EtsyClientOptions): EtsyClientOptions;

   findAllListingShippingProfileEntries(listingId: number, options?: object): Promise<string | object>;
  }
}
