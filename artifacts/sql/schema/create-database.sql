CREATE TABLE categories
(
  uuid TEXT PRIMARY KEY,
  value TEXT,
  last_utc INTEGER DEFAULT 0
);
CREATE TABLE notes
(
  uuid TEXT PRIMARY KEY,
  fk_category_uuid TEXT,
  fk_priority_uuid TEXT,
  fk_status_uuid TEXT,
  fk_user_uuid TEXT,
  fk_modified_user_uuid TEXT,
  server_uuid TEXT,
  created_date TEXT,
  modified_date TEXT,
  last_utc INTEGER DEFAULT 0,
  opt_in INTEGER DEFAULT 1,
  title TEXT,
  details TEXT,
  FOREIGN KEY (fk_category_uuid) REFERENCES categories (uuid) DEFERRABLE INITIALLY DEFERRED,
  FOREIGN KEY (fk_priority_uuid) REFERENCES priorities (uuid) DEFERRABLE INITIALLY DEFERRED,
  FOREIGN KEY (fk_status_uuid) REFERENCES status (uuid) DEFERRABLE INITIALLY DEFERRED,
  FOREIGN KEY (fk_user_uuid) REFERENCES users (uuid) DEFERRABLE INITIALLY DEFERRED
);
CREATE TABLE priorities
(
  uuid TEXT PRIMARY KEY,
  value TEXT,
  last_utc INTEGER DEFAULT 0
);
CREATE TABLE status
(
  uuid TEXT PRIMARY KEY,
  value TEXT,
  last_utc INTEGER DEFAULT 0
);
CREATE TABLE users
(
  uuid TEXT PRIMARY KEY,
  friendly_name TEXT,
  email TEXT,
  opt_in INTEGER DEFAULT 1,
  last_utc INTEGER DEFAULT 0
);
