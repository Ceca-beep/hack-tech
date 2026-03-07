"""
Seed script: runs schema_v3.sql against the database via psql.

Usage:
    cd backend
    python seed.py
"""

import os
import subprocess
import sys
from urllib.parse import urlparse

from dotenv import load_dotenv

# Load .env from project root
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))


def main():
    database_url = os.environ.get("DATABASE_URL", "")
    # Normalise driver prefix so urlparse works
    pg_url = database_url.replace("postgresql+asyncpg://", "postgresql://")

    parsed = urlparse(pg_url)
    host = parsed.hostname or "localhost"
    port = str(parsed.port or 5432)
    dbname = parsed.path.lstrip("/")
    user = parsed.username or "postgres"
    password = parsed.password or ""

    schema_path = os.path.join(os.path.dirname(__file__), "..", "schema_v3.sql")
    if not os.path.exists(schema_path):
        print(f"Schema file not found: {schema_path}")
        sys.exit(1)

    print(f"Connecting to {host}:{port}/{dbname}...")

    # Drop and recreate public schema for a clean slate, then run the SQL file.
    # Using psql inside the docker container avoids needing psql on the host
    # and avoids the broken semicolon-splitting that asyncpg needed.
    project_dir = os.path.join(os.path.dirname(__file__), "..")
    docker_base = ["docker", "compose", "-f", os.path.join(project_dir, "docker-compose.yml"),
                   "exec", "-T", "-e", f"PGPASSWORD={password}",
                   "postgres", "psql", "-U", user, "-d", dbname]

    print("Resetting schema...")
    subprocess.run(
        docker_base + ["-c", "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"],
        check=True,
    )

    print("Running schema_v3.sql...")
    with open(schema_path, "r") as f:
        result = subprocess.run(
            docker_base,
            stdin=f,
            capture_output=True,
            text=True,
        )
    if result.stdout:
        # Only show non-trivial output
        for line in result.stdout.splitlines():
            if line and not line.startswith(("CREATE", "INSERT", "ALTER", "COMMENT")):
                print(line)
    if result.returncode != 0:
        print(result.stderr)
        sys.exit(1)

    print("Schema applied successfully.")


if __name__ == "__main__":
    main()
