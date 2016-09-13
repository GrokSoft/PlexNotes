--
-- The database for PlexNotes is created by the PlexNotes program.
-- This DDL was generated from that database for documentation purposes.
--
-- Last updated: 12 September 2016
--

CREATE TABLE categories
(
  uuid TEXT PRIMARY KEY NOT NULL,
  last_utc INTEGER,
  value TEXT
);
CREATE TABLE notes
(
  uuid TEXT PRIMARY KEY NOT NULL,
  fk_categories_uuid TEXT,
  fk_priorities_uuid TEXT,
  fk_statuses_uuid TEXT,
  fk_users_uuid TEXT,
  fk_modifier_users_uuid TEXT,
  plex_server_uuid TEXT,
  created_date INTEGER,
  modified_date INTEGER,
  last_utc INTEGER,
  title TEXT,
  details TEXT,
  opt_in INTEGER,
  FOREIGN KEY (fk_categories_uuid) REFERENCES  DEFERRABLE INITIALLY DEFERRED,
  FOREIGN KEY (fk_priorities_uuid) REFERENCES  DEFERRABLE INITIALLY DEFERRED,
  FOREIGN KEY (fk_statuses_uuid) REFERENCES  DEFERRABLE INITIALLY DEFERRED,
  FOREIGN KEY (fk_users_uuid) REFERENCES  DEFERRABLE INITIALLY DEFERRED
);
CREATE TABLE priorities
(
  uuid TEXT PRIMARY KEY NOT NULL,
  last_utc INTEGER,
  value TEXT
);
CREATE TABLE statuses
(
  uuid TEXT PRIMARY KEY NOT NULL,
  last_utc INTEGER,
  value TEXT
);
CREATE TABLE users
(
  uuid TEXT PRIMARY KEY NOT NULL,
  plex_user_uuid TEXT,
  last_utc INTEGER,
  friendly_name TEXT,
  email TEXT,
  opt_in INTEGER,
  role INTEGER DEFAULT 0
);
