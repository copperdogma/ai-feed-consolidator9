#!/bin/bash

# Script to run database relationship tests
echo "Running database relationship tests..."

# Run the tests using ts-node with proper ESM support
NODE_OPTIONS="--loader ts-node/esm" npx ts-node src/tests/relationship-tests.ts

# Check the exit status
if [ $? -eq 0 ]; then
  echo "✅ All tests completed successfully!"
else
  echo "❌ Tests failed!"
  exit 1
fi

echo "Done testing database relationships." 