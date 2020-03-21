BEGIN;

CREATE SCHEMA graph_editor;
CREATE SCHEMA graph_editor_private;

CREATE ROLE graph_editor_postgraphile LOGIN PASSWORD 'graph_editor_postgraphile_pass';
CREATE ROLE graph_editor_anonymous;
CREATE ROLE graph_editor_person;

GRANT graph_editor_anonymous TO graph_editor_postgraphile;
GRANT graph_editor_person TO graph_editor_postgraphile;
GRANT graph_editor_postgraphile TO testuser;

GRANT USAGE ON SCHEMA graph_editor TO graph_editor_postgraphile;
GRANT USAGE ON SCHEMA graph_editor TO graph_editor_anonymous;
GRANT USAGE ON SCHEMA graph_editor TO graph_editor_person;

--GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA graph_editor TO graph_editor_postgraphile;

ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TABLE graph_editor.person (
  id                   serial PRIMARY KEY,
  email                text NOT NULL UNIQUE CHECK(email ~* '^.+@.+\..+$'),
  created_at           timestamp DEFAULT NOW() NOT NULL,
  updated_at           timestamp DEFAULT NOW() NOT NULL
);

ALTER TABLE graph_editor.person ENABLE ROW LEVEL SECURITY;
ALTER SEQUENCE graph_editor.person_id_seq RESTART WITH 111;

CREATE TRIGGER set_timestamp BEFORE UPDATE ON graph_editor.person
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

GRANT USAGE, SELECT ON SEQUENCE graph_editor.person_id_seq TO graph_editor_person;
GRANT SELECT, UPDATE(email) ON TABLE graph_editor.person TO graph_editor_person;

CREATE POLICY graph_editor_person_all_access_to_person
  ON graph_editor.person
  FOR ALL
  TO graph_editor_person
  USING (id = current_setting('jwt.claims.person_id')::int);




CREATE TABLE graph_editor.graph (
  id                   serial PRIMARY KEY,
  person_id            integer REFERENCES graph_editor.person(id) ON DELETE CASCADE NOT NULL,
  data                 JSONB DEFAULT '{}' NOT NULL,
  updated_at           timestamp DEFAULT NOW() NOT NULL,
  created_at           timestamp DEFAULT NOW() NOT NULL
);
ALTER TABLE graph_editor.graph ENABLE ROW LEVEL SECURITY;
ALTER SEQUENCE graph_editor.graph_id_seq RESTART WITH 111;

CREATE TRIGGER set_timestamp BEFORE UPDATE ON graph_editor.graph
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

GRANT USAGE, SELECT ON SEQUENCE graph_editor.graph_id_seq TO graph_editor_person;
GRANT SELECT, INSERT(person_id, data), UPDATE(data), DELETE ON TABLE graph_editor.graph TO graph_editor_person;

CREATE POLICY graph_editor_person_all_access_to_graph
  ON graph_editor.graph
  FOR ALL
  TO graph_editor_person
  USING (person_id = current_setting('jwt.claims.person_id')::int);




CREATE TABLE graph_editor_private.person_account (
  person_id            integer REFERENCES graph_editor.person(id) ON DELETE CASCADE NOT NULL,
  password_hash        text NOT NULL,
  created_at           timestamp DEFAULT NOW() NOT NULL,
  updated_at           timestamp DEFAULT NOW() NOT NULL,
  UNIQUE(person_id)
);
ALTER TABLE graph_editor.person ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_timestamp BEFORE UPDATE ON graph_editor_private.person_account
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();



CREATE TYPE graph_editor.auth_token as (
  role text,
  person_id integer,
  exp bigint
);

CREATE FUNCTION graph_editor.authenticate(
  email text,
  password text
) RETURNS graph_editor.auth_token AS $$
DECLARE
  account graph_editor_private.person_account;
BEGIN
  SELECT a.* INTO account
  FROM graph_editor_private.person_account a, graph_editor.person p
  WHERE p.email = $1 AND a.person_id = p.id;

  IF account.password_hash = crypt($2, account.password_hash) THEN
    RETURN (
      'graph_editor_person',
      account.person_id,
      EXTRACT(epoch FROM (NOW() + interval '2 days'))
    )::graph_editor.auth_token;
  ELSE
    RETURN NULL;
  END IF;
END;
$$ language plpgsql strict security definer;

GRANT EXECUTE ON FUNCTION graph_editor.authenticate(text, text) TO graph_editor_anonymous;


CREATE FUNCTION graph_editor.register_person(
  email text,
  password text
) RETURNS graph_editor.auth_token as $$
DECLARE
  person graph_editor.person;
BEGIN
  INSERT INTO graph_editor.person(email)
  VALUES ($1)
  RETURNING * INTO person;

  INSERT INTO graph_editor_private.person_account (person_id, password_hash)
  VALUES (person.id, crypt(password, gen_salt('bf')));

  RETURN (
    'graph_editor_person',
    person.id,
    EXTRACT(epoch FROM (NOW() + interval '2 days'))
  )::graph_editor.auth_token;
END;
$$ language plpgsql strict security definer;

GRANT EXECUTE ON FUNCTION graph_editor.register_person(text, text) TO graph_editor_anonymous;


CREATE FUNCTION graph_editor.remove_person(
  email text
) RETURNS BOOLEAN AS $$
DECLARE
  person_id_from_jwt integer := current_setting('jwt.claims.person_id')::int;
  person graph_editor.person;
BEGIN
  SELECT p.* INTO person FROM graph_editor.person p WHERE p.email = $1;

  IF (person.id != person_id_from_jwt) THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;
  
  DELETE FROM graph_editor.person WHERE id = person.id;

  RETURN true;
END;
$$ language plpgsql strict security definer;

GRANT EXECUTE ON FUNCTION graph_editor.remove_person(text) TO graph_editor_person;


COMMIT;