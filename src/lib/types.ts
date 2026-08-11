export type PaymentMethod = "advance" | "cod";
export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "completed"
  | "cancelled";

export type DeviceCompat = {
  icon: string;
  name: string;
  models: string;
};

export type ProductVariation = {
  id: string;
  product_id: string;
  label: string;
  price: number;
  compare_at_price: number | null;
  stock: number;
  sort_order: number;
  is_active: boolean;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  short_name: string;
  price: number;
  compare_at_price: number | null;
  badge: string | null;
  description: string;
  meta_title: string | null;
  meta_description: string | null;
  video_url: string | null;
  video_thumbnail: string | null;
  highlights: string[];
  images: string[];
  device_compatibility: DeviceCompat[];
  stock: number;
  sort_order: number;
  is_active: boolean;
  variations?: ProductVariation[];
};

export type CartLine = {
  key: string;
  productSlug: string;
  productName: string;
  variationId: string | null;
  variationLabel: string | null;
  unitPrice: number;
  quantity: number;
  image: string;
};

export type Coupon = {
  id: string;
  code: string;
  type: "fixed" | "percent";
  value: number;
  min_order_amount: number | null;
  max_discount_amount: number | null;
  usage_limit: number | null;
  used_count: number;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
};

export type OrderItem = {
  id?: string;
  product_slug: string;
  variation_id: string | null;
  variation_label: string | null;
  product_name: string;
  unit_price: number;
  quantity: number;
  line_total: number;
};

export type Order = {
  id: string;
  order_number: number;
  customer_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  subtotal_before_discount: number;
  discount_amount: number;
  coupon_id: string | null;
  coupon_code: string | null;
  payment_method: PaymentMethod;
  cod_fee: number;
  total_price: number;
  status: OrderStatus;
  created_at: string;
  order_items?: OrderItem[];
};

export type ProductReview = {
  id: string;
  product_slug: string;
  reviewer_name: string;
  reviewer_email: string;
  rating: number;
  body: string;
  images_json: string[];
  status: "pending" | "approved" | "rejected";
  created_at: string;
};
