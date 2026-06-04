/* Magento 2.4.9 storefront GraphQL operations — all verified against the live endpoint. */

const PRODUCT_CARD_FIELDS = `
  uid
  sku
  name
  url_key
  __typename
  stock_status
  small_image { url label }
  price_range {
    minimum_price {
      final_price { value currency }
      regular_price { value currency }
    }
  }
`;

export const STORE_CONFIG = /* GraphQL */ `
  query StoreConfig {
    storeConfig {
      store_name
      base_currency_code
      base_media_url
      locale
    }
  }
`;

/** Top-level navigation: direct children of the root category (id 2). */
export const TOP_NAV = /* GraphQL */ `
  query TopNav {
    categoryList(filters: { parent_id: { eq: "2" } }) {
      uid
      name
      url_key
      include_in_menu
      product_count
    }
  }
`;

/** A category page: the category, its subcategories, and a page of products. */
export const CATEGORY_PAGE = /* GraphQL */ `
  query CategoryPage($urlKey: String!, $pageSize: Int!, $currentPage: Int!) {
    categoryList(filters: { url_key: { eq: $urlKey } }) {
      uid
      name
      description
      children {
        uid
        name
        url_key
        product_count
      }
      products(pageSize: $pageSize, currentPage: $currentPage) {
        total_count
        page_info { current_page total_pages page_size }
        items { ${PRODUCT_CARD_FIELDS} }
      }
    }
  }
`;

/** Products in a category by uid (used for home featured rows). */
export const PRODUCTS_BY_CATEGORY_UID = /* GraphQL */ `
  query ProductsByCategoryUid($uid: String!, $pageSize: Int!) {
    products(filter: { category_uid: { eq: $uid } }, pageSize: $pageSize) {
      items { ${PRODUCT_CARD_FIELDS} }
    }
  }
`;

/** Featured rows on the home page resolve a category by url_key then list its products. */
export const FEATURED_BY_URLKEY = /* GraphQL */ `
  query FeaturedByUrlKey($urlKey: String!, $pageSize: Int!) {
    categoryList(filters: { url_key: { eq: $urlKey } }) {
      uid
      name
      url_key
      products(pageSize: $pageSize) {
        items { ${PRODUCT_CARD_FIELDS} }
      }
    }
  }
`;

/** Category info (resolve url_key -> uid, name, children) for PLP pages. */
export const CATEGORY_INFO = /* GraphQL */ `
  query CategoryInfo($urlKey: String!) {
    categoryList(filters: { url_key: { eq: $urlKey } }) {
      uid
      name
      description
      children { uid name url_key product_count }
    }
  }
`;

/** Shared filterable/sortable product listing for category + search pages. */
export const PLP_PRODUCTS = /* GraphQL */ `
  query Plp(
    $search: String
    $filter: ProductAttributeFilterInput
    $sort: ProductAttributeSortInput
    $pageSize: Int!
    $currentPage: Int!
  ) {
    products(
      search: $search
      filter: $filter
      sort: $sort
      pageSize: $pageSize
      currentPage: $currentPage
    ) {
      total_count
      page_info { current_page total_pages }
      aggregations {
        attribute_code
        label
        options { label value count }
      }
      items { ${PRODUCT_CARD_FIELDS} }
    }
  }
`;

export const PRODUCT_DETAIL = /* GraphQL */ `
  query ProductDetail($urlKey: String!) {
    products(filter: { url_key: { eq: $urlKey } }) {
      items {
        uid
        sku
        name
        url_key
        __typename
        stock_status
        description { html }
        media_gallery { url label }
        categories { name url_key }
        price_range {
          minimum_price {
            final_price { value currency }
            regular_price { value currency }
          }
        }
        rating_summary
        review_count
        reviews(pageSize: 30) {
          items {
            summary
            text
            nickname
            created_at
            average_rating
          }
        }
        price_tiers {
          quantity
          final_price { value currency }
        }
        related_products { ${PRODUCT_CARD_FIELDS} }
        upsell_products { ${PRODUCT_CARD_FIELDS} }
        ... on ConfigurableProduct {
          configurable_options {
            attribute_code
            label
            values { uid label swatch_data { value } }
          }
          variants {
            attributes { code uid value_index }
            product { sku stock_status }
          }
        }
        ... on GroupedProduct {
          groupedItems: items {
            qty
            product {
              sku
              name
              stock_status
              price_range {
                minimum_price { final_price { value currency } }
              }
            }
          }
        }
        ... on BundleProduct {
          bundleItems: items {
            option_id
            title
            type
            required
            options {
              uid
              label
              quantity
              can_change_quantity
              product { sku name }
            }
          }
        }
      }
    }
  }
`;

