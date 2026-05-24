-- Keep PostgreSQL test databases aligned with the booking path used in code.
-- The application calls this function from BookingRepository.holdSeatsViaProcedure().
CREATE OR REPLACE FUNCTION public.hold_seats_procedure(
  p_user_id uuid,
  p_event_id uuid,
  p_seat_ids uuid[]
)
RETURNS TABLE(status text, message text)
LANGUAGE plpgsql
AS $$
DECLARE
  v_seat_ids uuid[];
  v_requested_count integer;
  v_existing_locked_count integer;
  v_matching_count integer;
  v_available_count integer;
BEGIN
  SELECT COALESCE(array_agg(DISTINCT seat_id), ARRAY[]::uuid[])
  INTO v_seat_ids
  FROM unnest(COALESCE(p_seat_ids, ARRAY[]::uuid[])) AS seat_input(seat_id)
  WHERE seat_id IS NOT NULL;

  v_requested_count := COALESCE(array_length(v_seat_ids, 1), 0);

  IF p_user_id IS NULL OR p_event_id IS NULL THEN
    RETURN QUERY SELECT 'FAILED', 'Thong tin nguoi dung hoac su kien khong hop le.';
    RETURN;
  END IF;

  IF v_requested_count = 0 THEN
    RETURN QUERY SELECT 'FAILED', 'Ban phai chon it nhat mot ghe.';
    RETURN;
  END IF;

  IF v_requested_count > 4 THEN
    RETURN QUERY SELECT 'FAILED', 'Ban chi duoc giu toi da 4 ghe trong 1 su kien.';
    RETURN;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM events WHERE id = p_event_id) THEN
    RETURN QUERY SELECT 'FAILED', 'Su kien khong ton tai.';
    RETURN;
  END IF;

  -- Serialize holds by user/event so the "max 4 seats" rule stays correct
  -- when the same user sends concurrent requests.
  PERFORM pg_advisory_xact_lock(hashtext(p_user_id::text || ':' || p_event_id::text)::bigint);

  SELECT COUNT(*)
  INTO v_existing_locked_count
  FROM seats s
  JOIN zones z ON z.id = s.zone_id
  WHERE s.locked_by = p_user_id
    AND s.status = 'LOCKED'
    AND z.event_id = p_event_id
    AND NOT (s.id = ANY(v_seat_ids));

  IF v_existing_locked_count + v_requested_count > 4 THEN
    RETURN QUERY SELECT 'FAILED', 'Ban chi duoc giu toi da 4 ghe trong 1 su kien.';
    RETURN;
  END IF;

  WITH requested AS (
    SELECT unnest(v_seat_ids) AS id
  ),
  locked_rows AS (
    SELECT s.id, s.status AS seat_status
    FROM seats s
    JOIN zones z ON z.id = s.zone_id
    JOIN requested r ON r.id = s.id
    WHERE z.event_id = p_event_id
    ORDER BY s.id
    FOR UPDATE OF s
  )
  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE seat_status = 'AVAILABLE')
  INTO v_matching_count, v_available_count
  FROM locked_rows;

  IF v_matching_count <> v_requested_count THEN
    RETURN QUERY SELECT 'FAILED', 'Mot hoac nhieu ghe khong thuoc su kien nay.';
    RETURN;
  END IF;

  IF v_available_count <> v_requested_count THEN
    RETURN QUERY SELECT 'FAILED', 'Mot hoac nhieu ghe da co nguoi giu hoac da ban.';
    RETURN;
  END IF;

  UPDATE seats
  SET
    status = 'LOCKED',
    locked_by = p_user_id,
    locked_at = now()
  WHERE id = ANY(v_seat_ids);

  RETURN QUERY SELECT 'SUCCESS', 'Giu ghe thanh cong.';
END;
$$;
