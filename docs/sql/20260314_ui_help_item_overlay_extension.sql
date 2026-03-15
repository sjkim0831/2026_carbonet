-- Carbonet help overlay extension
-- Generated on 2026-03-14
-- Target DB: CUBRID-compatible SQL draft
--
-- Purpose:
-- Extend existing UI_HELP_ITEM rows so help overlay can render
-- placement, image, icon, CTA button, and highlight style.

ALTER TABLE UI_HELP_ITEM ADD COLUMN PLACEMENT VARCHAR(20) DEFAULT 'top' NOT NULL;
ALTER TABLE UI_HELP_ITEM ADD COLUMN IMAGE_URL VARCHAR(1000);
ALTER TABLE UI_HELP_ITEM ADD COLUMN ICON_NAME VARCHAR(80);
ALTER TABLE UI_HELP_ITEM ADD COLUMN HIGHLIGHT_STYLE VARCHAR(30) DEFAULT 'focus' NOT NULL;
ALTER TABLE UI_HELP_ITEM ADD COLUMN CTA_LABEL VARCHAR(120);
ALTER TABLE UI_HELP_ITEM ADD COLUMN CTA_URL VARCHAR(1000);

-- Normalize old rows.
UPDATE UI_HELP_ITEM
SET PLACEMENT = 'top'
WHERE PLACEMENT IS NULL OR TRIM(PLACEMENT) = '';

UPDATE UI_HELP_ITEM
SET HIGHLIGHT_STYLE = 'focus'
WHERE HIGHLIGHT_STYLE IS NULL OR TRIM(HIGHLIGHT_STYLE) = '';

-- Optional example seed updates.
UPDATE UI_HELP_ITEM
SET ICON_NAME = 'receipt_long',
    PLACEMENT = 'right',
    HIGHLIGHT_STYLE = 'focus',
    CTA_LABEL = '운영 화면 열기',
    CTA_URL = '/admin/system/observability'
WHERE PAGE_ID = 'observability'
  AND ITEM_ID = 'audit';

UPDATE UI_HELP_ITEM
SET ICON_NAME = 'account_tree',
    PLACEMENT = 'left',
    HIGHLIGHT_STYLE = 'success'
WHERE PAGE_ID = 'observability'
  AND ITEM_ID = 'trace';
