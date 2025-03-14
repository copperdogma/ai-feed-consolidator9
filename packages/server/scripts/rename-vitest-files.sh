#!/bin/bash

# Script to rename all .vitest.js and .vitest.ts files to .test.js and .test.ts
# This helps standardize the file naming convention after migrating from Jest to Vitest

# First, backup any lingering .test.js/.test.ts files that have already been migrated
echo "Backing up old test files that have corresponding vitest files..."

find /Users/cam/Documents/Projects/ai-feed-consolidator9 -name "*.test.js" | while read test_file; do
  vitest_file="${test_file/.test.js/.vitest.js}"
  if [ -f "$vitest_file" ]; then
    bak_file="${test_file}.bak"
    echo "Backing up $test_file to $bak_file (already migrated to Vitest)"
    mv "$test_file" "$bak_file"
  fi
done

find /Users/cam/Documents/Projects/ai-feed-consolidator9 -name "*.test.ts" | while read test_file; do
  vitest_file="${test_file/.test.ts/.vitest.ts}"
  if [ -f "$vitest_file" ]; then
    bak_file="${test_file}.bak"
    echo "Backing up $test_file to $bak_file (already migrated to Vitest)"
    mv "$test_file" "$bak_file"
  fi
done

# Now proceed with renaming all .vitest.js files to .test.js
find /Users/cam/Documents/Projects/ai-feed-consolidator9 -name "*.vitest.js" | while read file; do
  new_file="${file/.vitest.js/.test.js}"
  echo "Renaming $file to $new_file"
  mv "$file" "$new_file"
done

# Find all .vitest.ts files and rename them to .test.ts
find /Users/cam/Documents/Projects/ai-feed-consolidator9 -name "*.vitest.ts" | while read file; do
  new_file="${file/.vitest.ts/.test.ts}"
  echo "Renaming $file to $new_file"
  mv "$file" "$new_file"
done

echo "File renaming complete!" 