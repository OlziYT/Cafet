-- Create tables
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  quota INTEGER NOT NULL,
  reservations INTEGER NOT NULL DEFAULT 0,
  dietary_tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE reservations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, menu_item_id)
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Menu items are viewable by everyone" ON menu_items
  FOR SELECT USING (true);

CREATE POLICY "Only admins can insert menu items" ON menu_items
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Only admins can update menu items" ON menu_items
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Users can view own reservations" ON reservations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own reservations" ON reservations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reservations" ON reservations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reservations" ON reservations
  FOR DELETE USING (auth.uid() = user_id);

-- Create optimized stored procedures for atomic operations
CREATE OR REPLACE FUNCTION create_reservation(
  p_user_id UUID,
  p_menu_item_id UUID
) RETURNS json AS $$
DECLARE
  v_menu_item menu_items%ROWTYPE;
BEGIN
  -- Get current menu item state and lock the row
  SELECT * INTO v_menu_item
  FROM menu_items
  WHERE id = p_menu_item_id
  FOR UPDATE SKIP LOCKED;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Menu item not found';
  END IF;

  -- Check availability
  IF v_menu_item.quota <= v_menu_item.reservations THEN
    RAISE EXCEPTION 'No available spots';
  END IF;

  -- Create reservation and update menu item count in a single transaction
  INSERT INTO reservations (user_id, menu_item_id)
  VALUES (p_user_id, p_menu_item_id);

  UPDATE menu_items
  SET reservations = reservations + 1
  WHERE id = p_menu_item_id
  RETURNING row_to_json(menu_items.*) INTO v_menu_item;

  RETURN v_menu_item;
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'Reservation already exists';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION cancel_reservation(
  p_user_id UUID,
  p_menu_item_id UUID
) RETURNS json AS $$
DECLARE
  v_menu_item menu_items%ROWTYPE;
BEGIN
  -- Delete reservation and update menu item count in a single transaction
  WITH deleted_reservation AS (
    DELETE FROM reservations
    WHERE user_id = p_user_id
      AND menu_item_id = p_menu_item_id
      AND status = 'confirmed'
    RETURNING menu_item_id
  )
  UPDATE menu_items
  SET reservations = GREATEST(0, reservations - 1)
  WHERE id = p_menu_item_id
    AND EXISTS (SELECT 1 FROM deleted_reservation WHERE menu_item_id = menu_items.id)
  RETURNING row_to_json(menu_items.*) INTO v_menu_item;

  RETURN v_menu_item;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'name',
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'user')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();