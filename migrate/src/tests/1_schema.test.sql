\unset ECHO \set QUIET 1 \set ON_ERROR_ROLLBACK 1 \set ON_ERROR_STOP true \pset format unaligned \pset tuples_only true \pset pager off


-- This tests that everything necessary is found in the database.
BEGIN;
SELECT plan(10);

SELECT schemas_are(
  ARRAY[
    'public',
    '${GRAPH_EDITOR_SCHEMA}',
    '${GRAPH_EDITOR_SCHEMA}_private'
  ], 'Has correct schemas.'
);

SELECT has_role('${GRAPH_EDITOR_SCHEMA}_anonymous', 'Has role anonymous.');
SELECT has_role('${GRAPH_EDITOR_SCHEMA}_person', 'Has role person.');
SELECT has_role('${GRAPH_EDITOR_SCHEMA}_postgraphile', 'Has role postgraphile.');
SELECT has_role('${DB_USER}', 'Has role ${DB_USER}.');


SELECT tables_are(
  '${GRAPH_EDITOR_SCHEMA}',
  ARRAY['person', 'graph'],
  'Has tables in public schema.'
);

SELECT tables_are(
  '${GRAPH_EDITOR_SCHEMA}_private',
  ARRAY['person_account'],
  'Has tables in private schema.'
);

SELECT has_function('${GRAPH_EDITOR_SCHEMA}', 'authenticate', ARRAY['text', 'text'], 'Function authenticate(text, text) is found.' );
SELECT has_function('${GRAPH_EDITOR_SCHEMA}', 'register_person', ARRAY['text', 'text'], 'Function register_person(text, text) is found.' );
SELECT has_function('${GRAPH_EDITOR_SCHEMA}', 'remove_person', ARRAY['text', 'text'], 'Function remove_person(text, text) is found.' );

-- Finish the tests and clean up.
SELECT * FROM finish();
ROLLBACK;