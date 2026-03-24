-- Screen family and context management draft schema
-- Generated on 2026-03-24

create table if not exists screen_family_info (
  family_id            varchar(40) primary key,
  family_code          varchar(100) not null unique,
  family_name          varchar(200) not null,
  domain_code          varchar(100) not null,
  description          varchar(1000),
  use_at               char(1) not null default 'Y',
  frst_regist_pnttm    datetime default current_timestamp,
  last_updt_pnttm      datetime default current_timestamp
);

create table if not exists screen_info (
  screen_id            varchar(40) primary key,
  screen_code          varchar(100) not null unique,
  screen_name          varchar(200) not null,
  screen_url           varchar(500) not null unique,
  screen_type          varchar(50) not null,
  family_id            varchar(40) not null,
  feature_code         varchar(100),
  route_id             varchar(100),
  page_id              varchar(100),
  use_at               char(1) not null default 'Y',
  frst_regist_pnttm    datetime default current_timestamp,
  last_updt_pnttm      datetime default current_timestamp,
  constraint fk_screen_info_family
    foreign key (family_id) references screen_family_info (family_id)
);

create table if not exists screen_flow_info (
  flow_id              varchar(40) primary key,
  from_screen_id       varchar(40) not null,
  to_screen_id         varchar(40) not null,
  action_code          varchar(100) not null,
  flow_type            varchar(50) not null,
  use_at               char(1) not null default 'Y',
  frst_regist_pnttm    datetime default current_timestamp,
  last_updt_pnttm      datetime default current_timestamp,
  constraint fk_screen_flow_from
    foreign key (from_screen_id) references screen_info (screen_id),
  constraint fk_screen_flow_to
    foreign key (to_screen_id) references screen_info (screen_id)
);

create table if not exists screen_context_rule (
  rule_id              varchar(40) primary key,
  screen_id            varchar(40) not null,
  menu_no              integer not null,
  active_menu_no       integer not null,
  breadcrumb_menu_no   integer,
  visible_in_menu_at   char(1) not null default 'Y',
  landing_at           char(1) not null default 'N',
  use_at               char(1) not null default 'Y',
  frst_regist_pnttm    datetime default current_timestamp,
  last_updt_pnttm      datetime default current_timestamp,
  constraint fk_screen_context_rule_screen
    foreign key (screen_id) references screen_info (screen_id)
);

create table if not exists screen_binding_info (
  binding_id           varchar(40) primary key,
  screen_id            varchar(40) not null,
  api_code             varchar(100),
  query_schema_json    clob,
  form_schema_json     clob,
  table_schema_json    clob,
  excel_schema_json    clob,
  use_at               char(1) not null default 'Y',
  frst_regist_pnttm    datetime default current_timestamp,
  last_updt_pnttm      datetime default current_timestamp,
  constraint fk_screen_binding_info_screen
    foreign key (screen_id) references screen_info (screen_id)
);

create table if not exists screen_template_rule (
  template_rule_id     varchar(40) primary key,
  screen_type          varchar(50) not null,
  template_code        varchar(100) not null,
  layout_contract_json clob not null,
  use_at               char(1) not null default 'Y',
  frst_regist_pnttm    datetime default current_timestamp,
  last_updt_pnttm      datetime default current_timestamp
);

create index if not exists idx_screen_info_family_id
  on screen_info (family_id);

create index if not exists idx_screen_flow_from_screen
  on screen_flow_info (from_screen_id);

create index if not exists idx_screen_flow_to_screen
  on screen_flow_info (to_screen_id);

create index if not exists idx_screen_context_menu_no
  on screen_context_rule (menu_no);

create index if not exists idx_screen_context_active_menu_no
  on screen_context_rule (active_menu_no);

-- Seed examples for member-management
insert into screen_family_info (family_id, family_code, family_name, domain_code, description)
values ('FAM_MEMBER_MGMT', 'member-management', '회원 관리', 'ADMIN_MEMBER', '회원 목록, 상세, 수정, 승인, 휴면, 탈퇴 등 회원 관리 화면군');

