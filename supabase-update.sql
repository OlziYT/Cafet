-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS create_reservation(UUID, UUID);
DROP FUNCTION IF EXISTS cancel_reservation(UUID, UUID);
DROP FUNCTION IF EXISTS reactivate_reservation(UUID, UUID);

-- Create optimized stored procedure for creating reservations
CREATE OR REPLACE FUNCTION create_reservation(
  p_user_id UUID,
  p_menu_item_id UUID
) RETURNS menu_items AS $$
DECLARE
  v_menu_item menu_items%ROWTYPE;
  v_existing_reservation reservations%ROWTYPE;
BEGIN
  -- Check for existing active reservation
  SELECT * INTO v_existing_reservation
  FROM reservations
  WHERE user_id = p_user_id 
    AND menu_item_id = p_menu_item_id 
    AND status = 'confirmed';
    
  IF FOUND THEN
    RAISE EXCEPTION 'Reservation already exists';
  END IF;

  -- Get current menu item state and lock the row
  SELECT * INTO v_menu_item
  FROM menu_items
  WHERE id = p_menu_item_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Menu item not found';
  END IF;

  -- Check availability
  IF v_menu_item.quota <= v_menu_item.reservations THEN
    RAISE EXCEPTION 'No available spots';
  END IF;

  -- Create reservation and update menu item count in a single transaction
  INSERT INTO reservations (user_id, menu_item_id, status)
  VALUES (p_user_id, p_menu_item_id, 'confirmed');

  UPDATE menu_items
  SET reservations = reservations + 1
  WHERE id = p_menu_item_id
  RETURNING * INTO v_menu_item;

  RETURN v_menu_item;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create optimized stored procedure for canceling reservations
CREATE OR REPLACE FUNCTION cancel_reservation(
  p_user_id UUID,
  p_menu_item_id UUID
) RETURNS menu_items AS $$
DECLARE
  v_menu_item menu_items%ROWTYPE;
  v_reservation reservations%ROWTYPE;
BEGIN
  -- Find and update the reservation
  SELECT * INTO v_reservation
  FROM reservations
  WHERE user_id = p_user_id 
    AND menu_item_id = p_menu_item_id 
    AND status = 'confirmed'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No active reservation found';
  END IF;

  -- Update reservation status
  UPDATE reservations
  SET status = 'cancelled'
  WHERE id = v_reservation.id;

  -- Update menu item count
  UPDATE menu_items
  SET reservations = GREATEST(0, reservations - 1)
  WHERE id = p_menu_item_id
  RETURNING * INTO v_menu_item;

  RETURN v_menu_item;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to reactivate a cancelled reservation
CREATE OR REPLACE FUNCTION reactivate_reservation(
  p_reservation_id UUID,
  p_menu_item_id UUID
) RETURNS menu_items AS $$
DECLARE
  v_menu_item menu_items%ROWTYPE;
BEGIN
  -- Get current menu item state and lock the row
  SELECT * INTO v_menu_item
  FROM menu_items
  WHERE id = p_menu_item_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Menu item not found';
  END IF;

  -- Check availability
  IF v_menu_item.quota <= v_menu_item.reservations THEN
    RAISE EXCEPTION 'No available spots';
  END IF;

  -- Update the reservation status
  UPDATE reservations
  SET status = 'confirmed'
  WHERE id = p_reservation_id
  AND status = 'cancelled';

  -- Update menu item count
  UPDATE menu_items
  SET reservations = reservations + 1
  WHERE id = p_menu_item_id
  RETURNING * INTO v_menu_item;

  RETURN v_menu_item;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;