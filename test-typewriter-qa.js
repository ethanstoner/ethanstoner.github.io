const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testTypewriterAndResponsive() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    // Create test results directory
    const resultsDir = path.join(__dirname, 'qa-reports', 'typewriter-test');
    if (!fs.existsSync(resultsDir)) {
        fs.mkdirSync(resultsDir, { recursive: true });
    }
    
    const viewports = [
        { name: 'Mobile Portrait', width: 375, height: 667 },
        { name: 'Mobile Landscape', width: 667, height: 375 },
        { name: 'Tablet Portrait', width: 768, height: 1024 },
        { name: 'Tablet Landscape', width: 1024, height: 768 },
        { name: 'Desktop 16:9', width: 1920, height: 1080 },
        { name: 'Desktop 4:3', width: 1024, height: 768 },
        { name: 'Ultrawide 21:9', width: 2560, height: 1080 },
    ];
    
    const results = {
        passed: [],
        failed: [],
        issues: []
    };
    
    console.log('🧪 Testing Typewriter Animation and Responsive Design\n');
    
    for (const viewport of viewports) {
        console.log(`\n📱 Testing ${viewport.name} (${viewport.width}x${viewport.height})...`);
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('https://ethanstoner.github.io', { waitUntil: 'networkidle' });
        
        const viewportIssues = [];
        
        // Test 1: Check initial state - text should be hidden (width: 0)
        console.log('  ⏱️  Checking initial state (0s)...');
        const initialState = await page.evaluate(() => {
            const line = document.querySelector('.hero-title.line');
            if (!line) return { error: 'Line element not found' };
            const style = window.getComputedStyle(line);
            return {
                width: style.width,
                overflow: style.overflow,
                display: style.display,
            };
        });
        
        // Allow 0-10px for border+padding (3px border + 4px padding = 7px)
        const initialWidth = parseFloat(initialState.width) || 0;
        if (initialWidth <= 10) {
            console.log(`    ✅ Text starts hidden (width: ${initialState.width}, includes border+padding)`);
        } else {
            const issue = `Text should start hidden but width is ${initialState.width}`;
            viewportIssues.push(issue);
            console.log(`    ❌ ${issue}`);
        }
        
        // Test 2: Check during animation (2.5 seconds in - after 1s delay + 1.5s animation)
        console.log('  ⏱️  Checking during animation (2.5s)...');
        await page.waitForTimeout(2500);
        const duringAnimation = await page.evaluate(() => {
            const line = document.querySelector('.hero-title.line');
            if (!line) return { error: 'Line element not found' };
            const style = window.getComputedStyle(line);
            const rect = line.getBoundingClientRect();
            return {
                width: style.width,
                overflow: style.overflow,
                visibleWidth: rect.width,
                scrollWidth: line.scrollWidth,
            };
        });
        
        if (duringAnimation.overflow === 'hidden' && parseFloat(duringAnimation.width) > 10) {
            console.log(`    ✅ Text is typing out (width: ${duringAnimation.width})`);
        } else if (duringAnimation.overflow === 'visible' && parseFloat(duringAnimation.width) > 10) {
            // Animation might have completed early or overflow was set to visible
            console.log(`    ⚠️  Text is visible (width: ${duringAnimation.width}, overflow: ${duringAnimation.overflow}) - animation may have completed`);
        } else {
            const issue = `Animation not working correctly - width: ${duringAnimation.width}, overflow: ${duringAnimation.overflow}`;
            viewportIssues.push(issue);
            console.log(`    ❌ ${issue}`);
        }
        
        // Test 3: Check after animation completes (6 seconds total)
        console.log('  ⏱️  Checking after animation completes (6s)...');
        await page.waitForTimeout(4000); // Wait for animation to complete (1s delay + 4s animation + 1s buffer)
        
        const afterAnimation = await page.evaluate(() => {
            const line = document.querySelector('.hero-title.line');
            const heroTitle = document.querySelector('.hero-title');
            if (!line || !heroTitle) return { error: 'Elements not found' };
            
            const lineStyle = window.getComputedStyle(line);
            const lineRect = line.getBoundingClientRect();
            const titleRect = heroTitle.getBoundingClientRect();
            const containerRect = heroTitle.parentElement.getBoundingClientRect();
            
            return {
                hasCompleteClass: line.classList.contains('animation-complete'),
                overflow: lineStyle.overflow,
                width: lineStyle.width,
                lineWidth: lineRect.width,
                lineScrollWidth: line.scrollWidth,
                titleWidth: titleRect.width,
                containerWidth: containerRect.width,
                isCutOff: line.scrollWidth > lineRect.width,
                textContent: line.textContent.trim(),
            };
        });
        
        // Check if animation completed properly
        if (afterAnimation.hasCompleteClass || afterAnimation.overflow === 'visible') {
            console.log('    ✅ Animation completed, text is visible');
        } else {
            const issue = `Animation may not have completed - overflow: ${afterAnimation.overflow}`;
            viewportIssues.push(issue);
            console.log(`    ⚠️  ${issue}`);
        }
        
        // Check if text is cut off
        if (afterAnimation.isCutOff) {
            const issue = `Text is cut off after animation - scrollWidth: ${afterAnimation.lineScrollWidth}px, visible: ${afterAnimation.lineWidth}px`;
            viewportIssues.push(issue);
            console.log(`    ❌ ${issue}`);
        } else {
            console.log(`    ✅ Text is fully visible (${afterAnimation.lineWidth}px wide)`);
        }
        
        // Check for horizontal scroll
        const hasHorizontalScroll = await page.evaluate(() => {
            return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        
        if (hasHorizontalScroll) {
            const issue = 'Horizontal scroll detected';
            viewportIssues.push(issue);
            console.log(`    ❌ ${issue}`);
        } else {
            console.log('    ✅ No horizontal scroll');
        }
        
        // Verify full text is present
        const expectedText = 'Cloud & Platform Engineering.';
        if (afterAnimation.textContent && afterAnimation.textContent.includes('Cloud & Platform Engineering')) {
            console.log(`    ✅ Full text is present: "${afterAnimation.textContent.substring(0, 30)}..."`);
        } else {
            const issue = `Text content mismatch - expected to contain "Cloud & Platform Engineering" but got: "${afterAnimation.textContent}"`;
            viewportIssues.push(issue);
            console.log(`    ❌ ${issue}`);
        }
        
        // Take screenshot
        const screenshotPath = path.join(resultsDir, `${viewport.name.replace(/\s+/g, '-')}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`    📸 Screenshot saved: ${screenshotPath}`);
        
        if (viewportIssues.length === 0) {
            results.passed.push(viewport.name);
            console.log(`  ✅ ${viewport.name}: All tests passed`);
        } else {
            results.failed.push(viewport.name);
            results.issues.push({
                viewport: viewport.name,
                issues: viewportIssues
            });
            console.log(`  ❌ ${viewport.name}: ${viewportIssues.length} issue(s) found`);
        }
    }
    
    // Generate report
    const report = {
        timestamp: new Date().toISOString(),
        summary: {
            total: viewports.length,
            passed: results.passed.length,
            failed: results.failed.length,
        },
        results: results
    };
    
    const reportPath = path.join(resultsDir, 'report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('\n\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total viewports tested: ${report.summary.total}`);
    console.log(`✅ Passed: ${report.summary.passed}`);
    console.log(`❌ Failed: ${report.summary.failed}`);
    
    if (results.failed.length > 0) {
        console.log('\n❌ Failed viewports:');
        results.failed.forEach(v => console.log(`  - ${v}`));
        
        console.log('\n📋 Issues found:');
        results.issues.forEach(({ viewport, issues }) => {
            console.log(`\n  ${viewport}:`);
            issues.forEach(issue => console.log(`    - ${issue}`));
        });
    } else {
        console.log('\n🎉 All tests passed!');
    }
    
    console.log(`\n📄 Full report saved to: ${reportPath}`);
    console.log('='.repeat(60));
    
    await browser.close();
    
    // Exit with appropriate code
    process.exit(results.failed.length > 0 ? 1 : 0);
}

testTypewriterAndResponsive().catch(error => {
    console.error('Test failed with error:', error);
    process.exit(1);
});
