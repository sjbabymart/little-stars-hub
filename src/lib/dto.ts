// Shared plain-data shapes returned by server functions.

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  active: boolean;
};

export type Product = {
  id: string;
  category_id: string | null;
  category_name?: string | null;
  name: string;
  slug: string;
  description: string | null;
  price_kes: number;
  compare_at_price_kes: number | null;
  image_url: string | null;
  stock: number;
  sizes: string[];
  featured: boolean;
  active: boolean;
  created_at?: string;
};

export type DeliveryZone = {
  id: string;
  name: string;
  fee_kes: number;
  estimated_time: string | null;
  active: boolean;
  sort_order: number;
};

export type ContactSettings = {
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  hours: string;
};

export type ShopSettings = {
  announcement: string;
  free_delivery_threshold: number;
  currency: string;
};

export type ClinicSettings = {
  name: string;
  tagline: string;
  hours: string;
  phone: string;
  services: string[];
};

export type SiteContent = {
  contact: ContactSettings;
  shop: ShopSettings;
  clinic: ClinicSettings;
};

export type OrderItemDto = {
  id?: string;
  product_id: string | null;
  product_name: string;
  size: string | null;
  quantity: number;
  unit_price_kes: number;
};

export type OrderDto = {
  id: string;
  order_number: string;
  customer_name: string;
  phone: string;
  email: string | null;
  delivery_method: "delivery" | "pickup";
  delivery_zone_id: string | null;
  delivery_zone_name?: string | null;
  address: string | null;
  subtotal_kes: number;
  delivery_fee_kes: number;
  total_kes: number;
  status: string;
  payment_method: string;
  notes: string | null;
  created_at: string;
  items?: OrderItemDto[];
};

export type AppointmentDto = {
  id: string;
  parent_name: string;
  phone: string;
  email: string | null;
  child_name: string;
  child_age: string | null;
  service: string;
  preferred_date: string;
  preferred_time: string | null;
  confirmed_date: string | null;
  confirmed_time: string | null;
  message: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
};

export type RedCarpetImageDto = {
  id: string;
  child_name: string;
  event_name: string | null;
  image_url: string;
  caption: string | null;
  status: string;
  created_at: string;
};

export type ContactMessageDto = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  message: string;
  read: boolean;
  created_at: string;
};
