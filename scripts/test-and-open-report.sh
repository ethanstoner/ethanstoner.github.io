#!/bin/bash
# Run tests and open report, then exit immediately

cd "$(dirname "$0")/.."

# Run tests
npm test -- "$@"
TEST_EXIT_CODE=$?

# Open the HTML report if it exists
if [ -d "qa-reports/playwright" ]; then
    REPORT_FILE=$(find qa-reports/playwright -name "index.html" | head -1)
    if [ -n "$REPORT_FILE" ]; then
        open "$REPORT_FILE" 2>/dev/null || echo "Report available at: $REPORT_FILE"
    fi
fi

# Exit with test result code
exit $TEST_EXIT_CODE
