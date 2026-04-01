-- Align emission session/input/result identifiers with DB-managed auto increment keys.
-- This removes the MAX()+1 race in concurrent save/calculate flows.
--
-- After enabling AUTO_INCREMENT on an existing populated table, CUBRID may leave the
-- backing serial at a low value. Re-align each generated serial to MAX(id)+1 before
-- sending live traffic. Example:
--   ALTER SERIAL emission_input_session_ai_session_id START WITH <MAX(session_id)+1>;
--   ALTER SERIAL emission_input_value_ai_input_value_id START WITH <MAX(input_value_id)+1>;
--   ALTER SERIAL emission_calc_result_ai_result_id START WITH <MAX(result_id)+1>;

ALTER TABLE emission_input_session
    CHANGE session_id session_id BIGINT AUTO_INCREMENT;

ALTER TABLE emission_input_value
    CHANGE input_value_id input_value_id BIGINT AUTO_INCREMENT;

ALTER TABLE emission_calc_result
    CHANGE result_id result_id BIGINT AUTO_INCREMENT;