export const SEARCH_PRODUCTS = /* GraphQL */ `
  query SearchProducts($q: String!, $pageSize: Int!, $currentPage: Int!) {
    products(search: $q, pageSize: $pageSize, currentPage: $currentPage) {
      total_count
      page_info { current_page total_pages }
      items { ${PRODUCT_CARD_FIELDS} }
    }
  }
`;

/* ---------- Newsletter / Contact / Share ---------- */

export const SUBSCRIBE_NEWSLETTER = /* GraphQL */ `
  mutation SubscribeNewsletter($email: String!) {
    subscribeEmailToNewsletter(email: $email) { status }
  }
`;

export const CONTACT_US = /* GraphQL */ `
  mutation ContactUs(
    $name: String!
    $email: String!
    $comment: String!
    $telephone: String
  ) {
    contactUs(
      input: { name: $name, email: $email, comment: $comment, telephone: $telephone }
    ) {
      status
    }
  }
`;

export const SEND_EMAIL_TO_FRIEND = /* GraphQL */ `
  mutation SendEmailToFriend(
    $productId: Int!
    $senderName: String!
    $senderEmail: String!
    $message: String!
    $recipientName: String!
    $recipientEmail: String!
  ) {
    sendEmailToFriend(
      input: {
        product_id: $productId
        sender: { name: $senderName, email: $senderEmail, message: $message }
        recipients: [{ name: $recipientName, email: $recipientEmail }]
      }
    ) {
      sender { name }
    }
  }
`;

export const IS_EMAIL_AVAILABLE = /* GraphQL */ `
  query IsEmailAvailable($email: String!) {
    isEmailAvailable(email: $email) { is_email_available }
  }
`;

/* ---------- Store / currency / agreements / vault ---------- */

export const AVAILABLE_STORES = /* GraphQL */ `
  query AvailableStores {
    availableStores {
      store_code
      store_name
      locale
      default_display_currency_code
    }
  }
`;

export const CURRENCY = /* GraphQL */ `
  query Currency {
    currency {
      base_currency_code
      available_currency_codes
    }
  }
`;

export const CHECKOUT_AGREEMENTS = /* GraphQL */ `
  query CheckoutAgreements {
    checkoutAgreements {
      agreement_id
      name
      content
      mode
      is_html
    }
  }
`;

export const CUSTOMER_PAYMENT_TOKENS = /* GraphQL */ `
  query CustomerPaymentTokens {
    customerPaymentTokens {
      items {
        public_hash
        payment_method_code
        type
        details
      }
    }
  }
`;

export const DELETE_PAYMENT_TOKEN = /* GraphQL */ `
  mutation DeletePaymentToken($hash: String!) {
    deletePaymentToken(public_hash: $hash) {
      result
    }
  }
`;

/* ---------- URL routing (UrlRewrite) ---------- */

export const ROUTE_RESOLVER = /* GraphQL */ `
  query Route($url: String!) {
    route(url: $url) {
      __typename
      redirect_code
      relative_url
      type
      ... on ProductInterface { url_key }
      ... on CategoryInterface { url_key }
      ... on CmsPage { identifier }
    }
  }
`;

/* ---------- Compare ---------- */

const COMPARE_FIELDS = `
  uid
  item_count
  attributes { code label }
  items {
    uid
    product {
      uid sku name url_key
      small_image { url label }
      price_range { minimum_price { final_price { value currency } } }
    }
    attributes { code value }
  }
`;

export const COMPARE_LIST = /* GraphQL */ `
  query CompareList($uid: ID!) {
    compareList(uid: $uid) { ${COMPARE_FIELDS} }
  }
`;

/**
 * Cookie-based compare (Magento's guest compareList is broken on this instance —
 * catalog_compare_item never populates). We store SKUs in a cookie and build
 * the comparison from a normal products query.
 */
