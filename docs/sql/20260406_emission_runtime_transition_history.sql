CREATE TABLE emission_runtime_transition_history (
    history_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    scope VARCHAR(80) NOT NULL,
    category_code VARCHAR(50) NOT NULL,
    tier INT NOT NULL,
    transitioned_by VARCHAR(100) NOT NULL,
    transitioned_at DATETIME NOT NULL DEFAULT CURRENT_DATETIME,
    session_id BIGINT,
    result_id BIGINT,
    runtime_mode VARCHAR(30) NOT NULL,
    promotion_status VARCHAR(40) NOT NULL,
    promotion_message VARCHAR(2000),
    definition_formula_adopted_yn CHAR(1) NOT NULL DEFAULT 'N',
    legacy_total DOUBLE,
    definition_total DOUBLE,
    delta DOUBLE
);

CREATE INDEX idx_emission_runtime_transition_history_scope
    ON emission_runtime_transition_history (category_code, tier, transitioned_at);
