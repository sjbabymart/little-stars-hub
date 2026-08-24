CREATE TYPE public.app_role AS ENUM ('admin', 'customer');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, app_role) TO authenticated;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active categories" ON public.categories FOR SELECT TO anon, authenticated USING (active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price_kes NUMERIC(10,2) NOT NULL DEFAULT 0,
  compare_at_price_kes NUMERIC(10,2),
  image_url TEXT,
  stock INTEGER NOT NULL DEFAULT 0,
  sizes TEXT[] NOT NULL DEFAULT '{}',
  featured BOOLEAN NOT NULL DEFAULT false,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active products" ON public.products FOR SELECT TO anon, authenticated USING (active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage products" ON public.products FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX products_category_idx ON public.products (category_id);
CREATE INDEX products_featured_idx ON public.products (featured) WHERE active = true;

CREATE TABLE public.delivery_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  fee_kes NUMERIC(10,2) NOT NULL DEFAULT 0,
  estimated_time TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT ON public.delivery_zones TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.delivery_zones TO authenticated;
GRANT ALL ON public.delivery_zones TO service_role;
ALTER TABLE public.delivery_zones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active delivery zones" ON public.delivery_zones FOR SELECT TO anon, authenticated USING (active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage delivery zones" ON public.delivery_zones FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_delivery_zones_updated_at BEFORE UPDATE ON public.delivery_zones FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view site settings" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can manage site settings" ON public.site_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  delivery_method TEXT NOT NULL DEFAULT 'delivery' CHECK (delivery_method IN ('delivery', 'pickup')),
  delivery_zone_id UUID REFERENCES public.delivery_zones(id) ON DELETE SET NULL,
  address TEXT,
  subtotal_kes NUMERIC(10,2) NOT NULL DEFAULT 0,
  delivery_fee_kes NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_kes NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'out_for_delivery', 'delivered', 'cancelled')),
  payment_method TEXT NOT NULL DEFAULT 'pay_on_delivery' CHECK (payment_method IN ('pay_on_delivery', 'mpesa', 'whatsapp')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.orders TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can place an order" ON public.orders FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Customers can view their own orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage orders" ON public.orders FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete orders" ON public.orders FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX orders_status_idx ON public.orders (status);
CREATE INDEX orders_user_idx ON public.orders (user_id);

CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  size TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price_kes NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.order_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can add order items" ON public.order_items FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Order owners and admins can view items" ON public.order_items FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  )
);
CREATE POLICY "Admins can manage order items" ON public.order_items FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete order items" ON public.order_items FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX order_items_order_idx ON public.order_items (order_id);

CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  child_name TEXT NOT NULL,
  child_age TEXT,
  service TEXT NOT NULL,
  preferred_date DATE NOT NULL,
  preferred_time TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT INSERT ON public.appointments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.appointments TO authenticated;
GRANT ALL ON public.appointments TO service_role;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can request an appointment" ON public.appointments FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can view appointments" ON public.appointments FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update appointments" ON public.appointments FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete appointments" ON public.appointments FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX appointments_status_idx ON public.appointments (status);
CREATE INDEX appointments_date_idx ON public.appointments (preferred_date);

CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT INSERT ON public.contact_messages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can send a message" ON public.contact_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can view messages" ON public.contact_messages FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update messages" ON public.contact_messages FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete messages" ON public.contact_messages FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.red_carpet_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_name TEXT NOT NULL,
  event_name TEXT,
  image_url TEXT NOT NULL,
  caption TEXT,
  consent_given BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_by_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.red_carpet_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.red_carpet_images TO authenticated;
GRANT ALL ON public.red_carpet_images TO service_role;
ALTER TABLE public.red_carpet_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view approved gallery photos" ON public.red_carpet_images FOR SELECT TO anon, authenticated USING ((status = 'approved' AND consent_given = true) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can submit a photo with consent" ON public.red_carpet_images FOR INSERT TO anon, authenticated WITH CHECK (consent_given = true);
CREATE POLICY "Admins can update gallery photos" ON public.red_carpet_images FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete gallery photos" ON public.red_carpet_images FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_red_carpet_images_updated_at BEFORE UPDATE ON public.red_carpet_images FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX red_carpet_status_idx ON public.red_carpet_images (status);

INSERT INTO public.categories (name, slug, description, sort_order) VALUES
  ('Baby Girls', 'baby-girls', 'Dresses, rompers and outfits for baby girls', 1),
  ('Baby Boys', 'baby-boys', 'Shirts, sets and outfits for baby boys', 2),
  ('Newborn Essentials', 'newborn-essentials', 'Soft everyday essentials for newborns', 3),
  ('Footwear', 'footwear', 'Sandals, shoes and booties', 4),
  ('Accessories', 'accessories', 'Bows, hats and finishing touches', 5);

