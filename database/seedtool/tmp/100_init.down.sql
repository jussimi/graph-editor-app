BEGIN;

DROP FUNCTION graph_editor.remove_person(text, text);
DROP FUNCTION graph_editor.register_person(text, text);
DROP FUNCTION graph_editor.authenticate(text, text);
DROP TYPE graph_editor.auth_token;
DROP TABLE graph_editor_private.person_account CASCADE;
DROP TABLE graph_editor.graph CASCADE;
DROP TABLE graph_editor.person CASCADE;
DROP FUNCTION trigger_set_timestamp();

DROP ROLE graph_editor_postgraphile;
DROP ROLE graph_editor_anonymous;
DROP ROLE graph_editor_person;

DROP SCHEMA graph_editor CASCADE;
DROP SCHEMA graph_editor_private CASCADE;


COMMIT;