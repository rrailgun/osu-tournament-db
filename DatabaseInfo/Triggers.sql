-- When a team is created, this will automatically set the captains TEAM_ACR to the new teams acronym.
DROP TRIGGER IF EXISTS assign_team_acr_to_players ON teams;
CREATE OR REPLACE FUNCTION set_players_team_acr()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE players SET team_acr = NEW.acronym WHERE NEW.captain = player_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER assign_team_acr_to_players
AFTER INSERT ON teams
FOR EACH ROW
EXECUTE FUNCTION set_players_team_acr();