export const COMPARE_PRODUCTS = /* GraphQL */ `
  query CompareProducts($skus: [String!]!) {
    products(filter: { sku: { in: $skus } }, pageSize: 20) {
      items {
        uid
        sku
        name
        url_key
        stock_status
        small_image { url label }
        price_range { minimum_price { final_price { value currency } } }
        description { html }
      }
    }
  }
`;

export const CREATE_COMPARE_LIST = /* GraphQL */ `
  mutation CreateCompareList($productUid: ID!) {
    createCompareList(input: { products: [$productUid] }) { uid item_count }
  }
`;

export const ADD_TO_COMPARE = /* GraphQL */ `
  mutation AddToCompare($uid: ID!, $productUid: ID!) {
    addProductsToCompareList(input: { uid: $uid, products: [$productUid] }) {
      uid item_count
    }
  }
`;

export const REMOVE_FROM_COMPARE = /* GraphQL */ `
  mutation RemoveFromCompare($uid: ID!, $productUid: ID!) {
    removeProductsFromCompareList(input: { uid: $uid, products: [$productUid] }) {
      uid item_count
    }
  }
`;

/* ---------- CMS ---------- */

export const CMS_PAGE = /* GraphQL */ `
  query CmsPage($identifier: String!) {
    cmsPage(identifier: $identifier) {
      identifier
      title
      content
      content_heading
      meta_title
      meta_description
    }
  }
`;

export const CMS_BLOCKS = /* GraphQL */ `
  query CmsBlocks($identifiers: [String]!) {
    cmsBlocks(identifiers: $identifiers) {
      items { identifier title content }
    }
  }
`;

/* ---------- Reviews ---------- */

export const REVIEW_METADATA = /* GraphQL */ `
  query ReviewMetadata {
    productReviewRatingsMetadata {
      items {
        id
        name
        values { value_id value }
      }
    }
  }
`;

export const CREATE_REVIEW = /* GraphQL */ `
  mutation CreateReview(
    $sku: String!
    $nickname: String!
    $summary: String!
    $text: String!
    $ratingId: String!
    $valueId: String!
  ) {
    createProductReview(
      input: {
        sku: $sku
        nickname: $nickname
        summary: $summary
        text: $text
        ratings: [{ id: $ratingId, value_id: $valueId }]
      }
    ) {
      review { nickname summary }
    }
  }
`;

/* ---------- Cart (guest) ---------- */

export const CREATE_GUEST_CART = /* GraphQL */ `
  mutation CreateGuestCart {
    createGuestCart { cart { id } }
  }
`;

export const CART_QUERY = /* GraphQL */ `
  query CartQuery($cartId: String!) {
    cart(cart_id: $cartId) {
      id
      total_quantity
      items {
        uid
        quantity
        prices {
          price { value currency }
          row_total { value currency }
        }
        product {
          sku
          name
          url_key
          small_image { url label }
        }
        ... on ConfigurableCartItem {
          configurable_options { option_label value_label }
        }
      }
      applied_coupons { code }
      prices {
        grand_total { value currency }
        subtotal_excluding_tax { value currency }
        discounts { amount { value currency } label }
      }
    }
  }
`;

export const ADD_PRODUCTS_TO_CART = /* GraphQL */ `
  mutation AddProductsToCart($cartId: String!, $cartItems: [CartItemInput!]!) {
    addProductsToCart(cartId: $cartId, cartItems: $cartItems) {
      cart {
        total_quantity
        prices { grand_total { value currency } }
      }
      user_errors { code message }
    }
  }
`;

export const UPDATE_CART_ITEMS = /* GraphQL */ `
  mutation UpdateCartItems($cartId: String!, $items: [CartItemUpdateInput!]!) {
    updateCartItems(input: { cart_id: $cartId, cart_items: $items }) {
      cart { total_quantity }
    }
  }
`;

export const REMOVE_ITEM_FROM_CART = /* GraphQL */ `
  mutation RemoveItemFromCart($cartId: String!, $uid: ID!) {
    removeItemFromCart(input: { cart_id: $cartId, cart_item_uid: $uid }) {
      cart { total_quantity }
    }
  }
`;

export const CLEAR_CART = /* GraphQL */ `
  mutation ClearCart($cartId: ID!) {
    clearCart(input: { uid: $cartId }) {
      status
    }
  }
`;

/* ---------- Customer auth ---------- */

