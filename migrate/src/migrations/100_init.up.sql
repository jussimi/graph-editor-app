BEGIN;

CREATE SCHEMA ${GRAPH_EDITOR_SCHEMA};
CREATE SCHEMA ${GRAPH_EDITOR_SCHEMA}_private;

CREATE ROLE ${GRAPH_EDITOR_SCHEMA}_postgraphile LOGIN PASSWORD '${GRAPH_EDITOR_USER_PASS}';
CREATE ROLE ${GRAPH_EDITOR_SCHEMA}_anonymous;
CREATE ROLE ${GRAPH_EDITOR_SCHEMA}_person;

GRANT ${GRAPH_EDITOR_SCHEMA}_anonymous TO ${GRAPH_EDITOR_SCHEMA}_postgraphile;
GRANT ${GRAPH_EDITOR_SCHEMA}_person TO ${GRAPH_EDITOR_SCHEMA}_postgraphile;
GRANT ${GRAPH_EDITOR_SCHEMA}_postgraphile TO ${DB_USER};

GRANT USAGE ON SCHEMA ${GRAPH_EDITOR_SCHEMA} TO ${GRAPH_EDITOR_SCHEMA}_postgraphile;
GRANT USAGE ON SCHEMA ${GRAPH_EDITOR_SCHEMA} TO ${GRAPH_EDITOR_SCHEMA}_anonymous;
GRANT USAGE ON SCHEMA ${GRAPH_EDITOR_SCHEMA} TO ${GRAPH_EDITOR_SCHEMA}_person;

--GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA ${GRAPH_EDITOR_SCHEMA} TO ${GRAPH_EDITOR_SCHEMA}_postgraphile;

ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TABLE ${GRAPH_EDITOR_SCHEMA}.person (
  id                   serial PRIMARY KEY,
  email                text NOT NULL UNIQUE CHECK(email ~* '^.+@.+\..+$'),
  created_at           timestamp DEFAULT NOW() NOT NULL,
  updated_at           timestamp DEFAULT NOW() NOT NULL
);
COMMENT ON TABLE ${GRAPH_EDITOR_SCHEMA}.person IS 'A user of the application';

-- Enable row-level-security and start index from 111, so that we can use test data for ids in range 1-110.
ALTER TABLE ${GRAPH_EDITOR_SCHEMA}.person ENABLE ROW LEVEL SECURITY;
ALTER SEQUENCE ${GRAPH_EDITOR_SCHEMA}.person_id_seq RESTART WITH 111;

CREATE TRIGGER set_timestamp BEFORE UPDATE ON ${GRAPH_EDITOR_SCHEMA}.person
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

-- Grant select and update(email) for person.
-- Note that insert and delete are handled by functions.
GRANT USAGE, SELECT ON SEQUENCE ${GRAPH_EDITOR_SCHEMA}.person_id_seq TO ${GRAPH_EDITOR_SCHEMA}_person;
GRANT SELECT, UPDATE(email) ON TABLE ${GRAPH_EDITOR_SCHEMA}.person TO ${GRAPH_EDITOR_SCHEMA}_person;

-- Allow ${GRAPH_EDITOR_SCHEMA}_person to only access own data.
CREATE POLICY ${GRAPH_EDITOR_SCHEMA}_person_all_access_to_person
  ON ${GRAPH_EDITOR_SCHEMA}.person
  FOR ALL
  TO ${GRAPH_EDITOR_SCHEMA}_person
  USING (id = current_setting('jwt.claims.person_id')::int);




