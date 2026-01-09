#!/bin/sh
set -eu

# Creates a dedicated database for integration tests.
# Runs only on first initialization of the Postgres data directory.

TEST_DB_NAME="${POSTGRES_TEST_DB:-quizdb_test}"
POSTGRES_USERNAME="${POSTGRES_USER:-quizapp}"

if psql -v ON_ERROR_STOP=1 --username "${POSTGRES_USERNAME}" --dbname "postgres" -tAc \
	"SELECT 1 FROM pg_database WHERE datname='${TEST_DB_NAME}'" | grep -q 1; then
	echo "Test database already exists: ${TEST_DB_NAME}"
else
	createdb --username "${POSTGRES_USERNAME}" "${TEST_DB_NAME}"
	echo "Created test database: ${TEST_DB_NAME}"
fi