export const GENERATE_CUSTOMER_TOKEN = /* GraphQL */ `
  mutation GenerateCustomerToken($email: String!, $password: String!) {
    generateCustomerToken(email: $email, password: $password) {
      token
    }
  }
`;

export const CREATE_CUSTOMER = /* GraphQL */ `
  mutation CreateCustomer(
    $firstname: String!
    $lastname: String!
    $email: String!
    $password: String!
  ) {
    createCustomerV2(
      input: {
        firstname: $firstname
        lastname: $lastname
        email: $email
        password: $password
      }
    ) {
      customer { firstname lastname email }
    }
  }
`;

export const REVOKE_CUSTOMER_TOKEN = /* GraphQL */ `
  mutation RevokeCustomerToken {
    revokeCustomerToken { result }
  }
`;

/** Bearer-token authenticated: the logged-in customer's masked cart id. */
export const CUSTOMER_CART_ID = /* GraphQL */ `
  query CustomerCartId {
    customerCart { id }
  }
`;

export const CUSTOMER_NAME = /* GraphQL */ `
  query CustomerName {
    customer { firstname }
  }
`;

/** One round-trip for the header when logged in: name + cart + wishlist count. */
export const HEADER_SESSION = /* GraphQL */ `
  query HeaderSession {
    customer {
      firstname
      wishlists { items_count }
    }
    customerCart { total_quantity }
  }
`;

export const CUSTOMER_ACCOUNT = /* GraphQL */ `
  query CustomerAccount {
    customer {
      firstname
      lastname
      email
      orders(pageSize: 20, currentPage: 1) {
        total_count
        items {
          number
          order_date
          status
          total { grand_total { value currency } }
        }
      }
    }
  }
`;

export const MERGE_CARTS = /* GraphQL */ `
  mutation MergeCarts($source: String!, $destination: String!) {
    mergeCarts(source_cart_id: $source, destination_cart_id: $destination) {
      id
      total_quantity
    }
  }
`;

/* ---------- Checkout ---------- */

export const COUNTRIES = /* GraphQL */ `
  query Countries {
    countries {
      id
      full_name_locale
      available_regions { id code name }
    }
  }
`;

export const CHECKOUT_CART = /* GraphQL */ `
  query CheckoutCart($cartId: String!) {
    cart(cart_id: $cartId) {
      id
      email
      is_virtual
      total_quantity
      items {
        uid
        quantity
        prices { row_total { value currency } }
        product { sku name url_key small_image { url label } }
        ... on ConfigurableCartItem {
          configurable_options { option_label value_label }
        }
      }
      applied_coupons { code }
      shipping_addresses {
        firstname
        lastname
        street
        city
        postcode
        telephone
        region { code label }
        country { code }
        selected_shipping_method {
          carrier_code
          method_code
          carrier_title
          method_title
          amount { value currency }
        }
        available_shipping_methods {
          carrier_code
          method_code
          carrier_title
          method_title
          available
          amount { value currency }
        }
      }
      available_payment_methods { code title }
      selected_payment_method { code title }
      prices {
        grand_total { value currency }
        subtotal_excluding_tax { value currency }
        discounts { amount { value currency } label }
        applied_taxes { amount { value currency } label }
      }
    }
  }
`;

export const SET_GUEST_EMAIL = /* GraphQL */ `
  mutation SetGuestEmail($cartId: String!, $email: String!) {
    setGuestEmailOnCart(input: { cart_id: $cartId, email: $email }) {
      cart { email }
    }
  }
`;

export const SET_SHIPPING_ADDRESS = /* GraphQL */ `
  mutation SetShippingAddress($cartId: String!, $address: CartAddressInput!) {
    setShippingAddressesOnCart(
      input: { cart_id: $cartId, shipping_addresses: [{ address: $address }] }
    ) {
      cart {
        shipping_addresses {
          available_shipping_methods { carrier_code method_code }
        }
      }
    }
  }
`;

export const SET_SHIPPING_METHOD = /* GraphQL */ `
  mutation SetShippingMethod($cartId: String!, $method: ShippingMethodInput!) {
    setShippingMethodsOnCart(
      input: { cart_id: $cartId, shipping_methods: [$method] }
    ) {
      cart {
        shipping_addresses {
          selected_shipping_method { carrier_code method_code }
        }
      }
    }
  }
`;

