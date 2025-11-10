#!/bin/bash

# Parse the --name argument
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --name) DIR_NAME="$2"; shift ;;
        *) echo "Unknown parameter passed: $1"; exit 1 ;;
    esac
    shift
done

# Check if name argument was provided
if [ -z "$DIR_NAME" ]; then
    echo "Usage: $0 --name <directory_name>"
    exit 1
fi

# Add apl_ prefix
FINAL_DIR="apl_${DIR_NAME}"

# Create the new directory in the current directory
mkdir -p "$FINAL_DIR"

# Copy base.json from 'base' folder to the new directory
if [ -f "base/base.json" ]; then
    cp base/base.json "$FINAL_DIR/"
    echo "✅ Created directory '$FINAL_DIR' and copied base.json into it."
else
    echo "❌ base/base.json not found. Make sure it exists."
    exit 1
fi


ls $FINAL_DIR