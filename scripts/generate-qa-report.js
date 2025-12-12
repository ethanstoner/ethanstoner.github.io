#!/usr/bin/env node
/**
 * Generate comprehensive QA report
 * Based on QA Instructions
 */

const fs = require('fs');
const path = require('path');

const projectDir = process.argv[2] || process.cwd();
const qaReportsDir = process.argv[3] || path.join(projectDir, 'qa-reports');

// Read backlog
let backlog = [];
try {
  const backlogPath = path.join(qaReportsDir, 'backlog.json');
  if (fs.existsSync(backlogPath)) {
    backlog = JSON.parse(fs.readFileSync(backlogPath, 'utf8'));
  }
} catch (e) {
  // Ignore
}

// Read Playwright results
let playwrightStats = { total: 0, passed: 0, failed: 0 };
try {
  const playwrightResults = path.join(qaReportsDir, 'playwright', 'results.json');
  if (fs.existsSync(playwrightResults)) {
    const results = JSON.parse(fs.readFileSync(playwrightResults, 'utf8'));
    if (results.stats) {
      playwrightStats = {
        total: results.stats.total || 0,
        passed: results.stats.passed || 0,
        failed: results.stats.failures || 0,
      };
    }
  }
} catch (e) {
  // Ignore
}

// Generate HTML report
const htmlReport = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QA Report - Portfolio</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #2c3e50;
            margin-bottom: 10px;
        }
        .timestamp {
            color: #7f8c8d;
            margin-bottom: 30px;
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        .stat-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 6px;
            border-left: 4px solid #3498db;
        }
        .stat-card.high { border-left-color: #e74c3c; }
        .stat-card.medium { border-left-color: #f39c12; }
        .stat-card.low { border-left-color: #95a5a6; }
        .stat-card.success { border-left-color: #27ae60; }
        .stat-card h3 {
            font-size: 32px;
            margin-bottom: 5px;
        }
        .stat-card p {
            color: #7f8c8d;
            font-size: 14px;
        }
        .section {
            margin-bottom: 40px;
        }
        .section h2 {
            color: #2c3e50;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #ecf0f1;
        }
        .backlog-item {
            background: #f8f9fa;
            padding: 15px;
            margin-bottom: 10px;
            border-radius: 6px;
            border-left: 4px solid #3498db;
        }
        .backlog-item.high { border-left-color: #e74c3c; }
        .backlog-item.medium { border-left-color: #f39c12; }
        .backlog-item.low { border-left-color: #95a5a6; }
        .backlog-item h4 {
            margin-bottom: 5px;
            color: #2c3e50;
        }
        .backlog-item p {
            color: #7f8c8d;
            font-size: 14px;
        }
        .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            margin-left: 10px;
        }
        .badge.high { background: #e74c3c; color: white; }
        .badge.medium { background: #f39c12; color: white; }
        .badge.low { background: #95a5a6; color: white; }
        .badge.testing { background: #3498db; color: white; }
        .badge.security { background: #e74c3c; color: white; }
        .badge.code-quality { background: #9b59b6; color: white; }
    </style>
</head>
<body>
    <div class="container">
        <h1>QA Report - Portfolio</h1>
        <p class="timestamp">Generated: ${new Date().toLocaleString()}</p>
        
        <div class="summary">
            <div class="stat-card success">
                <h3>${playwrightStats.passed}</h3>
                <p>Tests Passed</p>
            </div>
            <div class="stat-card ${playwrightStats.failed > 0 ? 'high' : 'success'}">
                <h3>${playwrightStats.failed}</h3>
                <p>Tests Failed</p>
            </div>
            <div class="stat-card ${backlog.filter(b => b.priority === 'high').length > 0 ? 'high' : 'success'}">
                <h3>${backlog.filter(b => b.priority === 'high').length}</h3>
                <p>High Priority Issues</p>
            </div>
            <div class="stat-card ${backlog.length > 0 ? 'medium' : 'success'}">
                <h3>${backlog.length}</h3>
                <p>Total Backlog Items</p>
            </div>
        </div>
        
        <div class="section">
            <h2>Test Results</h2>
            <p><strong>Total Tests:</strong> ${playwrightStats.total}</p>
            <p><strong>Passed:</strong> ${playwrightStats.passed}</p>
            <p><strong>Failed:</strong> ${playwrightStats.failed}</p>
            <p><strong>Pass Rate:</strong> ${playwrightStats.total > 0 ? ((playwrightStats.passed / playwrightStats.total) * 100).toFixed(1) : 0}%</p>
        </div>
        
        <div class="section">
            <h2>Backlog (${backlog.length} items)</h2>
            ${backlog.length === 0 
              ? '<p style="color: #27ae60;">✅ No issues found!</p>'
              : backlog.map(item => `
                <div class="backlog-item ${item.priority}">
                    <h4>
                        ${item.title}
                        <span class="badge ${item.priority}">${item.priority}</span>
                        <span class="badge ${item.category}">${item.category}</span>
                    </h4>
                    <p>${item.description}</p>
                    <p style="margin-top: 5px; font-size: 12px;">Status: ${item.status} | Found: ${new Date(item.timestamp).toLocaleString()}</p>
                </div>
              `).join('')
            }
        </div>
        
        <div class="section">
            <h2>Next Steps</h2>
            <ul style="margin-left: 20px; color: #7f8c8d;">
                <li>Review backlog items and prioritize fixes</li>
                <li>Address high-priority security issues immediately</li>
                <li>Fix failing tests</li>
                <li>Re-run QA after fixes to verify improvements</li>
            </ul>
        </div>
    </div>
</body>
</html>`;

// Write HTML report
const htmlReportPath = path.join(qaReportsDir, 'qa-report.html');
fs.writeFileSync(htmlReportPath, htmlReport);

// Generate JSON report
const jsonReport = {
  timestamp: new Date().toISOString(),
  project: 'portfolio',
  testResults: playwrightStats,
  backlog: backlog,
  summary: {
    totalTests: playwrightStats.total,
    passedTests: playwrightStats.passed,
    failedTests: playwrightStats.failed,
    passRate: playwrightStats.total > 0 ? (playwrightStats.passed / playwrightStats.total) * 100 : 0,
    backlogItems: backlog.length,
    highPriorityItems: backlog.filter(b => b.priority === 'high').length,
    mediumPriorityItems: backlog.filter(b => b.priority === 'medium').length,
    lowPriorityItems: backlog.filter(b => b.priority === 'low').length,
  },
};

const jsonReportPath = path.join(qaReportsDir, 'qa-report.json');
fs.writeFileSync(jsonReportPath, JSON.stringify(jsonReport, null, 2));

console.log(`Generated QA report: ${htmlReportPath}`);
console.log(`Generated JSON report: ${jsonReportPath}`);
