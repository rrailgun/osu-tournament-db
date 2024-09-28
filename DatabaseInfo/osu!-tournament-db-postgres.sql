CREATE TABLE "players" (
  "player_id" varchar PRIMARY KEY,
  "username" varchar,
  "team_acr" char(3)
);

CREATE TABLE "staff" (
  "user_id" varchar PRIMARY KEY,
  "username" varchar,
  "role" varchar
);

CREATE TABLE "teams" (
  "acronym" char(3) PRIMARY KEY,
  "teamname" varchar UNIQUE NOT NULL,
  "captain" varchar,
  "seed" integer
);

CREATE TABLE "tourney_round" (
  "round_name" varchar PRIMARY KEY,
  "round_acronym" varchar NOT NULL
);

CREATE TABLE "maps" (
  "beatmap_id" varchar PRIMARY KEY,
  "tourney_round_name" varchar,
  "slot_name" varchar
);

CREATE TABLE "mappools" (
  "slot_name" varchar PRIMARY KEY,
  "mod_acronym" varchar
);

CREATE TABLE "matches" (
  "match_id" integer PRIMARY KEY,
  "match_date" date,
  "team1_acr" char(3),
  "team2_acr" char(3),
  "mp_id" varchar,
  "tourney_round_name" varchar,
  "winning_team" varchar,
  "referee" varchar
);

CREATE TABLE "player_scores" (
  "match_id" integer,
  "beatmap_id" varchar,
  "player_id" varchar,
  "score" integer NOT NULL,
  PRIMARY KEY ("match_id", "beatmap_id", "player_id")
);

ALTER TABLE "players" ADD FOREIGN KEY ("team_acr") REFERENCES "teams" ("acronym");

ALTER TABLE "teams" ADD FOREIGN KEY ("captain") REFERENCES "players" ("player_id");

ALTER TABLE "maps" ADD FOREIGN KEY ("tourney_round_name") REFERENCES "tourney_round" ("round_name");

ALTER TABLE "maps" ADD FOREIGN KEY ("slot_name") REFERENCES "mappools" ("slot_name");

ALTER TABLE "matches" ADD FOREIGN KEY ("team1_acr") REFERENCES "teams" ("acronym");

ALTER TABLE "matches" ADD FOREIGN KEY ("team2_acr") REFERENCES "teams" ("acronym");

ALTER TABLE "matches" ADD FOREIGN KEY ("tourney_round_name") REFERENCES "tourney_round" ("round_name");

ALTER TABLE "matches" ADD FOREIGN KEY ("referee") REFERENCES "staff" ("user_id");

ALTER TABLE "player_scores" ADD FOREIGN KEY ("match_id") REFERENCES "matches" ("match_id");

ALTER TABLE "player_scores" ADD FOREIGN KEY ("beatmap_id") REFERENCES "maps" ("beatmap_id");

ALTER TABLE "player_scores" ADD FOREIGN KEY ("player_id") REFERENCES "players" ("player_id");