insert into screen_info (screen_id, screen_code, screen_name, screen_url, screen_type, family_id, feature_code, route_id, page_id)
values
  ('SCR_MEMBER_LIST', 'member_list', '회원 목록', '/admin/member/list', 'LIST', 'FAM_MEMBER_MGMT', 'PAGE_MEMBER_LIST_VIEW', 'member_list', 'member-list'),
  ('SCR_MEMBER_DETAIL', 'member_detail', '회원 상세', '/admin/member/detail', 'DETAIL', 'FAM_MEMBER_MGMT', 'PAGE_MEMBER_DETAIL_VIEW', 'member_detail', 'member-detail'),
  ('SCR_MEMBER_EDIT', 'member_edit', '회원 수정', '/admin/member/edit', 'EDIT', 'FAM_MEMBER_MGMT', 'PAGE_MEMBER_EDIT_VIEW', 'member_edit', 'member-edit'),
  ('SCR_MEMBER_REGISTER', 'member_register', '신규 회원 등록', '/admin/member/register', 'CREATE', 'FAM_MEMBER_MGMT', 'PAGE_MEMBER_REGISTER_VIEW', 'member_register', 'member-register'),
  ('SCR_MEMBER_APPROVE', 'member_approve', '가입 승인', '/admin/member/approve', 'APPROVE', 'FAM_MEMBER_MGMT', 'PAGE_MEMBER_APPROVE_VIEW', 'member_approve', 'member-approve'),
  ('SCR_MEMBER_WITHDRAWN', 'member_withdrawn', '탈퇴 회원', '/admin/member/withdrawn', 'LIST', 'FAM_MEMBER_MGMT', 'PAGE_MEMBER_WITHDRAWN_VIEW', 'member_withdrawn', 'member-withdrawn'),
  ('SCR_MEMBER_ACTIVATE', 'member_activate', '휴면 계정', '/admin/member/activate', 'LIST', 'FAM_MEMBER_MGMT', 'PAGE_MEMBER_ACTIVATE_VIEW', 'member_activate', 'member-activate');

insert into screen_flow_info (flow_id, from_screen_id, to_screen_id, action_code, flow_type)
values
  ('FLOW_MEMBER_LIST_DETAIL', 'SCR_MEMBER_LIST', 'SCR_MEMBER_DETAIL', 'ROW_CLICK', 'LIST_TO_DETAIL'),
  ('FLOW_MEMBER_DETAIL_EDIT', 'SCR_MEMBER_DETAIL', 'SCR_MEMBER_EDIT', 'EDIT', 'DETAIL_TO_EDIT'),
  ('FLOW_MEMBER_LIST_REGISTER', 'SCR_MEMBER_LIST', 'SCR_MEMBER_REGISTER', 'CREATE', 'LIST_TO_CREATE'),
  ('FLOW_MEMBER_LIST_WITHDRAWN', 'SCR_MEMBER_LIST', 'SCR_MEMBER_WITHDRAWN', 'WITHDRAWN', 'LIST_TO_DETAIL'),
  ('FLOW_MEMBER_LIST_ACTIVATE', 'SCR_MEMBER_LIST', 'SCR_MEMBER_ACTIVATE', 'ACTIVATE', 'LIST_TO_DETAIL');

-- Example menu_no values are placeholders and must be aligned to COMTNMENUINFO at install time.
insert into screen_context_rule (rule_id, screen_id, menu_no, active_menu_no, breadcrumb_menu_no, visible_in_menu_at, landing_at)
values
  ('RULE_MEMBER_LIST', 'SCR_MEMBER_LIST', 10010101, 10010101, 10010101, 'Y', 'Y'),
  ('RULE_MEMBER_DETAIL', 'SCR_MEMBER_DETAIL', 10010104, 10010101, 10010101, 'N', 'N'),
  ('RULE_MEMBER_EDIT', 'SCR_MEMBER_EDIT', 10010105, 10010101, 10010101, 'N', 'N'),
  ('RULE_MEMBER_REGISTER', 'SCR_MEMBER_REGISTER', 10010102, 10010102, 10010102, 'Y', 'N'),
  ('RULE_MEMBER_APPROVE', 'SCR_MEMBER_APPROVE', 10010103, 10010103, 10010103, 'Y', 'N'),
  ('RULE_MEMBER_WITHDRAWN', 'SCR_MEMBER_WITHDRAWN', 10010106, 10010106, 10010106, 'Y', 'N'),
  ('RULE_MEMBER_ACTIVATE', 'SCR_MEMBER_ACTIVATE', 10010107, 10010107, 10010107, 'Y', 'N');
