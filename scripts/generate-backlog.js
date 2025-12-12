#!/usr/bin/env node
/**
 * Generate backlog from QA results
 * Based on QA Instructions
 */

const fs = require('fs');
const path = require('path');

const projectDir = process.argv[2] || process.cwd();
const qaReportsDir = process.argv[3] || path.join(projectDir, 'qa-reports');

const backlog = [];

// Helper to add backlog item
function addItem(title, description, priority, category) {
  backlog.push({
    title,
    description,
    priority,
    category,
    status: 'open',
    timestamp: new Date().toISOString(),
  });
}

// 1. Check Playwright test results
try {
  const playwrightResults = path.join(qaReportsDir, 'playwright', 'results.json');
  if (fs.existsSync(playwrightResults)) {
    const results = JSON.parse(fs.readFileSync(playwrightResults, 'utf8'));
    if (results.stats && results.stats.failures > 0) {
      addItem(
        `Playwright: ${results.stats.failures} test(s) failed`,
        `Found ${results.stats.failures} failing test(s) in Playwright suite`,
        'high',
        'testing'
      );
    }
  }
} catch (e) {
  // Ignore if file doesn't exist
}

// 2. Check ESLint results
try {
  const eslintResults = path.join(qaReportsDir, 'static-analysis', 'eslint.json');
  if (fs.existsSync(eslintResults)) {
    const results = JSON.parse(fs.readFileSync(eslintResults, 'utf8'));
    if (Array.isArray(results) && results.length > 0) {
      const errorCount = results.reduce((sum, file) => sum + (file.errorCount || 0), 0);
      const warningCount = results.reduce((sum, file) => sum + (file.warningCount || 0), 0);
      
      if (errorCount > 0) {
        addItem(
          `ESLint: ${errorCount} error(s) found`,
          `ESLint found ${errorCount} error(s) and ${warningCount} warning(s)`,
          'high',
          'code-quality'
        );
      } else if (warningCount > 0) {
        addItem(
          `ESLint: ${warningCount} warning(s) found`,
          `ESLint found ${warningCount} warning(s)`,
          'medium',
          'code-quality'
        );
      }
    }
  }
} catch (e) {
  // Ignore if file doesn't exist
}

// 3. Check npm audit results
try {
  const npmAuditResults = path.join(qaReportsDir, 'security', 'npm-audit.json');
  if (fs.existsSync(npmAuditResults)) {
    const results = JSON.parse(fs.readFileSync(npmAuditResults, 'utf8'));
    if (results.vulnerabilities) {
      const vulnCount = Object.keys(results.vulnerabilities).length;
      if (vulnCount > 0) {
        const highVulns = Object.values(results.vulnerabilities).filter(v => v.severity === 'high' || v.severity === 'critical').length;
        addItem(
          `Security: ${vulnCount} npm vulnerability/vulnerabilities found`,
          `npm audit found ${vulnCount} vulnerability/vulnerabilities (${highVulns} high/critical)`,
          highVulns > 0 ? 'high' : 'medium',
          'security'
        );
      }
    }
  }
} catch (e) {
  // Ignore if file doesn't exist
}

// 4. Check for secrets
try {
  const secretScan = path.join(qaReportsDir, 'security', 'secret-scan.txt');
  if (fs.existsSync(secretScan)) {
    const content = fs.readFileSync(secretScan, 'utf8');
    if (content.trim().length > 0) {
      const lines = content.split('\n').filter(l => l.trim().length > 0);
      addItem(
        `Security: Potential secrets found`,
        `Secret scan found ${lines.length} potential secret(s). Review secret-scan.txt`,
        'high',
        'security'
      );
    }
  }
} catch (e) {
  // Ignore if file doesn't exist
}

// 5. Check file structure issues
try {
  const fileStructureIssues = path.join(qaReportsDir, 'file-structure-issues.txt');
  if (fs.existsSync(fileStructureIssues)) {
    const content = fs.readFileSync(fileStructureIssues, 'utf8');
    if (content.trim().length > 0) {
      const files = content.split('\n').filter(f => f.trim().length > 0);
      addItem(
        `File Structure: ${files.length} unnecessary file(s) found`,
        `Found ${files.length} unnecessary file(s) (cache, temp files, etc.). See file-structure-issues.txt`,
        'low',
        'file-structure'
      );
    }
  }
} catch (e) {
  // Ignore if file doesn't exist
}

// Write backlog
const backlogPath = path.join(qaReportsDir, 'backlog.json');
fs.writeFileSync(backlogPath, JSON.stringify(backlog, null, 2));
console.log(`Generated backlog with ${backlog.length} item(s): ${backlogPath}`);
