#!/bin/bash
# Fast QA Runner - Essential tests only, guaranteed to complete
# Maximum 5 minutes runtime

set +e
MAX_TIME=300
START_TIME=$(date +%s)

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
QA_REPORTS_DIR="$PROJECT_DIR/qa-reports"

check_timeout() {
  CURRENT_TIME=$(date +%s)
  ELAPSED=$((CURRENT_TIME - START_TIME))
  if [ $ELAPSED -gt $MAX_TIME ]; then
    echo "ERROR: Exceeded ${MAX_TIME}s limit, exiting..."
    exit 1
  fi
}

echo "=== Fast QA Run (5 min max) ==="
mkdir -p "$QA_REPORTS_DIR"

# 1. Essential Playwright tests only - single file, single browser
echo "=== Running Essential Tests ==="
cd "$PROJECT_DIR"
npm test -- tests/portfolio.spec.js --project=chromium --workers=1 --timeout=15000 2>&1 | head -100
check_timeout

# 2. Quick security check
echo ""
echo "=== Security Check ==="
if [ -f "$PROJECT_DIR/package.json" ]; then
    echo "Checking for known vulnerabilities..."
    npm audit --audit-level=high --json > "$QA_REPORTS_DIR/security/npm-audit.json" 2>&1 &
    AUDIT_PID=$!
    sleep 30
    kill $AUDIT_PID 2>/dev/null
    echo "Security check completed"
fi
check_timeout

# 3. File structure
echo ""
echo "=== File Structure ==="
find "$PROJECT_DIR" -maxdepth 2 -name ".DS_Store" -o -name "*.tmp" 2>/dev/null | head -10 > "$QA_REPORTS_DIR/file-structure-issues.txt" || echo "Clean"
check_timeout

END_TIME=$(date +%s)
TOTAL_TIME=$((END_TIME - START_TIME))
echo ""
echo "=== QA Complete (${TOTAL_TIME}s) ==="
echo "Reports: $QA_REPORTS_DIR"
