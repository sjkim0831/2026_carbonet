CREATE TABLE emission_materialization_history (
    history_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    scope VARCHAR(80) NOT NULL,
    category_code VARCHAR(50) NOT NULL,
    tier INT NOT NULL,
    draft_id VARCHAR(120),
    published_version_id VARCHAR(120),
    materialized_by VARCHAR(100) NOT NULL,
    materialized_at DATETIME NOT NULL DEFAULT CURRENT_DATETIME,
    created_category_yn CHAR(1) NOT NULL DEFAULT 'N',
    inserted_variable_count INT NOT NULL DEFAULT 0,
    updated_variable_count INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_emission_materialization_history_scope
    ON emission_materialization_history (category_code, tier, materialized_at);
