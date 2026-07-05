#!/bin/sh
set -e

INIT_FILE="/app/data/db.json"
DATA_FILE="$DATA_DIR/db.json"

# Check if we have a valid database or need to initialize
if [ ! -f "$DATA_FILE" ]; then
  echo "Initializing data directory (no db.json found)..."
  mkdir -p "$DATA_DIR"
elif [ -f "$INIT_FILE" ]; then
  # Check if the existing db.json has users (from default init)
  USER_COUNT=$(node -e "const d=JSON.parse(require('fs').readFileSync('$DATA_FILE','utf8'));console.log((d.users||[]).length)" 2>/dev/null || echo "0")
  if [ "$USER_COUNT" = "0" ]; then
    echo "Empty database found, replacing with initialized data..."
  else
    echo "Database found with $USER_COUNT users, keeping existing data."
    INIT_FILE=""
  fi
fi

if [ -n "$INIT_FILE" ] && [ -f "$INIT_FILE" ]; then
  cp "$INIT_FILE" "$DATA_FILE"
  echo "Copied initial database from $INIT_FILE"
fi

exec node /app/server.js
