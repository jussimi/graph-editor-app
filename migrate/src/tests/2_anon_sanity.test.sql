\unset ECHO \set QUIET 1 \set ON_ERROR_ROLLBACK 1 \set ON_ERROR_STOP true \pset format unaligned \pset tuples_only true \pset pager off

-- This tests that an anonymous user has only limited access.
BEGIN;

-- Create test data.
WITH person_insert_q AS (
  SELECT ${GRAPH_EDITOR_SCHEMA}.register_person(p->>'email', p->>'password')
  FROM jsonb_array_elements(
    '[
      { "email": "test1@mail.com", "password": "pass1" },
      { "email": "test2@mail.com", "password": "pass2" },
      { "email": "test3@mail.com", "password": "pass3" },
      { "email": "test4@mail.com", "password": "pass4" },
      { "email": "test5@mail.com", "password": "pass5" },
      { "email": "test6@mail.com", "password": "pass6" },
      { "email": "test7@mail.com", "password": "pass7" },
      { "email": "test8@mail.com", "password": "pass8" },
      { "email": "test9@mail.com", "password": "pass9" }
    ]'
  ) AS p
) SELECT format('Created %s test accounts.', count(p)) FROM person_insert_q p;

INSERT INTO ${GRAPH_EDITOR_SCHEMA}.graph(person_id, name)
SELECT
  p.id,
  unnest(
    ARRAY[
      format('first-for-person-%s', p.id),
      format('second-for-person-%s', p.id)
    ]
  )
FROM ${GRAPH_EDITOR_SCHEMA}.person p;

SELECT 
  set_config('jwt.claims.role', '${GRAPH_EDITOR_SCHEMA}_anonymous', true),
  set_config('role', '${GRAPH_EDITOR_SCHEMA}_anonymous', true);


-- Start test.
SELECT plan(12);

-- Anonymous access to person.
SELECT throws_ilike(
  'SELECT * FROM ${GRAPH_EDITOR_SCHEMA}.person',
  'permission denied for table person',
  'Anonymous can not select from table person.'
);

SELECT throws_ilike(
  'INSERT INTO ${GRAPH_EDITOR_SCHEMA}.person(email) VALUES (''test@email.fi'')',
  'permission denied for table person',
  'Anonymous can not insert into table person.'
);

SELECT throws_ilike(
  'DELETE FROM ${GRAPH_EDITOR_SCHEMA}.person',
  'permission denied for table person',
  'Anonymous can not delete from table person.'
);

SELECT throws_ilike(
  'UPDATE ${GRAPH_EDITOR_SCHEMA}.person SET updated_at = NOW()',
  'permission denied for table person',
  'Anonymous can not update table person.'
);

-- Anonymous access to graph.
SELECT throws_ilike(
  'SELECT * FROM ${GRAPH_EDITOR_SCHEMA}.graph',
  'permission denied for table graph',
  'Anonymous can not select from table graph.'
);

SELECT throws_ilike(
  'INSERT INTO ${GRAPH_EDITOR_SCHEMA}.graph(person_id) VALUES (111)',
  'permission denied for table graph',
  'Anonymous can not insert into table graph.'
);

SELECT throws_ilike(
  'DELETE FROM ${GRAPH_EDITOR_SCHEMA}.graph',
  'permission denied for table graph',
  'Anonymous can not delete from table graph.'
);

SELECT throws_ilike(
  'UPDATE ${GRAPH_EDITOR_SCHEMA}.graph SET updated_at = NOW()',
  'permission denied for table graph',
  'Anonymous can not update table graph.'
);

-- Anonoymous access to private-schema.
SELECT throws_ilike(
  'SELECT * FROM ${GRAPH_EDITOR_SCHEMA}_private.person_account',
  'permission denied for schema ${GRAPH_EDITOR_SCHEMA}_private',
  'Anonymous can not access schema ${GRAPH_EDITOR_SCHEMA}_private.'
);


-- Anonymous access to functions.
SELECT throws_ilike(
  'SELECT * FROM ${GRAPH_EDITOR_SCHEMA}.remove_person(''test@email.com'', ''testpass'')',
  'permission denied for function remove_person',
  'Anonymous can not run function remove_person(text, text).'
);

SELECT lives_ok(
  'SELECT * FROM ${GRAPH_EDITOR_SCHEMA}.register_person(''test@email.com'', ''testpass'')',
  'Anonymous can run function register_person(text, text).'
);

SELECT lives_ok(
  'SELECT * FROM ${GRAPH_EDITOR_SCHEMA}.authenticate(''test@email.com'', ''testpass'')',
  'Anonymous can run function authenticate(text, text).'
);

-- Finish the tests and clean up.
SELECT * FROM finish();
ROLLBACK;