export const SET_BILLING_SAME_AS_SHIPPING = /* GraphQL */ `
  mutation SetBillingSameAsShipping($cartId: String!) {
    setBillingAddressOnCart(
      input: { cart_id: $cartId, billing_address: { same_as_shipping: true } }
    ) {
      cart {
        available_payment_methods { code title }
      }
    }
  }
`;

export const SET_PAYMENT_METHOD = /* GraphQL */ `
  mutation SetPaymentMethod($cartId: String!, $code: String!) {
    setPaymentMethodOnCart(
      input: { cart_id: $cartId, payment_method: { code: $code } }
    ) {
      cart { selected_payment_method { code title } }
    }
  }
`;

export const PLACE_ORDER = /* GraphQL */ `
  mutation PlaceOrder($cartId: String!) {
    placeOrder(input: { cart_id: $cartId }) {
      orderV2 {
        number
        token
        total { grand_total { value currency } }
      }
      errors { code message }
    }
  }
`;

export const APPLY_COUPON = /* GraphQL */ `
  mutation ApplyCoupon($cartId: String!, $code: String!) {
    applyCouponToCart(input: { cart_id: $cartId, coupon_code: $code }) {
      cart { applied_coupons { code } }
    }
  }
`;

export const REMOVE_COUPON = /* GraphQL */ `
  mutation RemoveCoupon($cartId: String!) {
    removeCouponFromCart(input: { cart_id: $cartId }) {
      cart { applied_coupons { code } }
    }
  }
`;

/* ---------- Account: addresses, profile, orders ---------- */

const ADDRESS_FIELDS = `
  id
  uid
  firstname
  lastname
  company
  street
  city
  region { region region_code region_id }
  postcode
  country_code
  telephone
  default_shipping
  default_billing
`;

export const CUSTOMER_OVERVIEW = /* GraphQL */ `
  query CustomerOverview {
    customer {
      firstname
      lastname
      email
      addresses { ${ADDRESS_FIELDS} }
      orders(pageSize: 5, currentPage: 1) {
        total_count
        items {
          number
          order_date
          status
          total { grand_total { value currency } }
        }
      }
    }
  }
`;

export const CUSTOMER_ADDRESSES = /* GraphQL */ `
  query CustomerAddresses {
    customer { addresses { ${ADDRESS_FIELDS} } }
  }
`;

export const CREATE_ADDRESS = /* GraphQL */ `
  mutation CreateAddress($input: CustomerAddressInput!) {
    createCustomerAddress(input: $input) { id uid }
  }
`;

export const UPDATE_ADDRESS = /* GraphQL */ `
  mutation UpdateAddress($uid: ID!, $input: CustomerAddressInput!) {
    updateCustomerAddressV2(uid: $uid, input: $input) { id uid }
  }
`;

export const DELETE_ADDRESS = /* GraphQL */ `
  mutation DeleteAddress($uid: ID!) {
    deleteCustomerAddressV2(uid: $uid)
  }
`;

export const UPDATE_PROFILE = /* GraphQL */ `
  mutation UpdateProfile($firstname: String!, $lastname: String!) {
    updateCustomerV2(input: { firstname: $firstname, lastname: $lastname }) {
      customer { firstname lastname }
    }
  }
`;

export const CHANGE_PASSWORD = /* GraphQL */ `
  mutation ChangePassword($current: String!, $next: String!) {
    changeCustomerPassword(currentPassword: $current, newPassword: $next) {
      email
    }
  }
`;

export const CUSTOMER_ORDERS = /* GraphQL */ `
  query CustomerOrders($pageSize: Int!, $currentPage: Int!) {
    customer {
      orders(pageSize: $pageSize, currentPage: $currentPage) {
        total_count
        page_info { current_page total_pages }
        items {
          number
          order_date
          status
          total { grand_total { value currency } }
        }
      }
    }
  }
`;

export const CUSTOMER_ORDER_DETAIL = /* GraphQL */ `
  query CustomerOrderDetail($number: String!) {
    customer {
      orders(filter: { number: { eq: $number } }) {
        items {
          id
          number
          order_date
          status
          available_actions
          shipments { number tracking { title number } }
          invoices { number }
          items {
            product_name
            product_sku
            product_sale_price { value currency }
            quantity_ordered
          }
          total {
            subtotal { value currency }
            total_shipping { value currency }
            total_tax { value currency }
            grand_total { value currency }
          }
          shipping_address {
            firstname lastname street city region postcode country_code telephone
          }
          billing_address { firstname lastname street city region postcode }
          payment_methods { name type }
          shipping_method
        }
      }
    }
  }
`;

