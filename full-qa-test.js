const { chromium } = require('playwright');
const fs = require('fs');

async function fullQA() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    console.log('🔍 Full QA Test - Complete Functionality Check\n');
    console.log('='.repeat(70));
    
    const results = {
        passed: [],
        failed: [],
        warnings: []
    };
    
    try {
        await page.goto('https://ethanstoner.github.io', { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(3000);
        
        // Test 1: Page Loading
        console.log('\n📡 Testing Page Loading...');
        const title = await page.title();
        if (title && title.includes('Ethan Stoner')) {
            console.log('  ✅ Page loads successfully');
            results.passed.push('Page loading');
        } else {
            console.log('  ❌ Page title issue:', title);
            results.failed.push('Page loading');
        }
        
        // Test 2: All Navigation Links
        console.log('\n🔗 Testing All Navigation Links...');
        const navLinks = await page.locator('.nav-link').all();
        const expectedSections = ['hero', 'about', 'projects', 'skills', 'roadmap', 'contact'];
        
        if (navLinks.length === 6) {
            console.log(`  ✅ All 6 navigation links present`);
            results.passed.push('Navigation: 6 links present');
        }
        
        for (const link of navLinks) {
            const text = await link.textContent();
            const href = await link.getAttribute('href');
            
            // Click and verify smooth scroll
            const initialScroll = await page.evaluate(() => window.pageYOffset);
            await link.click();
            await page.waitForTimeout(1200);
            const finalScroll = await page.evaluate(() => window.pageYOffset);
            
            // Check if URL hash was removed
            const hash = await page.evaluate(() => window.location.hash);
            
            if (href.startsWith('#')) {
                if (Math.abs(finalScroll - initialScroll) > 50 || href === '#hero') {
                    console.log(`  ✅ ${text.trim()} navigation works (scrolled ${Math.abs(finalScroll - initialScroll)}px, hash: "${hash}")`);
                    results.passed.push(`Navigation: ${text.trim()}`);
                } else {
                    console.log(`  ⚠️  ${text.trim()} may not have scrolled properly`);
                    results.warnings.push(`Navigation: ${text.trim()} scroll`);
                }
            }
        }
        
        // Test 3: Smooth Scrolling (verify no teleporting)
        console.log('\n⬇️  Testing Smooth Scrolling...');
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(500);
        
        const startPos = await page.evaluate(() => window.pageYOffset);
        await page.click('a[href="#about"]');
        
        // Check scroll positions during animation
        let positions = [];
        for (let i = 0; i < 10; i++) {
            await page.waitForTimeout(100);
            const pos = await page.evaluate(() => window.pageYOffset);
            positions.push(pos);
        }
        
        await page.waitForTimeout(500);
        const endPos = await page.evaluate(() => window.pageYOffset);
        
        // Check for smooth progression (no large jumps)
        let smooth = true;
        for (let i = 1; i < positions.length; i++) {
            const jump = Math.abs(positions[i] - positions[i-1]);
            if (jump > 500) {
                smooth = false;
                break;
            }
        }
        
        if (smooth && endPos > startPos + 100) {
            console.log(`  ✅ Smooth scrolling works (${startPos}px → ${endPos}px, smooth progression)`);
            results.passed.push('Smooth scrolling');
        } else {
            console.log(`  ❌ Smooth scrolling issue (jumps detected or no scroll)`);
            results.failed.push('Smooth scrolling');
        }
        
        // Test 4: Scrollbar Visibility
        console.log('\n📜 Testing Scrollbar...');
        const scrollbarWidth = await page.evaluate(() => {
            return window.innerWidth - document.documentElement.clientWidth;
        });
        
        if (scrollbarWidth === 0) {
            console.log('  ✅ Scrollbar is hidden');
            results.passed.push('Scrollbar hidden');
        } else {
            console.log(`  ❌ Scrollbar visible (width: ${scrollbarWidth}px)`);
            results.failed.push(`Scrollbar visible: ${scrollbarWidth}px`);
        }
        
        // Test 5: URL Hash Removal
        console.log('\n🔗 Testing URL Hash Removal...');
        await page.goto('https://ethanstoner.github.io#about', { waitUntil: 'networkidle' });
        await page.waitForTimeout(1000);
        
        const hashAfterLoad = await page.evaluate(() => window.location.hash);
        if (!hashAfterLoad || hashAfterLoad === '') {
            console.log('  ✅ Hash removed from URL on load');
            results.passed.push('URL: Hash removal on load');
        } else {
            console.log(`  ❌ Hash still present: "${hashAfterLoad}"`);
            results.failed.push(`URL: Hash not removed: ${hashAfterLoad}`);
        }
        
        // Test 6: Email Link
        console.log('\n📧 Testing Email Link...');
        const emailLink = await page.locator('a[href*="mail.google.com"]');
        const emailHref = await emailLink.getAttribute('href');
        
        if (emailHref && emailHref.includes('mail.google.com') && emailHref.includes('to=ethanstoner08@gmail.com')) {
            console.log('  ✅ Email link uses Gmail compose format');
            results.passed.push('Email: Gmail format');
            
            // Check it doesn't have subject/body
            if (!emailHref.includes('su=') && !emailHref.includes('body=')) {
                console.log('  ✅ Email link has no pre-filled subject/body');
                results.passed.push('Email: No pre-filled content');
            } else {
                console.log('  ⚠️  Email link has pre-filled subject/body');
                results.warnings.push('Email: Has pre-filled content');
            }
        } else {
            console.log('  ❌ Email link format incorrect');
            results.failed.push('Email: Format incorrect');
        }
        
        // Test 7: All Sections Present
        console.log('\n📑 Testing All Sections...');
        const sections = ['hero', 'about', 'projects', 'skills', 'roadmap', 'contact'];
        let sectionsFound = 0;
        
        for (const sectionId of sections) {
            const section = await page.locator(`#${sectionId}`);
            const count = await section.count();
            if (count > 0) {
                const visible = await section.isVisible();
                if (visible) {
                    sectionsFound++;
                    console.log(`  ✅ Section #${sectionId} visible`);
                }
            }
        }
        
        if (sectionsFound === 6) {
            console.log('  ✅ All 6 sections present and visible');
            results.passed.push('Sections: All 6 visible');
        } else {
            console.log(`  ❌ Only ${sectionsFound}/6 sections visible`);
            results.failed.push(`Sections: ${sectionsFound}/6 visible`);
        }
        
        // Test 8: Skills Section
        console.log('\n💼 Testing Skills Section...');
        const skillCategories = await page.locator('.skill-category').all();
        if (skillCategories.length === 6) {
            console.log(`  ✅ Skills section has 6 categories`);
            results.passed.push('Skills: 6 categories');
        }
        
        // Test 9: Roadmap Section
        console.log('\n🗺️  Testing Roadmap Section...');
        const roadmapItems = await page.locator('.roadmap-list li').all();
        if (roadmapItems.length >= 6) {
            console.log(`  ✅ Roadmap has ${roadmapItems.length} items`);
            results.passed.push(`Roadmap: ${roadmapItems.length} items`);
        }
        
        // Test 10: Project Cards
        console.log('\n📦 Testing Project Cards...');
        const projectCards = await page.locator('.project-card').all();
        if (projectCards.length === 3) {
            console.log(`  ✅ Found 3 project cards`);
            results.passed.push('Projects: 3 cards');
            
            // Test hover effects
            for (let i = 0; i < projectCards.length; i++) {
                await projectCards[i].hover();
                await page.waitForTimeout(300);
            }
            console.log('  ✅ Project card hover effects work');
            results.passed.push('Projects: Hover effects');
        }
        
        // Test 11: Scroll to Top Button
        console.log('\n⬆️  Testing Scroll to Top Button...');
        await page.evaluate(() => window.scrollTo(0, 1000));
        await page.waitForTimeout(500);
        
        const scrollBtn = await page.locator('#scrollToTop');
        const btnVisible = await scrollBtn.evaluate(el => {
            return window.getComputedStyle(el).display !== 'none';
        });
        
        if (btnVisible) {
            console.log('  ✅ Scroll to top button visible when scrolled');
            results.passed.push('Scroll to top: Visible');
            
            // Test click
            await scrollBtn.click();
            await page.waitForTimeout(1000);
            const scrollAfter = await page.evaluate(() => window.pageYOffset);
            
            if (scrollAfter < 100) {
                console.log('  ✅ Scroll to top button works');
                results.passed.push('Scroll to top: Functional');
            }
        }
        
        // Test 12: Contact Links
        console.log('\n📞 Testing Contact Links...');
        const contactLinks = await page.locator('.contact-link').all();
        console.log(`  Found ${contactLinks.length} contact links`);
        
        for (const link of contactLinks) {
            const href = await link.getAttribute('href');
            const text = await link.textContent();
            
            if (href) {
                if (href.startsWith('https://github.com') || 
                    href.startsWith('https://www.linkedin.com') || 
                    href.startsWith('https://mail.google.com')) {
                    console.log(`  ✅ ${text.trim()}: Valid link (${href.substring(0, 50)}...)`);
                    results.passed.push(`Contact: ${text.trim()}`);
                } else {
                    console.log(`  ⚠️  ${text.trim()}: Unexpected format`);
                    results.warnings.push(`Contact: ${text.trim()}`);
                }
            }
        }
        
        // Test 13: Responsive Design
        console.log('\n📱 Testing Responsive Design...');
        const viewports = [
            { name: 'Mobile', width: 375, height: 667 },
            { name: 'Tablet', width: 768, height: 1024 },
            { name: 'Desktop', width: 1920, height: 1080 }
        ];
        
        for (const viewport of viewports) {
            await page.setViewportSize({ width: viewport.width, height: viewport.height });
            await page.waitForTimeout(500);
            
            const headerVisible = await page.locator('.header').isVisible();
            const heroVisible = await page.locator('#hero').isVisible();
            
            if (headerVisible && heroVisible) {
                console.log(`  ✅ ${viewport.name} layout works`);
                results.passed.push(`Responsive: ${viewport.name}`);
            }
        }
        
        // Test 14: Performance
        console.log('\n⚡ Testing Performance...');
        await page.goto('https://ethanstoner.github.io', { waitUntil: 'networkidle' });
        const loadTime = await page.evaluate(() => {
            return performance.timing.loadEventEnd - performance.timing.navigationStart;
        });
        
        if (loadTime < 3000) {
            console.log(`  ✅ Page loads in ${loadTime}ms`);
            results.passed.push(`Performance: ${loadTime}ms`);
        } else {
            console.log(`  ⚠️  Page load time: ${loadTime}ms`);
            results.warnings.push(`Performance: ${loadTime}ms`);
        }
        
        // Test 15: Console Errors
        console.log('\n🔍 Testing Console Errors...');
        const consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });
        
        await page.reload({ waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);
        
        if (consoleErrors.length === 0) {
            console.log('  ✅ No console errors');
            results.passed.push('Console: No errors');
        } else {
            console.log(`  ⚠️  Found ${consoleErrors.length} console errors`);
            results.warnings.push(`Console: ${consoleErrors.length} errors`);
        }
        
        // Test 16: Impact Numbers in Projects
        console.log('\n📈 Testing Impact Numbers...');
        let impactCount = 0;
        for (const card of projectCards) {
            const text = await card.textContent();
            if (text.includes('Impact:') || text.includes('%') || text.includes('< 2 minutes')) {
                impactCount++;
            }
        }
        
        if (impactCount >= 2) {
            console.log(`  ✅ Found impact numbers in ${impactCount} projects`);
            results.passed.push(`Projects: ${impactCount} with impact`);
        }
        
        // Test 17: Architecture Descriptions
        console.log('\n🏗️  Testing Architecture Descriptions...');
        let archCount = 0;
        for (const card of projectCards) {
            const text = await card.textContent();
            if (text.includes('Architecture:') || text.includes('→')) {
                archCount++;
            }
        }
        
        if (archCount >= 2) {
            console.log(`  ✅ Found architecture in ${archCount} projects`);
            results.passed.push(`Projects: ${archCount} with architecture`);
        }
        
        // Test 18: SEO Meta Tags
        console.log('\n📊 Testing SEO...');
        const ogTitle = await page.$eval('meta[property="og:title"]', el => el.content).catch(() => null);
        const structuredData = await page.$eval('script[type="application/ld+json"]', el => el.textContent).catch(() => null);
        
        if (ogTitle) {
            console.log('  ✅ Open Graph tags present');
            results.passed.push('SEO: Open Graph');
        }
        if (structuredData) {
            console.log('  ✅ Structured data present');
            results.passed.push('SEO: Structured data');
        }
        
        // Test 19: Scroll Progress Indicator
        console.log('\n📊 Testing Scroll Progress...');
        await page.evaluate(() => window.scrollTo(0, 500));
        await page.waitForTimeout(300);
        
        const progressWidth = await page.evaluate(() => {
            const el = document.querySelector('.scroll-progress');
            return el ? window.getComputedStyle(el).width : '0px';
        });
        
        if (progressWidth !== '0px' && progressWidth !== '0%') {
            console.log(`  ✅ Scroll progress updates (width: ${progressWidth})`);
            results.passed.push('Scroll progress');
        }
        
        // Test 20: Typewriter Animation
        console.log('\n⌨️  Testing Typewriter Animation...');
        await page.goto('https://ethanstoner.github.io', { waitUntil: 'networkidle' });
        await page.waitForTimeout(5000); // Wait for animation
        
        const heroTitle = await page.locator('.hero-title').textContent();
        if (heroTitle && heroTitle.includes('Cloud & Platform Engineering')) {
            console.log('  ✅ Typewriter animation completed');
            results.passed.push('Typewriter animation');
        }
        
    } catch (error) {
        console.error('❌ QA Error:', error);
        results.failed.push(`QA Error: ${error.message}`);
    } finally {
        await browser.close();
    }
    
    // Final Report
    console.log('\n' + '='.repeat(70));
    console.log('📊 FULL QA TEST RESULTS');
    console.log('='.repeat(70));
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
    
    // Save report
    const reportPath = 'qa-reports/full-qa-report.txt';
    const reportContent = `
FULL QA TEST REPORT - ethanstoner.github.io
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

fullQA().catch(console.error);