CREATE TABLE ${GRAPH_EDITOR_SCHEMA}.graph (
  id                   serial PRIMARY KEY,
  person_id            integer REFERENCES ${GRAPH_EDITOR_SCHEMA}.person(id) ON DELETE CASCADE NOT NULL,
  name                 text NOT NULL,
  nodes                JSONB DEFAULT '[]' NOT NULL,
  edges                JSONB DEFAULT '[]' NOT NULL,
  updated_at           timestamp DEFAULT NOW() NOT NULL,
  created_at           timestamp DEFAULT NOW() NOT NULL,
  UNIQUE(person_id, name)
);
COMMENT ON TABLE ${GRAPH_EDITOR_SCHEMA}.graph IS 'A graph created by a person.';
COMMENT ON COLUMN ${GRAPH_EDITOR_SCHEMA}.graph.name IS 'A readable name for the graph.';
COMMENT ON COLUMN ${GRAPH_EDITOR_SCHEMA}.graph.nodes IS 'A json-array of nodes.';
COMMENT ON COLUMN ${GRAPH_EDITOR_SCHEMA}.graph.edges IS 'A json-array of edges.';

-- Enable row-level-security and start index from 111, so that we can use test data for ids in range 1-110.
ALTER TABLE ${GRAPH_EDITOR_SCHEMA}.graph ENABLE ROW LEVEL SECURITY;
ALTER SEQUENCE ${GRAPH_EDITOR_SCHEMA}.graph_id_seq RESTART WITH 111;

CREATE TRIGGER set_timestamp BEFORE UPDATE ON ${GRAPH_EDITOR_SCHEMA}.graph
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

-- Grant privileges.
GRANT USAGE, SELECT ON SEQUENCE ${GRAPH_EDITOR_SCHEMA}.graph_id_seq TO ${GRAPH_EDITOR_SCHEMA}_person;
GRANT
  SELECT,
  INSERT(person_id, name, nodes, edges),
  UPDATE(name, nodes, edges),
  DELETE ON TABLE ${GRAPH_EDITOR_SCHEMA}.graph TO ${GRAPH_EDITOR_SCHEMA}_person;

-- Allow ${GRAPH_EDITOR_SCHEMA}_person to only access graphs that have the same person_id as in the jwt.
CREATE POLICY ${GRAPH_EDITOR_SCHEMA}_person_all_access_to_graph
  ON ${GRAPH_EDITOR_SCHEMA}.graph
  FOR ALL
  TO ${GRAPH_EDITOR_SCHEMA}_person
  USING (person_id = current_setting('jwt.claims.person_id')::int);




CREATE TABLE ${GRAPH_EDITOR_SCHEMA}_private.person_account (
  person_id            integer REFERENCES ${GRAPH_EDITOR_SCHEMA}.person(id) ON DELETE CASCADE NOT NULL,
  password_hash        text NOT NULL,
  created_at           timestamp DEFAULT NOW() NOT NULL,
  updated_at           timestamp DEFAULT NOW() NOT NULL,
  UNIQUE(person_id)
);
COMMENT ON TABLE ${GRAPH_EDITOR_SCHEMA}_private.person_account IS 'Private information about the person.';
COMMENT ON COLUMN ${GRAPH_EDITOR_SCHEMA}_private.person_account.password_hash IS 'A hash of the person''s password.';

-- Enable row-level-security.
ALTER TABLE ${GRAPH_EDITOR_SCHEMA}.person ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_timestamp BEFORE UPDATE ON ${GRAPH_EDITOR_SCHEMA}_private.person_account
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

------------------------------------------------
-------------- FUNCTIONS -----------------------
------------------------------------------------

-- The below functions are marked with the keyword 'security definer',
-- which means that the functions are called with the owner's privileges.
-- This means that the statements inside the function bybass the row-level-security.


-- The type that postgraphile uses for creating json-web-tokens.
CREATE TYPE ${GRAPH_EDITOR_SCHEMA}.auth_token as (
  role text,
  person_id integer,
  exp bigint
);

-- Authentication function. This is called when logging in.
CREATE FUNCTION ${GRAPH_EDITOR_SCHEMA}.authenticate(
  email text,
  password text
) RETURNS ${GRAPH_EDITOR_SCHEMA}.auth_token AS $$
DECLARE
  account ${GRAPH_EDITOR_SCHEMA}_private.person_account;