export const UPDATE_EMAIL = /* GraphQL */ `
  mutation UpdateEmail($email: String!, $password: String!) {
    updateCustomerEmail(email: $email, password: $password) {
      customer { email }
    }
  }
`;

export const DELETE_CUSTOMER = /* GraphQL */ `
  mutation DeleteCustomer {
    deleteCustomer
  }
`;

export const CANCEL_ORDER = /* GraphQL */ `
  mutation CancelOrder($orderId: ID!, $reason: String!) {
    cancelOrder(input: { order_id: $orderId, reason: $reason }) {
      order { status }
      error
    }
  }
`;

export const GUEST_ORDER = /* GraphQL */ `
  query GuestOrder($email: String!, $lastname: String!, $number: String!) {
    guestOrder(input: { email: $email, lastname: $lastname, number: $number }) {
      number
      order_date
      status
      items { product_name product_sku product_sale_price { value currency } quantity_ordered }
      total {
        subtotal { value currency }
        total_shipping { value currency }
        total_tax { value currency }
        grand_total { value currency }
      }
      shipping_address { firstname lastname street city region postcode country_code telephone }
    }
  }
`;

export const REORDER_ITEMS = /* GraphQL */ `
  mutation Reorder($number: String!) {
    reorderItems(orderNumber: $number) {
      cart { id total_quantity }
      userInputErrors { code message }
    }
  }
`;

export const REQUEST_PASSWORD_RESET = /* GraphQL */ `
  mutation RequestPasswordReset($email: String!) {
    requestPasswordResetEmail(email: $email)
  }
`;

export const RESET_PASSWORD = /* GraphQL */ `
  mutation ResetPassword($email: String!, $token: String!, $newPassword: String!) {
    resetPassword(email: $email, resetPasswordToken: $token, newPassword: $newPassword)
  }
`;

/* ---------- Wishlist ---------- */

export const WISHLIST_ID = /* GraphQL */ `
  query WishlistId {
    customer { wishlists { id } }
  }
`;

export const WISHLIST = /* GraphQL */ `
  query Wishlist {
    customer {
      wishlists {
        id
        items_count
        items_v2(currentPage: 1, pageSize: 50) {
          items {
            id
            quantity
            product {
              uid
              sku
              name
              url_key
              __typename
              stock_status
              small_image { url label }
              price_range {
                minimum_price {
                  final_price { value currency }
                  regular_price { value currency }
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const ADD_TO_WISHLIST = /* GraphQL */ `
  mutation AddToWishlist($wishlistId: ID!, $sku: String!) {
    addProductsToWishlist(
      wishlistId: $wishlistId
      wishlistItems: [{ sku: $sku, quantity: 1 }]
    ) {
      wishlist { items_count }
      user_errors { code message }
    }
  }
`;

export const REMOVE_FROM_WISHLIST = /* GraphQL */ `
  mutation RemoveFromWishlist($wishlistId: ID!, $itemId: ID!) {
    removeProductsFromWishlist(
      wishlistId: $wishlistId
      wishlistItemsIds: [$itemId]
    ) {
      wishlist { items_count }
      user_errors { code message }
    }
  }
`;

export const WISHLIST_TO_CART = /* GraphQL */ `
  mutation WishlistToCart($wishlistId: ID!, $itemId: ID!) {
    addWishlistItemsToCart(
      wishlistId: $wishlistId
      wishlistItemIds: [$itemId]
    ) {
      status
      add_wishlist_items_to_cart_user_errors { code message }
    }
  }
`;

export const GUEST_ORDER_BY_TOKEN = /* GraphQL */ `
  query GuestOrderByToken($token: String!) {
    guestOrderByToken(input: { token: $token }) {
      number
      order_date
      status
      email
      total {
        grand_total { value currency }
        subtotal { value currency }
        total_shipping { value currency }
        total_tax { value currency }
      }
      items {
        product_name
        product_sku
        quantity_ordered
        product_sale_price { value currency }
      }
      shipping_address {
        firstname
        lastname
        street
        city
        region
        postcode
        country_code
      }
    }
  }
`;
