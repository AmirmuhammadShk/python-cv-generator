#!/bin/bash
# src/cli/apply.sh
# Description: Create applies/YYYY_MM_DD/apl_<name> and copy base.json into it.

set -e

# --- Parse arguments ---
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --name) DIR_NAME="$2"; shift ;;
        *) echo "❌ Unknown parameter passed: $1"; exit 1 ;;
    esac
    shift
done

if [ -z "$DIR_NAME" ]; then
    echo "Usage: ./apply.sh --name <directory_name>"
    exit 1
fi

# --- Setup paths ---
# Go two levels up from src/cli → project root (Jobuine)
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CONFIG_FILE="$ROOT_DIR/config.yaml"
BASE_FILE="$ROOT_DIR/data/base/base.json"

# --- Read applies_dir from config.yaml or use default ---
if [ -f "$CONFIG_FILE" ]; then
    # Read the absolute path directly from config.yaml
    APPLIES_DIR=$(grep 'applies_dir:' "$CONFIG_FILE" | sed 's/.*: *//;s/"//g;s/'"'"'//g')
else
    APPLIES_DIR="$ROOT_DIR/applies"
fi

# --- Create today’s folder ---
TODAY_DIR="$(date +%Y_%m_%d)"
DATE_DIR="$APPLIES_DIR/$TODAY_DIR"
FINAL_DIR="$DATE_DIR/apl_${DIR_NAME}"

mkdir -p "$FINAL_DIR"

# --- Copy base.json ---
if [ -f "$BASE_FILE" ]; then
    cp "$BASE_FILE" "$FINAL_DIR/"
    echo "✅ Created: $FINAL_DIR"
    echo "✅ Copied base.json → $FINAL_DIR/"
else
    echo "❌ Missing file: $BASE_FILE"
    exit 1
fi

echo "📁 Directory structure created under:"
echo "$FINAL_DIR"
