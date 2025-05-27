-- ========================================
--  Extension für UUID-Generierung
-- ========================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- ========================================
--  ENUM-Typen
-- ========================================
CREATE TYPE gender_enum AS ENUM ('männlich', 'weiblich', 'divers');
CREATE TYPE media_type_enum AS ENUM ('photo', 'video', 'clip', 'other');



-- ========================================
--  Lookup-Tabellen (alle mit UUIDs)
-- ========================================

-- Genre (m:n zu tv_show)
CREATE TABLE genre (
  genre_id   UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(100)    NOT NULL UNIQUE
);

-- Sender/Plattform
CREATE TABLE network (
  network_id UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(100)    NOT NULL UNIQUE,
  type       VARCHAR(50)     NOT NULL  -- z.B. 'TV', 'Streaming', 'Web'
);

-- Social-Media-Plattformen
CREATE TABLE social_media_platform (
  platform_id UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(50)     NOT NULL UNIQUE,  -- z.B. 'Instagram'
  base_url    VARCHAR(255)    NULL              -- z.B. 'https://instagram.com/'
);

-- Beziehungstypen zw. Persönlichkeiten
CREATE TABLE relation_type (
  relation_type_id UUID       PRIMARY KEY DEFAULT gen_random_uuid(),
  name             VARCHAR(50) NOT NULL UNIQUE  -- z.B. 'Ehepartner'
);



-- ========================================
--  Kerntabellen (alle mit UUIDs)
-- ========================================

-- Persönlichkeiten
CREATE TABLE personality (
  personality_id UUID                        PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name     VARCHAR(100)                NOT NULL,
  last_name      VARCHAR(100)                NOT NULL,
  birth_date     DATE                        NULL,
  birth_place    VARCHAR(255)                NULL,
  nationality    VARCHAR(100)                NULL,
  gender         gender_enum                 NULL,
  bio            TEXT                        NULL,
  profile_image  VARCHAR(255)                NULL,
  created_at     TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  updated_at     TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now()
);

-- TV-/Web-Formate (Trash TV, Reality etc.)
CREATE TABLE tv_show (
  show_id      UUID                        PRIMARY KEY DEFAULT gen_random_uuid(),
  title        VARCHAR(255)                NOT NULL,
  network_id   UUID                        NOT NULL
    REFERENCES network(network_id) ON UPDATE CASCADE ON DELETE RESTRICT,
  start_date   DATE                        NULL,
  end_date     DATE                        NULL,
  description  TEXT                        NULL,
  created_at   TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  updated_at   TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now()
);

-- Staffeln
CREATE TABLE season (
  season_id     UUID                        PRIMARY KEY DEFAULT gen_random_uuid(),
  show_id       UUID                        NOT NULL
    REFERENCES tv_show(show_id) ON UPDATE CASCADE ON DELETE CASCADE,
  season_number INTEGER                     NOT NULL,
  start_date    DATE                        NULL,
  end_date      DATE                        NULL,
  description   TEXT                        NULL,
  UNIQUE (show_id, season_number)
);

-- Episoden
CREATE TABLE episode (
  episode_id     UUID                        PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id      UUID                        NOT NULL
    REFERENCES season(season_id) ON UPDATE CASCADE ON DELETE CASCADE,
  episode_number INTEGER                     NOT NULL,
  title          VARCHAR(255)                NULL,
  air_date       DATE                        NULL,
  description    TEXT                        NULL,
  UNIQUE (season_id, episode_number)
);

-- m:n‐Relation tv_show ↔ genre
CREATE TABLE tv_show_genre (
  show_id  UUID REFERENCES tv_show(show_id) ON UPDATE CASCADE ON DELETE CASCADE,
  genre_id UUID REFERENCES genre(genre_id)   ON UPDATE CASCADE ON DELETE RESTRICT,
  PRIMARY KEY (show_id, genre_id)
);



-- ========================================
--  Verknüpfungen & Zusatzinfos (alle mit UUIDs)
-- ========================================

-- Auftritte in Formaten/Episoden
CREATE TABLE appearance (
  appearance_id   UUID                        PRIMARY KEY DEFAULT gen_random_uuid(),
  personality_id  UUID                        NOT NULL
    REFERENCES personality(personality_id) ON UPDATE CASCADE ON DELETE CASCADE,
  show_id         UUID                        NOT NULL
    REFERENCES tv_show(show_id) ON UPDATE CASCADE ON DELETE CASCADE,
  episode_id      UUID                        NULL
    REFERENCES episode(episode_id) ON UPDATE CASCADE ON DELETE SET NULL,
  role            VARCHAR(100)                NULL,   -- z.B. 'Gast', 'Teilnehmer'
  appearance_date DATE                        NULL,
  notes           TEXT                        NULL
);

-- Social-Media-Accounts
CREATE TABLE social_media_account (
  account_id     UUID                        PRIMARY KEY DEFAULT gen_random_uuid(),
  personality_id UUID                        NOT NULL
    REFERENCES personality(personality_id) ON UPDATE CASCADE ON DELETE CASCADE,
  platform_id    UUID                        NOT NULL
    REFERENCES social_media_platform(platform_id) ON UPDATE CASCADE ON DELETE RESTRICT,
  handle         VARCHAR(100)                NOT NULL,
  url            VARCHAR(255)                NOT NULL UNIQUE,
  created_at     TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  updated_at     TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now()
);