INSERT INTO public.products (category_id, name, slug, description, price_kes, compare_at_price_kes, image_url, stock, sizes, featured) VALUES
  ((SELECT id FROM public.categories WHERE slug = 'baby-girls'), 'Sky Blue Knit Romper', 'sky-blue-knit-romper', 'Sample product — replace with your real item. Soft knit romper in gentle sky blue, easy snap buttons for quick changes.', 1450, 1800, '/images/products/romper-blue.jpg', 12, ARRAY['0-3m','3-6m','6-12m','12-18m'], true),
  ((SELECT id FROM public.categories WHERE slug = 'baby-girls'), 'Floral Sunday Dress', 'floral-sunday-dress', 'Sample product — replace with your real item. Light floral dress with a soft cotton lining, perfect for special days.', 2200, NULL, '/images/products/dress-floral.jpg', 8, ARRAY['6-12m','12-18m','2T','3T'], true),
  ((SELECT id FROM public.categories WHERE slug = 'baby-boys'), 'Navy Smart Shirt', 'navy-smart-shirt', 'Sample product — replace with your real item. Crisp navy shirt in breathable cotton for little gentlemen.', 1350, NULL, '/images/products/shirt-navy.jpg', 15, ARRAY['6-12m','12-18m','2T','3T','4T'], true),
  ((SELECT id FROM public.categories WHERE slug = 'baby-boys'), 'Little Star T-Shirt', 'little-star-t-shirt', 'Sample product — replace with your real item. Everyday tee with a gold star print, soft on sensitive skin.', 850, 1100, '/images/products/tshirt-star.jpg', 20, ARRAY['3-6m','6-12m','12-18m','2T'], false),
  ((SELECT id FROM public.categories WHERE slug = 'newborn-essentials'), 'Cream Cloud Sweater', 'cream-cloud-sweater', 'Sample product — replace with your real item. Warm cream cardigan-style sweater for chilly mornings.', 1650, NULL, '/images/products/sweater-cream.jpg', 10, ARRAY['0-3m','3-6m','6-12m'], true),
  ((SELECT id FROM public.categories WHERE slug = 'baby-boys'), 'Classic Denim Jacket', 'classic-denim-jacket', 'Sample product — replace with your real item. Soft-washed denim jacket that goes with everything.', 2400, NULL, '/images/products/jacket-denim.jpg', 6, ARRAY['12-18m','2T','3T','4T'], false),
  ((SELECT id FROM public.categories WHERE slug = 'footwear'), 'Tan First-Step Sandals', 'tan-first-step-sandals', 'Sample product — replace with your real item. Flexible tan sandals designed for early walkers.', 1250, NULL, '/images/products/sandals-tan.jpg', 14, ARRAY['EU 19','EU 20','EU 21','EU 22'], false),
  ((SELECT id FROM public.categories WHERE slug = 'accessories'), 'Bow & Clip Set', 'bow-and-clip-set', 'Sample product — replace with your real item. Set of soft headband bows and clips in cream, coral and blue.', 650, NULL, '/images/products/accessories-bows.jpg', 25, ARRAY['One size'], false);

INSERT INTO public.delivery_zones (name, fee_kes, estimated_time, sort_order) VALUES
  ('Nairobi CBD', 150, 'Same day (order before 2pm)', 1),
  ('Westlands / Parklands', 200, 'Same day (order before 2pm)', 2),
  ('Kilimani / Kileleshwa / Lavington', 250, 'Same day (order before 2pm)', 3),
  ('Karen / Langata', 350, 'Same or next day', 4),
  ('Kasarani / Roysambu / Ruaka', 300, 'Next day', 5),
  ('Thika Road Corridor', 350, 'Next day', 6),
  ('Pickup at shop (FREE)', 0, 'Ready within 2 hours', 0);

INSERT INTO public.site_settings (key, value) VALUES
  ('contact', '{"phone": "+254 7XX XXX XXX", "whatsapp": "2547XXXXXXXX", "email": "hello@example.com", "address": "Your shop address, Nairobi", "hours": "Mon–Sat, 9:00am – 6:00pm"}'),
  ('shop', '{"announcement": "Free delivery on orders over KSh 5,000", "free_delivery_threshold": 5000, "currency": "KSh"}'),
  ('clinic', '{"name": "Njau Children''s Clinic", "tagline": "Gentle, expert care for your little ones", "hours": "Mon–Fri 8:00am–5:00pm, Sat 9:00am–1:00pm", "phone": "+254 7XX XXX XXX", "services": ["Well-baby checkups & growth monitoring", "Vaccinations & immunization", "Treatment of common childhood illnesses", "Nutrition advice & feeding support", "Developmental assessments", "Emergency & same-day visits"]}');

INSERT INTO public.red_carpet_images (child_name, event_name, image_url, caption, consent_given, status) VALUES
  ('Sample — Amani', 'Red Carpet Kids Fashion Day', '/images/redcarpet/rc-1.jpg', 'Sample entry — replace with real gallery photos.', true, 'approved'),
  ('Sample — Zawadi', 'Red Carpet Kids Fashion Day', '/images/redcarpet/rc-2.jpg', 'Sample entry — replace with real gallery photos.', true, 'approved'),
  ('Sample — Kian', 'Little Stars Showcase', '/images/redcarpet/rc-3.jpg', 'Sample entry — replace with real gallery photos.', true, 'approved'),
  ('Sample — Njeri', 'Little Stars Showcase', '/images/redcarpet/rc-4.jpg', 'Sample entry — replace with real gallery photos.', true, 'approved');