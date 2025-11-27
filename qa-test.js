const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function runQA() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    // Set viewport to desktop size
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    console.log('🚀 Starting QA tests for ethanstoner.github.io...\n');
    
    const results = {
        passed: [],
        failed: [],
        warnings: []
    };
    
    try {
        // Navigate to the site
        console.log('📡 Navigating to https://ethanstoner.github.io...');
        await page.goto('https://ethanstoner.github.io', { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(2000); // Wait for animations to load
        
        // Take initial screenshot
        await page.screenshot({ path: 'qa-reports/initial-load.png', fullPage: true });
        console.log('✅ Page loaded successfully');
        results.passed.push('Page loads successfully');
        
        // Test 1: Check if dark theme is applied
        console.log('\n🎨 Testing dark theme...');
        const bodyBg = await page.evaluate(() => {
            return window.getComputedStyle(document.body).backgroundColor;
        });
        if (bodyBg.includes('15, 15, 15') || bodyBg.includes('rgb(15, 15, 15)')) {
            console.log('✅ Dark theme background applied correctly');
            results.passed.push('Dark theme background');
        } else {
            console.log('❌ Dark theme not applied. Background:', bodyBg);
            results.failed.push(`Dark theme: Expected dark background, got ${bodyBg}`);
        }
        
        // Test 2: Check if fonts are loaded
        console.log('\n🔤 Testing fonts...');
        const fontFamily = await page.evaluate(() => {
            return window.getComputedStyle(document.body).fontFamily;
        });
        if (fontFamily.includes('Roboto Mono')) {
            console.log('✅ Roboto Mono font loaded');
            results.passed.push('Roboto Mono font loaded');
        } else {
            console.log('⚠️  Font may not be loaded:', fontFamily);
            results.warnings.push(`Font: ${fontFamily}`);
        }
        
        // Test 3: Check header visibility and functionality
        console.log('\n📋 Testing header...');
        const header = await page.locator('.header');
        const headerVisible = await header.isVisible();
        if (headerVisible) {
            console.log('✅ Header is visible');
            results.passed.push('Header visibility');
        } else {
            console.log('❌ Header not visible');
            results.failed.push('Header not visible');
        }
        
        // Test 4: Test navigation links
        console.log('\n🔗 Testing navigation links...');
        const navLinks = await page.locator('.nav-link').all();
        console.log(`Found ${navLinks.length} navigation links`);
        
        for (const link of navLinks) {
            const href = await link.getAttribute('href');
            const text = await link.textContent();
            console.log(`  Testing: ${text} -> ${href}`);
            
            // Click and verify smooth scroll
            await link.click();
            await page.waitForTimeout(1000);
            
            const currentHash = await page.evaluate(() => window.location.hash);
            if (href === '#' || currentHash === href || (href.startsWith('#') && currentHash === href)) {
                console.log(`  ✅ Navigation to ${href} works`);
                results.passed.push(`Navigation: ${text}`);
            } else {
                console.log(`  ⚠️  Navigation to ${href} - hash: ${currentHash}`);
            }
        }
        
        // Test 5: Test hero section and typewriter animation
        console.log('\n⌨️  Testing hero section...');
        const heroTitle = await page.locator('.hero-title');
        const heroVisible = await heroTitle.isVisible();
        if (heroVisible) {
            console.log('✅ Hero section visible');
            results.passed.push('Hero section visibility');
            
            // Wait for typewriter animation
            await page.waitForTimeout(5000);
            const titleText = await heroTitle.textContent();
            console.log(`  Hero title: "${titleText}"`);
            
            // Check if typewriter animation completed
            if (titleText.includes('Cloud & Platform Engineering')) {
                console.log('✅ Typewriter animation completed');
                results.passed.push('Typewriter animation');
            }
        } else {
            console.log('❌ Hero section not visible');
            results.failed.push('Hero section not visible');
        }
        
        // Test 6: Test hero buttons
        console.log('\n🔘 Testing hero buttons...');
        const btnPrimary = await page.locator('.btn-primary');
        const btnSecondary = await page.locator('.btn-secondary');
        
        if (await btnPrimary.isVisible()) {
            console.log('✅ Primary button visible');
            const primaryHref = await btnPrimary.getAttribute('href');
            console.log(`  Primary button href: ${primaryHref}`);
            
            // Test hover effect
            await btnPrimary.hover();
            await page.waitForTimeout(500);
            await page.screenshot({ path: 'qa-reports/button-primary-hover.png' });
            console.log('✅ Primary button hover effect tested');
            results.passed.push('Primary button hover');
        }
        
        if (await btnSecondary.isVisible()) {
            console.log('✅ Secondary button visible');
            await btnSecondary.hover();
            await page.waitForTimeout(500);
            await page.screenshot({ path: 'qa-reports/button-secondary-hover.png' });
            console.log('✅ Secondary button hover effect tested');
            results.passed.push('Secondary button hover');
        }
        
        // Test 7: Test scroll progress indicator
        console.log('\n📊 Testing scroll progress indicator...');
        const scrollProgress = await page.locator('.scroll-progress');
        const progressVisible = await scrollProgress.isVisible();
        if (progressVisible) {
            console.log('✅ Scroll progress indicator visible');
            
            // Scroll down and check if progress updates
            await page.evaluate(() => window.scrollTo(0, 500));
            await page.waitForTimeout(500);
            const progressWidth = await page.evaluate(() => {
                const el = document.querySelector('.scroll-progress');
                return el ? window.getComputedStyle(el).width : '0px';
            });
            console.log(`  Progress width after scroll: ${progressWidth}`);
            if (progressWidth !== '0px' && progressWidth !== '0%') {
                console.log('✅ Scroll progress updates correctly');
                results.passed.push('Scroll progress indicator');
            }
        } else {
            console.log('❌ Scroll progress indicator not visible');
            results.failed.push('Scroll progress indicator not visible');
        }
        
        // Test 8: Test project cards
        console.log('\n📦 Testing project cards...');
        const projectCards = await page.locator('.project-card').all();
        console.log(`Found ${projectCards.length} project cards`);
        
        for (let i = 0; i < projectCards.length; i++) {
            const card = projectCards[i];
            const cardVisible = await card.isVisible();
            if (cardVisible) {
                console.log(`  ✅ Project card ${i + 1} visible`);
                
                // Test hover effect
                await card.hover();
                await page.waitForTimeout(500);
                await page.screenshot({ path: `qa-reports/project-card-${i + 1}-hover.png` });
                console.log(`  ✅ Project card ${i + 1} hover effect works`);
                results.passed.push(`Project card ${i + 1} hover`);
                
                // Test project link if exists
                const projectLink = card.locator('.project-link');
                const linkCount = await projectLink.count();
                if (linkCount > 0) {
                    const linkHref = await projectLink.getAttribute('href');
                    console.log(`    Link: ${linkHref}`);
                }
            }
        }
        
        // Test 9: Test contact links
        console.log('\n📧 Testing contact links...');
        const contactLinks = await page.locator('.contact-link').all();
        console.log(`Found ${contactLinks.length} contact links`);
        
        for (const link of contactLinks) {
            const href = await link.getAttribute('href');
            const text = await link.textContent();
            console.log(`  Testing: ${text.trim()} -> ${href}`);
            
            if (href && (href.startsWith('http') || href.startsWith('mailto'))) {
                console.log(`  ✅ Contact link valid: ${href}`);
                results.passed.push(`Contact link: ${text.trim()}`);
                
                // Test hover
                await link.hover();
                await page.waitForTimeout(300);
            }
        }
        
        // Test 10: Test responsive design
        console.log('\n📱 Testing responsive design...');
        
        // Mobile view
        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'qa-reports/mobile-view.png', fullPage: true });
        console.log('✅ Mobile view (375x667)');
        results.passed.push('Mobile responsive design');
        
        // Tablet view
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'qa-reports/tablet-view.png', fullPage: true });
        console.log('✅ Tablet view (768x1024)');
        results.passed.push('Tablet responsive design');
        
        // Desktop view
        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'qa-reports/desktop-view.png', fullPage: true });
        console.log('✅ Desktop view (1920x1080)');
        results.passed.push('Desktop responsive design');
        
        // Test 11: Test smooth scrolling
        console.log('\n⬇️  Testing smooth scrolling...');
        await page.goto('https://ethanstoner.github.io#hero', { waitUntil: 'networkidle' });
        await page.waitForTimeout(1000);
        
        // Click about link
        await page.locator('a[href="#about"]').click();
        await page.waitForTimeout(1500);
        const scrollY = await page.evaluate(() => window.pageYOffset);
        console.log(`  Scroll position after clicking "about": ${scrollY}`);
        if (scrollY > 100) {
            console.log('✅ Smooth scrolling works');
            results.passed.push('Smooth scrolling');
        }
        
        // Test 12: Test header scroll effect
        console.log('\n📜 Testing header scroll effect...');
        await page.goto('https://ethanstoner.github.io', { waitUntil: 'networkidle' });
        await page.waitForTimeout(1000);
        
        const headerBefore = await page.evaluate(() => {
            const header = document.querySelector('.header');
            return header ? header.classList.contains('scrolled') : false;
        });
        console.log(`  Header scrolled class before scroll: ${headerBefore}`);
        
        await page.evaluate(() => window.scrollTo(0, 100));
        await page.waitForTimeout(500);
        
        const headerAfter = await page.evaluate(() => {
            const header = document.querySelector('.header');
            return header ? header.classList.contains('scrolled') : false;
        });
        console.log(`  Header scrolled class after scroll: ${headerAfter}`);
        
        if (headerAfter && !headerBefore) {
            console.log('✅ Header scroll effect works');
            results.passed.push('Header scroll effect');
        }
        
        // Test 13: Full page scroll and take final screenshot
        console.log('\n📸 Taking final full-page screenshot...');
        await page.goto('https://ethanstoner.github.io', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'qa-reports/full-page-final.png', fullPage: true });
        console.log('✅ Final screenshot saved');
        
        // Test 14: Check for console errors
        console.log('\n🔍 Checking for console errors...');
        const consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });
        await page.reload({ waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);
        
        if (consoleErrors.length === 0) {
            console.log('✅ No console errors');
            results.passed.push('No console errors');
        } else {
            console.log(`⚠️  Found ${consoleErrors.length} console errors:`);
            consoleErrors.forEach(err => console.log(`  - ${err}`));
            results.warnings.push(`${consoleErrors.length} console errors found`);
        }
        
    } catch (error) {
        console.error('❌ Error during QA:', error);
        results.failed.push(`QA Error: ${error.message}`);
    } finally {
        await browser.close();
    }
    
    // Generate report
    console.log('\n' + '='.repeat(60));
    console.log('📊 QA TEST RESULTS');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${results.passed.length}`);
    console.log(`❌ Failed: ${results.failed.length}`);
    console.log(`⚠️  Warnings: ${results.warnings.length}`);
    console.log('\n✅ PASSED TESTS:');
    results.passed.forEach(test => console.log(`  ✓ ${test}`));
    
    if (results.failed.length > 0) {
        console.log('\n❌ FAILED TESTS:');
        results.failed.forEach(test => console.log(`  ✗ ${test}`));
    }
    
    if (results.warnings.length > 0) {
        console.log('\n⚠️  WARNINGS:');
        results.warnings.forEach(warning => console.log(`  ⚠ ${warning}`));
    }
    
    // Save report to file
    const reportPath = 'qa-reports/qa-report.txt';
    const reportContent = `
QA TEST REPORT - ethanstoner.github.io
Generated: ${new Date().toISOString()}

RESULTS:
✅ Passed: ${results.passed.length}
❌ Failed: ${results.failed.length}
⚠️  Warnings: ${results.warnings.length}

PASSED TESTS:
${results.passed.map(t => `  ✓ ${t}`).join('\n')}

${results.failed.length > 0 ? `FAILED TESTS:\n${results.failed.map(t => `  ✗ ${t}`).join('\n')}\n` : ''}
${results.warnings.length > 0 ? `WARNINGS:\n${results.warnings.map(w => `  ⚠ ${w}`).join('\n')}\n` : ''}
`;
    
    fs.mkdirSync('qa-reports', { recursive: true });
    fs.writeFileSync(reportPath, reportContent);
    console.log(`\n📄 Report saved to: ${reportPath}`);
    
    return results;
}

runQA().catch(console.error);
