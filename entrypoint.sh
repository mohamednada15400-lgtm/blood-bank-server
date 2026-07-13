#!/bin/sh
set -e

SEED_FILE="/app/seed/db.json"
OLD_DATA_FILE="/app/data/db.json"
DATA_FILE="$DATA_DIR/db.json"

# Fix volume permissions for node user
chown node:node "$DATA_DIR" 2>/dev/null || true

mkdir -p "$DATA_DIR"

# Migration from old DATA_DIR (/app/data) to new DATA_DIR (/data)
if [ ! -f "$DATA_FILE" ] && [ -f "$OLD_DATA_FILE" ]; then
  echo "Migrating data from old location ($OLD_DATA_FILE)..."
  cp "$OLD_DATA_FILE" "$DATA_FILE"
fi

# If still no data file, use seed data
if [ ! -f "$DATA_FILE" ]; then
  if [ -f "$SEED_FILE" ]; then
    echo "Initializing from seed data..."
    cp "$SEED_FILE" "$DATA_FILE"
  else
    echo "No seed data found, starting fresh..."
  fi
fi

# If data file exists, check it has users (not empty/seed)
if [ -f "$DATA_FILE" ]; then
  USER_COUNT=$(node -e "try{const d=JSON.parse(require('fs').readFileSync('$DATA_FILE','utf8'));console.log((d.users||[]).length)}catch(e){console.log('0')}" 2>/dev/null)
  if [ "$USER_COUNT" = "0" ] && [ -f "$SEED_FILE" ]; then
    echo "Empty database found, replacing with seed data..."
    cp "$SEED_FILE" "$DATA_FILE"
  elif [ "$USER_COUNT" != "0" ]; then
    echo "Database found with $USER_COUNT users."
  fi
fi

# Drop to node user and exec the CMD
exec su-exec node "$@"