BEGIN
  SELECT a.* INTO account
  FROM ${GRAPH_EDITOR_SCHEMA}_private.person_account a, ${GRAPH_EDITOR_SCHEMA}.person p
  WHERE p.email = $1 AND a.person_id = p.id;

  IF (account.person_id IS NULL) THEN
    RAISE EXCEPTION 'person-not-found';
  END IF;

  IF (account.password_hash = crypt($2, account.password_hash)) THEN
    RETURN (
      '${GRAPH_EDITOR_SCHEMA}_person',
      account.person_id,
      EXTRACT(epoch FROM (NOW() + interval '2 days'))
    )::${GRAPH_EDITOR_SCHEMA}.auth_token;
  ELSE
    RAISE EXCEPTION 'wrong-password';
  END IF;
END;
$$ language plpgsql strict security definer;
COMMENT ON FUNCTION ${GRAPH_EDITOR_SCHEMA}.authenticate(text, text) is 'Authenticates a person by email and password. Returns a JWT.';

-- Allow an anonymous user to authenticate.
GRANT EXECUTE ON FUNCTION ${GRAPH_EDITOR_SCHEMA}.authenticate(text, text) TO ${GRAPH_EDITOR_SCHEMA}_anonymous;



-- Person-registration function.
CREATE FUNCTION ${GRAPH_EDITOR_SCHEMA}.register_person(
  email text,
  password text
) RETURNS ${GRAPH_EDITOR_SCHEMA}.auth_token as $$
DECLARE
  person ${GRAPH_EDITOR_SCHEMA}.person;
BEGIN
  INSERT INTO ${GRAPH_EDITOR_SCHEMA}.person(email)
  VALUES ($1)
  RETURNING * INTO person;

  INSERT INTO ${GRAPH_EDITOR_SCHEMA}_private.person_account (person_id, password_hash)
  VALUES (person.id, crypt(password, gen_salt('bf')));

  RETURN (
    '${GRAPH_EDITOR_SCHEMA}_person',
    person.id,
    EXTRACT(epoch FROM (NOW() + interval '2 days'))
  )::${GRAPH_EDITOR_SCHEMA}.auth_token;
END;
$$ language plpgsql strict security definer;
COMMENT ON FUNCTION ${GRAPH_EDITOR_SCHEMA}.register_person(text, text) is 'Registers a person by email and password. Returns a JWT.';

-- Allow an anonymous user to register.
GRANT EXECUTE ON FUNCTION ${GRAPH_EDITOR_SCHEMA}.register_person(text, text) TO ${GRAPH_EDITOR_SCHEMA}_anonymous;


-- Function that removes a person from the database.
-- Note that this is the only way a person can delete the account.
CREATE FUNCTION ${GRAPH_EDITOR_SCHEMA}.remove_person(
  email text,
  password text
) RETURNS BOOLEAN AS $$
DECLARE
  person_id_from_jwt integer := current_setting('jwt.claims.person_id')::int;
  account ${GRAPH_EDITOR_SCHEMA}_private.person_account;
BEGIN
  SELECT a.* INTO account
  FROM ${GRAPH_EDITOR_SCHEMA}_private.person_account a, ${GRAPH_EDITOR_SCHEMA}.person p
  WHERE p.email = $1 AND p.id = a.person_id;

  -- Throw error if the person is trying to remove another person's account.
  IF (account.person_id != person_id_from_jwt) THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  IF (account.password_hash = crypt($2, account.password_hash)) THEN
    DELETE FROM ${GRAPH_EDITOR_SCHEMA}.person WHERE id = account.person_id;
  ELSE
    RAISE EXCEPTION 'wrong-password';
  END IF;

  RETURN true;
END;
$$ language plpgsql strict security definer;
COMMENT ON FUNCTION ${GRAPH_EDITOR_SCHEMA}.remove_person(text, text) is 'Removes an authenticated person by email and password.';

-- Only allow an authenticated user to run this function.
GRANT EXECUTE ON FUNCTION ${GRAPH_EDITOR_SCHEMA}.remove_person(text, text) TO ${GRAPH_EDITOR_SCHEMA}_person;


COMMIT;