-- Follower-/Engagement-Verlauf
CREATE TABLE social_media_metric (
  metric_id       UUID                        PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id      UUID                        NOT NULL
    REFERENCES social_media_account(account_id) ON UPDATE CASCADE ON DELETE CASCADE,
  date            DATE                        NOT NULL,
  followers_count INTEGER                     NOT NULL CHECK (followers_count >= 0),
  engagement_rate NUMERIC(5,4)                NULL,
  UNIQUE (account_id, date)
);

-- Skandale & Kontroversen
CREATE TABLE controversy (
  controversy_id UUID                        PRIMARY KEY DEFAULT gen_random_uuid(),
  personality_id UUID                        NOT NULL
    REFERENCES personality(personality_id) ON UPDATE CASCADE ON DELETE CASCADE,
  title          VARCHAR(255)                NOT NULL,
  description    TEXT                        NOT NULL,
  date           DATE                        NOT NULL,
  source_url     VARCHAR(255)                NULL
);

-- Preise & Auszeichnungen
CREATE TABLE award (
  award_id       UUID                        PRIMARY KEY DEFAULT gen_random_uuid(),
  personality_id UUID                        NOT NULL
    REFERENCES personality(personality_id) ON UPDATE CASCADE ON DELETE CASCADE,
  award_name     VARCHAR(255)                NOT NULL,
  category       VARCHAR(255)                NULL,
  year           SMALLINT                    NOT NULL,
  organization   VARCHAR(255)                NULL
);

-- Beziehungen zwischen Persönlichkeiten
CREATE TABLE relationship (
  relationship_id   UUID                        PRIMARY KEY DEFAULT gen_random_uuid(),
  personality1_id   UUID                        NOT NULL
    REFERENCES personality(personality_id) ON UPDATE CASCADE ON DELETE CASCADE,
  personality2_id   UUID                        NOT NULL
    REFERENCES personality(personality_id) ON UPDATE CASCADE ON DELETE CASCADE,
  relation_type_id  UUID                        NOT NULL
    REFERENCES relation_type(relation_type_id) ON UPDATE CASCADE ON DELETE RESTRICT,
  since_date        DATE                        NULL,
  notes             TEXT                        NULL,
  UNIQUE (personality1_id, personality2_id, relation_type_id)
);

-- Externe Links (Wikipedia, IMDB etc.)
CREATE TABLE external_link (
  link_id        UUID                        PRIMARY KEY DEFAULT gen_random_uuid(),
  personality_id UUID                        NOT NULL
    REFERENCES personality(personality_id) ON UPDATE CASCADE ON DELETE CASCADE,
  type           VARCHAR(50)                 NOT NULL,
  url            VARCHAR(255)                NOT NULL
);

-- Medien (Fotos, Videos, Clips)
CREATE TABLE media (
  media_id       UUID                        PRIMARY KEY DEFAULT gen_random_uuid(),
  personality_id UUID                        NOT NULL
    REFERENCES personality(personality_id) ON UPDATE CASCADE ON DELETE CASCADE,
  type           media_type_enum             NOT NULL,
  url            VARCHAR(255)                NOT NULL,
  caption        VARCHAR(255)                NULL,
  created_at     TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE season_airing (
  airing_id    UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id    UUID      NOT NULL
    REFERENCES season(season_id) ON DELETE CASCADE,
  network_id   UUID      NOT NULL
    REFERENCES network(network_id) ON DELETE RESTRICT,
  premiere     DATE      NOT NULL,
  finale       DATE      NULL,
  UNIQUE(season_id, network_id)
);

ALTER TABLE season
  ADD COLUMN cast_count           SMALLINT,
  ADD COLUMN all_perfect_matches  BOOLEAN DEFAULT FALSE,
  ADD COLUMN total_prize_money    NUMERIC(12,2);

-- Eine Matching Night pro Season und Runde
CREATE TABLE matching_night (
  night_id     UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id    UUID      NOT NULL
    REFERENCES season(season_id) ON DELETE CASCADE,
  round_number INTEGER   NOT NULL,            -- 1..n
  date         DATE      NULL,
  UNIQUE(season_id, round_number)
);

-- Wer wählt wen in dieser Matching Night?
CREATE TABLE matching_choice (
  choice_id      UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  night_id       UUID      NOT NULL
    REFERENCES matching_night(night_id) ON DELETE CASCADE,
  chooser_id     UUID      NOT NULL
    REFERENCES personality(personality_id) ON DELETE CASCADE,
  chosen_id      UUID      NOT NULL
    REFERENCES personality(personality_id) ON DELETE CASCADE,
  is_perfect     BOOLEAN   NOT NULL DEFAULT FALSE,
  is_unconfirmed BOOLEAN   NOT NULL DEFAULT FALSE,
  UNIQUE(night_id, chooser_id)
);

-- Truth Booth–Ergebnisse pro Match Box
CREATE TABLE truth_booth (
  booth_id      UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id     UUID      NOT NULL
    REFERENCES season(season_id) ON DELETE CASCADE,
  match_box     INTEGER   NOT NULL,           -- 1..n
  p1_id         UUID      NOT NULL
    REFERENCES personality(personality_id) ON DELETE CASCADE,
  p2_id         UUID      NOT NULL
    REFERENCES personality(personality_id) ON DELETE CASCADE,
  result_enum   VARCHAR(20)  NOT NULL,        -- z.B. 'Perfect Match','No Match','Truth Booth Trade'
  note          TEXT      NULL,
  UNIQUE(season_id, match_box)
);