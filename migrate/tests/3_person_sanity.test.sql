\unset ECHO \set QUIET 1 \set ON_ERROR_ROLLBACK 1 \set ON_ERROR_STOP true \pset format unaligned \pset tuples_only true \pset pager off

\set test_person_id '1'
-- This tests that a person can only access own data.
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
  p.email
FROM ${GRAPH_EDITOR_SCHEMA}.person p;

-- Create a test person with known id = 1.
INSERT INTO ${GRAPH_EDITOR_SCHEMA}.person(id, email) VALUES ((:test_person_id)::int, 'person@test.fi');
SELECT 
  set_config('jwt.claims.role', '${GRAPH_EDITOR_SCHEMA}_person', true),
  set_config('jwt.claims.person_id', :test_person_id::text, true),
  set_config('role', '${GRAPH_EDITOR_SCHEMA}_person', true);


-- Start test.
SELECT plan(13);

-- Person access to person.
SELECT throws_ilike(
  'INSERT INTO ${GRAPH_EDITOR_SCHEMA}.person(email) VALUES (''test@email.fi'')',
  'permission denied for table person',
  'Person can not insert into table person.'
);

SELECT throws_ilike(
  'DELETE FROM ${GRAPH_EDITOR_SCHEMA}.person',
  'permission denied for table person',
  'Person can not delete from table person.'
);

PREPARE person_select AS SELECT id FROM ${GRAPH_EDITOR_SCHEMA}.person;
PREPARE person_select_result AS SELECT :test_person_id;
SELECT results_eq(
  'person_select',
  'person_select_result',
  'Person can select person but only sees own data.'
);

PREPARE person_update AS UPDATE ${GRAPH_EDITOR_SCHEMA}.person SET email = 'updated@mail.com' RETURNING id;
PREPARE person_update_result AS SELECT :test_person_id;
SELECT results_eq(
  'person_update',
  'person_update_result',
  'Person can update person but only own data.'
);


-- Person access to graph.
PREPARE graph_insert AS INSERT INTO ${GRAPH_EDITOR_SCHEMA}.graph(person_id, name) VALUES (:test_person_id, 'test-graph');
SELECT lives_ok(
  'graph_insert',
  'Person can insert into table graph for own id.'
);

SELECT throws_ilike(
  'INSERT INTO ${GRAPH_EDITOR_SCHEMA}.graph(person_id, name) VALUES (111, ''test-graph'')',
  'new row violates row-level security policy for table "graph"',
  'Person can not insert graphs to other people'
);

PREPARE graph_select AS SELECT person_id FROM ${GRAPH_EDITOR_SCHEMA}.graph;
PREPARE graph_select_result AS SELECT :test_person_id;
SELECT results_eq(
  'graph_select',
  'graph_select_result',
  'Person can select graphs but only sees own data.'
);

PREPARE graph_update AS UPDATE ${GRAPH_EDITOR_SCHEMA}.graph g SET name = format('update-%s', g.name) RETURNING person_id;
PREPARE graph_update_result AS SELECT :test_person_id;
SELECT results_eq(
  'graph_update',
  'graph_update_result',
  'Person can update own graphs.'
);

PREPARE graph_delete_result AS SELECT :test_person_id;
SELECT results_eq(
  'DELETE FROM ${GRAPH_EDITOR_SCHEMA}.graph RETURNING person_id',
  'graph_delete_result',
  'Person can delete own graphs.'
);


-- Person access to private-schema.
SELECT throws_ilike(
  'SELECT * FROM ${GRAPH_EDITOR_SCHEMA}_private.person_account',
  'permission denied for schema ${GRAPH_EDITOR_SCHEMA}_private',
  'Person can not access schema ${GRAPH_EDITOR_SCHEMA}_private.'
);


-- Person access to functions.
SELECT throws_ilike(
  'SELECT * FROM ${GRAPH_EDITOR_SCHEMA}.register_person(''test@email.com'', ''testpass'')',
  'permission denied for function register_person',
  'Person can not run function register_person(text, text).'
);

SELECT throws_ilike(
  'SELECT * FROM ${GRAPH_EDITOR_SCHEMA}.authenticate(''test@email.com'', ''testpass'')',
  'permission denied for function authenticate',
  'Person can not run function authenticate(text, text).'
);

SELECT throws_ilike(
  'SELECT * FROM ${GRAPH_EDITOR_SCHEMA}.remove_person(''test@email.com'', ''testpass'')',
  'wrong-password',
  'Person can run function remove_person(text, text).'
);


-- Finish the tests and clean up.
SELECT * FROM finish();
ROLLBACK;