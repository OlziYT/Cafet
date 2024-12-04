-- Enable Row Level Security
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Drop existing constraints and functions
DROP TRIGGER IF EXISTS check_reservation_status ON reservations;
DROP FUNCTION IF EXISTS check_reservation_status();
DROP FUNCTION IF EXISTS create_reservation(UUID, UUID);
DROP FUNCTION IF EXISTS cancel_reservation(UUID, UUID);
DROP INDEX IF EXISTS unique_active_reservation;
DROP POLICY IF EXISTS "Users can view their own reservations" ON reservations;
DROP POLICY IF EXISTS "Users can create their own reservations" ON reservations;
DROP POLICY IF EXISTS "Users can update their own reservations" ON reservations;
DROP POLICY IF EXISTS "Users can delete their own reservations" ON reservations;
DROP POLICY IF EXISTS "Admins can view all reservations" ON reservations;
DROP POLICY IF EXISTS "Admins can manage all reservations" ON reservations;
ALTER TABLE reservations DROP CONSTRAINT IF EXISTS unique_active_reservation;
ALTER TABLE reservations DROP CONSTRAINT IF EXISTS reservations_user_id_menu_item_id_key;
ALTER TABLE reservations DROP CONSTRAINT IF EXISTS fk_menu_item;
ALTER TABLE reservations DROP CONSTRAINT IF EXISTS fk_user;

-- Create foreign key constraints
ALTER TABLE reservations ADD CONSTRAINT fk_menu_item
    FOREIGN KEY (menu_item_id)
    REFERENCES menu_items(id)
    ON DELETE CASCADE;

ALTER TABLE reservations ADD CONSTRAINT fk_user
    FOREIGN KEY (user_id)
    REFERENCES profiles(id)
    ON DELETE CASCADE;

-- Add explicit relationship names for Supabase
COMMENT ON CONSTRAINT fk_menu_item ON reservations IS 'Menu item being reserved';
COMMENT ON CONSTRAINT fk_user ON reservations IS 'User who made the reservation';

-- Create unique constraint for active reservations
CREATE UNIQUE INDEX unique_active_reservation
    ON reservations (user_id, menu_item_id)
    WHERE status = 'confirmed';

-- Function to manage menu item deletion
CREATE OR REPLACE FUNCTION delete_menu_item_cascade(
    p_menu_item_id UUID
) RETURNS void AS $$
BEGIN
    DELETE FROM reservations
    WHERE menu_item_id = p_menu_item_id;

    DELETE FROM menu_items
    WHERE id = p_menu_item_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create reservations
CREATE OR REPLACE FUNCTION create_reservation(
    p_user_id UUID,
    p_menu_item_id UUID
) RETURNS menu_items AS $$
DECLARE
    v_menu_item menu_items%ROWTYPE;
    v_existing_reservation reservations%ROWTYPE;
BEGIN
    -- Check for existing confirmed reservation
    SELECT * INTO v_existing_reservation
    FROM reservations
    WHERE user_id = p_user_id 
    AND menu_item_id = p_menu_item_id
    AND status = 'confirmed';

    IF FOUND THEN
        RAISE EXCEPTION 'Active reservation already exists';
    END IF;

    -- Lock the menu item for update
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

    -- Create reservation
    INSERT INTO reservations (
        user_id,
        menu_item_id,
        status,
        picked_up
    ) VALUES (
        p_user_id,
        p_menu_item_id,
        'confirmed',
        false
    );

    -- Update menu item count
    UPDATE menu_items
    SET reservations = reservations + 1
    WHERE id = p_menu_item_id
    RETURNING * INTO v_menu_item;

    RETURN v_menu_item;
EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION 'Active reservation already exists';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cancel reservations
CREATE OR REPLACE FUNCTION cancel_reservation(
    p_user_id UUID,
    p_menu_item_id UUID
) RETURNS menu_items AS $$
DECLARE
    v_menu_item menu_items%ROWTYPE;
    v_reservation reservations%ROWTYPE;
BEGIN
    -- Find and lock the reservation
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

-- Row Level Security Policies
CREATE POLICY "Users can view their own reservations"
    ON reservations FOR SELECT
    USING (
        auth.uid() = user_id 
        OR 
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Users can create their own reservations"
    ON reservations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reservations"
    ON reservations FOR UPDATE
    USING (
        auth.uid() = user_id 
        OR 
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );