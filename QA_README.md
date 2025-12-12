# QA Testing - Portfolio

## Overview

This portfolio uses comprehensive QA testing based on the QA instructions. QA can be run in two ways:

1. **Docker (Recommended)** - Consistent, reproducible environment
2. **Local** - Faster for development, requires local dependencies

## Quick Start

### Docker (Recommended)

```bash
# Run comprehensive QA in Docker
make qa

# Or directly
docker-compose -f docker-compose.qa.yml build qa
docker-compose -f docker-compose.qa.yml up --abort-on-container-exit qa
```

**Benefits:**
- ✅ Consistent environment across all machines
- ✅ No need to install dependencies locally
- ✅ Isolated from your system
- ✅ Reproducible results
- ✅ Matches CI/CD environment

### Local (Faster for Development)

```bash
# Run comprehensive QA locally
make qa-local

# Or directly
./scripts/run-qa.sh
```

**Benefits:**
- ✅ Faster execution (no Docker overhead)
- ✅ Easier debugging
- ✅ Direct access to files

**Requirements:**
- Node.js 18+
- npm installed
- Playwright browsers installed (`npx playwright install`)

## What QA Checks

The comprehensive QA suite includes:

1. **Unit Testing (Playwright)**
   - Multi-browser testing (Chromium, Firefox, WebKit)
   - Functional tests
   - Visual regression tests
   - Accessibility tests
   - Performance tests
   - Security tests

2. **Static Code Analysis**
   - ESLint for JavaScript
   - Code quality checks

3. **Security Scanning**
   - npm audit for vulnerabilities
   - Secret detection
   - XSS vulnerability checks
   - Security header validation

4. **Performance Testing**
   - Page load time
   - Network request analysis
   - Resource optimization checks

5. **Accessibility Testing**
   - Semantic HTML validation
   - ARIA attributes
   - Keyboard navigation
   - Color contrast

6. **File Structure Organization**
   - Unnecessary file detection
   - Cache file cleanup

## Reports

All QA reports are generated in `qa-reports/`:

- `qa-report.html` - Visual HTML report
- `qa-report.json` - Machine-readable JSON report
- `backlog.json` - All issues found
- `playwright/` - Playwright test results
- `static-analysis/` - ESLint and other static analysis results
- `security/` - Security scan results

## Viewing Results

```bash
# View HTML report
open qa-reports/qa-report.html

# View backlog
cat qa-reports/backlog.json | jq '.'

# View high-priority issues
cat qa-reports/backlog.json | jq '.[] | select(.priority == "high")'
```

## Docker vs Local

### When to Use Docker

- ✅ Running QA before commits
- ✅ CI/CD pipelines
- ✅ Sharing results with team
- ✅ Ensuring consistency
- ✅ First-time setup

### When to Use Local

- ✅ Quick iteration during development
- ✅ Debugging test failures
- ✅ When Docker is not available
- ✅ Faster feedback loop

## Troubleshooting

### Docker Issues

```bash
# Rebuild QA image
docker-compose -f docker-compose.qa.yml build --no-cache qa

# Clean up and restart
make clean
make qa
```

### Local Issues

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install --with-deps

# Run QA
./scripts/run-qa.sh
```

## Best Practices

1. **Run QA before commits** - Catch issues early
2. **Use Docker for final checks** - Ensure consistency
3. **Use local for development** - Faster iteration
4. **Review backlog regularly** - Fix high-priority issues first
5. **Keep reports in gitignore** - Don't commit QA reports

## Integration

### Pre-commit Hook

```bash
#!/bin/bash
# .git/hooks/pre-commit
make qa-local
if [ $? -ne 0 ]; then
  echo "QA checks failed - fix issues before committing"
  exit 1
fi
```

### CI/CD

```yaml
# GitHub Actions example
- name: Run QA
  run: |
    make qa
```
