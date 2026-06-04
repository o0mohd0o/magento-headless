export type Money = { value: number; currency: string };

export type ProductImage = { url: string; label?: string | null };

export type PriceRange = {
  minimum_price: {
    regular_price: Money;
    final_price: Money;
  };
};

export type ConfigurableOptionValue = {
  uid: string;
  label: string;
  swatch_data?: { value: string } | null;
};

export type ConfigurableOption = {
  attribute_code: string;
  label: string;
  values: ConfigurableOptionValue[];
};

export type Product = {
  uid: string;
  sku: string;
  name: string;
  url_key: string;
  __typename: string;
  stock_status?: string | null;
  small_image?: ProductImage | null;
  price_range: PriceRange;
};

export type GroupedItem = {
  qty: number;
  product: {
    sku: string;
    name: string;
    stock_status?: string | null;
    price_range: PriceRange;
  };
};

export type Review = {
  summary: string;
  text: string;
  nickname: string;
  created_at: string;
  average_rating: number;
};

export type ReviewMetadata = {
  id: string;
  name: string;
  values: { value_id: string; value: string }[];
};

export type BundleOption = {
  uid: string;
  label: string;
  quantity: number;
  can_change_quantity: boolean;
  product: { sku: string; name: string };
};
export type BundleItem = {
  option_id: number;
  title: string;
  type: string; // radio | checkbox | select | multi
  required: boolean;
  options: BundleOption[];
};
export type TierPrice = { quantity: number; final_price: Money };

export type ProductDetail = Product & {
  description?: { html: string } | null;
  media_gallery?: ProductImage[] | null;
  categories?: { name: string; url_key: string }[] | null;
  configurable_options?: ConfigurableOption[] | null;
  groupedItems?: GroupedItem[] | null;
  bundleItems?: BundleItem[] | null;
  price_tiers?: TierPrice[] | null;
  related_products?: Product[] | null;
  upsell_products?: Product[] | null;
  rating_summary?: number | null;
  review_count?: number | null;
  reviews?: { items: Review[] } | null;
};

export type Category = {
  uid: string;
  name: string;
  url_key: string;
  include_in_menu?: number | null;
  product_count?: number | null;
  description?: string | null;
  children?: Category[] | null;
};

export type PageInfo = {
  current_page: number;
  total_pages: number;
  page_size?: number;
};

export type AggregationOption = { label: string; value: string; count: number };
export type Aggregation = {
  attribute_code: string;
  label: string;
  options: AggregationOption[];
};

export type CartItem = {
  uid: string;
  quantity: number;
  prices: { price: Money; row_total: Money };
  product: {
    sku: string;
    name: string;
    url_key: string;
    small_image?: ProductImage | null;
  };
  configurable_options?: { option_label: string; value_label: string }[] | null;
};

export type Cart = {
  id: string;
  total_quantity: number;
  items: CartItem[];
  applied_coupons?: { code: string }[] | null;
  prices: {
    grand_total: Money;
    subtotal_excluding_tax?: Money | null;
    discounts?: { amount: Money; label: string }[] | null;
  };
};

export type UserError = { code: string; message: string };

export type CustomerOrder = {
  number: string;
  order_date: string;
  status: string;
  total: { grand_total: Money };
};

export type Customer = {
  firstname: string;
  lastname: string;
  email: string;
  orders?: { total_count: number; items: CustomerOrder[] } | null;
};

/* ---------- Checkout ---------- */

export type Region = { id: number; code: string; name: string };
export type Country = {
  id: string;
  full_name_locale: string;
  available_regions?: Region[] | null;
};

export type ShippingMethod = {
  carrier_code: string;
  method_code: string;
  carrier_title: string;
  method_title: string;
  available?: boolean | null;
  amount: Money;
};

export type PaymentMethod = { code: string; title: string };

export type CheckoutItem = {
  uid: string;
  quantity: number;
  prices: { row_total: Money };
  product: {
    sku: string;
    name: string;
    url_key: string;
    small_image?: ProductImage | null;
  };
  configurable_options?: { option_label: string; value_label: string }[] | null;
};

export type CheckoutShippingAddress = {
  firstname?: string | null;
  lastname?: string | null;
  street?: string[] | null;
  city?: string | null;
  postcode?: string | null;
  telephone?: string | null;
  region?: { code?: string | null; label?: string | null } | null;
  country?: { code: string } | null;
  selected_shipping_method?: ShippingMethod | null;
  available_shipping_methods?: ShippingMethod[] | null;
};

export type CheckoutCart = {
  id: string;
  email?: string | null;
  is_virtual: boolean;
  total_quantity: number;
  items: CheckoutItem[];
  applied_coupons?: { code: string }[] | null;
  shipping_addresses: CheckoutShippingAddress[];
  available_payment_methods?: PaymentMethod[] | null;
  selected_payment_method?: PaymentMethod | null;
  prices: {
    grand_total: Money;
    subtotal_excluding_tax?: Money | null;
    discounts?: { amount: Money; label: string }[] | null;
    applied_taxes?: { amount: Money; label: string }[] | null;
  };
};

export type AddressInput = {
  firstname: string;
  lastname: string;
  street: string[];
  city: string;
  region?: string;
  region_id?: number;
  postcode: string;
  country_code: string;
  telephone: string;
};

/* ---------- Account ---------- */

export type CustomerAddress = {
  id: number;
  uid: string;
  firstname: string;
  lastname: string;
  company?: string | null;
  street: string[];
  city: string;
  region?: { region?: string | null; region_code?: string | null; region_id?: number | null } | null;
  postcode: string;
  country_code: string;
  telephone: string;
  default_shipping?: boolean | null;
  default_billing?: boolean | null;
};

export type OrderListItem = {
  number: string;
  order_date: string;
  status: string;
  total: { grand_total: Money };
};

export type OrderDetail = {
  id?: string;
  number: string;
  order_date: string;
  status: string;
  available_actions?: string[] | null;
  shipments?:
    | { number: string; tracking?: { title: string; number: string }[] | null }[]
    | null;
  invoices?: { number: string }[] | null;
  items: {
    product_name: string;
    product_sku: string;
    product_sale_price: Money;
    quantity_ordered: number;
  }[];
  total: {
    subtotal: Money;
    total_shipping: Money;
    total_tax: Money;
    grand_total: Money;
  };
  shipping_address?: {
    firstname: string;
    lastname: string;
    street: string[];
    city: string;
    region: string;
    postcode: string;
    country_code: string;
    telephone: string;
  } | null;
  billing_address?: {
    firstname: string;
    lastname: string;
    street: string[];
    city: string;
    region: string;
    postcode: string;
  } | null;
  payment_methods?: { name: string; type: string }[] | null;
  shipping_method?: string | null;
};

export type CustomerOverview = {
  firstname: string;
  lastname: string;
  email: string;
  addresses: CustomerAddress[];
  orders?: { total_count: number; items: OrderListItem[] } | null;
};

export type WishlistItem = {
  id: string;
  quantity: number;
  product: Product;
};

export type Wishlist = {
  id: string;
  items_count: number;
  items: WishlistItem[];
};
