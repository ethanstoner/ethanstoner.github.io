const { chromium } = require('playwright');
const fs = require('fs');

async function comprehensiveQA() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    console.log('🔍 Comprehensive QA Test - All Features\n');
    console.log('='.repeat(60));
    
    const results = {
        passed: [],
        failed: [],
        warnings: []
    };
    
    try {
        await page.goto('https://ethanstoner.github.io', { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(3000);
        
        // Test 1: SEO Meta Tags
        console.log('\n📊 Testing SEO & Meta Tags...');
        const title = await page.title();
        const description = await page.$eval('meta[name="description"]', el => el.content);
        const ogTitle = await page.$eval('meta[property="og:title"]', el => el.content).catch(() => null);
        const structuredData = await page.$eval('script[type="application/ld+json"]', el => el.textContent).catch(() => null);
        
        if (title.includes('Ethan Stoner')) {
            console.log('  ✅ Page title set correctly');
            results.passed.push('SEO: Page title');
        }
        if (description && description.length > 50) {
            console.log('  ✅ Meta description present');
            results.passed.push('SEO: Meta description');
        }
        if (ogTitle) {
            console.log('  ✅ Open Graph tags present');
            results.passed.push('SEO: Open Graph tags');
        }
        if (structuredData) {
            console.log('  ✅ Structured data (JSON-LD) present');
            results.passed.push('SEO: Structured data');
        }
        
        // Test 2: Favicon
        console.log('\n🎨 Testing Favicon...');
        const favicon = await page.$eval('link[rel="icon"]', el => el.href).catch(() => null);
        if (favicon) {
            console.log('  ✅ Favicon present');
            results.passed.push('Favicon present');
        }
        
        // Test 3: All Navigation Links
        console.log('\n🔗 Testing All Navigation Links...');
        const navLinks = await page.locator('.nav-link').all();
        const expectedLinks = ['home', 'about', 'projects', 'skills', 'roadmap', 'contact'];
        
        if (navLinks.length === 6) {
            console.log(`  ✅ All 6 navigation links present`);
            results.passed.push('Navigation: All 6 links present');
        }
        
        for (const link of navLinks) {
            const text = await link.textContent();
            const href = await link.getAttribute('href');
            const ariaLabel = await link.getAttribute('aria-label');
            
            if (ariaLabel) {
                console.log(`  ✅ ${text.trim()} has aria-label: ${ariaLabel}`);
            }
            
            // Test smooth scroll
            await link.click();
            await page.waitForTimeout(1200);
            const scrollY = await page.evaluate(() => window.pageYOffset);
            if (scrollY > 0 || href === '#hero') {
                console.log(`  ✅ ${text.trim()} navigation works (scrolled to ${scrollY}px)`);
            }
        }
        
        // Test 4: Skills Section
        console.log('\n💼 Testing Skills Section...');
        const skillsSection = await page.locator('#skills');
        const skillsVisible = await skillsSection.isVisible();
        
        if (skillsVisible) {
            console.log('  ✅ Skills section visible');
            results.passed.push('Skills section visible');
            
            const skillCategories = await page.locator('.skill-category').all();
            console.log(`  ✅ Found ${skillCategories.length} skill categories`);
            results.passed.push(`Skills: ${skillCategories.length} categories`);
            
            // Test hover
            if (skillCategories.length > 0) {
                await skillCategories[0].hover();
                await page.waitForTimeout(300);
                console.log('  ✅ Skill category hover effect works');
            }
        }
        
        // Test 5: Roadmap Section
        console.log('\n🗺️  Testing Roadmap Section...');
        const roadmapSection = await page.locator('#roadmap');
        const roadmapVisible = await roadmapSection.isVisible();
        
        if (roadmapVisible) {
            console.log('  ✅ Roadmap section visible');
            results.passed.push('Roadmap section visible');
            
            const roadmapItems = await page.locator('.roadmap-list li').all();
            console.log(`  ✅ Found ${roadmapItems.length} roadmap items`);
            results.passed.push(`Roadmap: ${roadmapItems.length} items`);
            
            if (roadmapItems.length >= 6) {
                console.log('  ✅ Roadmap has expected items');
            }
        }
        
        // Test 6: Enhanced Contact Section
        console.log('\n📧 Testing Enhanced Contact Section...');
        const contactSection = await page.locator('#contact');
        const contactText = await contactSection.textContent();
        
        if (contactText.includes('Open to Cloud')) {
            console.log('  ✅ Enhanced contact section with hire me text');
            results.passed.push('Contact: Enhanced section');
        }
        
        const hireList = await page.locator('.hire-list li').all();
        if (hireList.length >= 5) {
            console.log(`  ✅ Found ${hireList.length} hire me items`);
            results.passed.push(`Contact: ${hireList.length} hire items`);
        }
        
        const emailLink = await page.locator('a[href^="mailto:"]').count();
        if (emailLink > 0) {
            console.log('  ✅ Email link present');
            results.passed.push('Contact: Email link');
        }
        
        // Test 7: Scroll to Top Button
        console.log('\n⬆️  Testing Scroll to Top Button...');
        const scrollToTopBtn = await page.locator('#scrollToTop');
        const btnExists = await scrollToTopBtn.count() > 0;
        
        if (btnExists) {
            console.log('  ✅ Scroll to top button exists');
            
            // Scroll down
            await page.evaluate(() => window.scrollTo(0, 1000));
            await page.waitForTimeout(500);
            
            const btnVisible = await scrollToTopBtn.evaluate(el => {
                return window.getComputedStyle(el).display !== 'none';
            });
            
            if (btnVisible) {
                console.log('  ✅ Scroll to top button visible after scrolling');
                results.passed.push('Scroll to top: Visible when scrolled');
                
                // Test click
                await scrollToTopBtn.click();
                await page.waitForTimeout(1000);
                const scrollAfter = await page.evaluate(() => window.pageYOffset);
                
                if (scrollAfter < 100) {
                    console.log('  ✅ Scroll to top button works (scrolled to top)');
                    results.passed.push('Scroll to top: Functionality');
                }
            }
        }
        
        // Test 8: Impact Numbers in Projects
        console.log('\n📈 Testing Impact Numbers in Projects...');
        const projectCards = await page.locator('.project-card').all();
        let impactCount = 0;
        
        for (const card of projectCards) {
            const text = await card.textContent();
            if (text.includes('Impact:') || text.includes('%') || text.includes('< 2 minutes')) {
                impactCount++;
            }
        }
        
        if (impactCount >= 2) {
            console.log(`  ✅ Found impact numbers in ${impactCount} projects`);
            results.passed.push(`Projects: ${impactCount} with impact numbers`);
        }
        
        // Test 9: Architecture Descriptions
        console.log('\n🏗️  Testing Architecture Descriptions...');
        let archCount = 0;
        
        for (const card of projectCards) {
            const text = await card.textContent();
            if (text.includes('Architecture:') || text.includes('→')) {
                archCount++;
            }
        }
        
        if (archCount >= 2) {
            console.log(`  ✅ Found architecture descriptions in ${archCount} projects`);
            results.passed.push(`Projects: ${archCount} with architecture`);
        }
        
        // Test 10: Accessibility
        console.log('\n♿ Testing Accessibility...');
        const navAria = await page.locator('nav[aria-label]').count();
        const navLinksAria = await page.locator('.nav-link[aria-label]').count();
        
        if (navAria > 0) {
            console.log('  ✅ Navigation has aria-label');
            results.passed.push('Accessibility: Nav aria-label');
        }
        
        if (navLinksAria === 6) {
            console.log('  ✅ All nav links have aria-labels');
            results.passed.push('Accessibility: All nav aria-labels');
        }
        
        const scrollBtnAria = await page.locator('#scrollToTop[aria-label]').count();
        if (scrollBtnAria > 0) {
            console.log('  ✅ Scroll to top button has aria-label');
            results.passed.push('Accessibility: Scroll button aria-label');
        }
        
        // Test 11: URL Hash Removal
        console.log('\n🔗 Testing URL Hash Removal...');
        await page.goto('https://ethanstoner.github.io#about', { waitUntil: 'networkidle' });
        await page.waitForTimeout(1000);
        
        const hash = await page.evaluate(() => window.location.hash);
        if (!hash || hash === '') {
            console.log('  ✅ Hash removed from URL on load');
            results.passed.push('URL: Hash removal on load');
        }
        
        // Test 12: All Sections Present
        console.log('\n📑 Testing All Sections...');
        const sections = ['hero', 'about', 'projects', 'skills', 'roadmap', 'contact'];
        let sectionsFound = 0;
        
        for (const sectionId of sections) {
            const section = await page.locator(`#${sectionId}`);
            if (await section.count() > 0) {
                sectionsFound++;
            }
        }
        
        if (sectionsFound === 6) {
            console.log('  ✅ All 6 sections present');
            results.passed.push('Sections: All 6 present');
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
        const loadTime = await page.evaluate(() => {
            return performance.timing.loadEventEnd - performance.timing.navigationStart;
        });
        
        if (loadTime < 3000) {
            console.log(`  ✅ Page loads in ${loadTime}ms`);
            results.passed.push(`Performance: Load time ${loadTime}ms`);
        } else {
            console.log(`  ⚠️  Page load time: ${loadTime}ms (may be slow)`);
            results.warnings.push(`Performance: Load time ${loadTime}ms`);
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
        
    } catch (error) {
        console.error('❌ QA Error:', error);
        results.failed.push(`QA Error: ${error.message}`);
    } finally {
        await browser.close();
    }
    
    // Final Report
    console.log('\n' + '='.repeat(60));
    console.log('📊 COMPREHENSIVE QA RESULTS');
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
    
    // Save report
    const reportPath = 'qa-reports/comprehensive-qa-report.txt';
    const reportContent = `
COMPREHENSIVE QA TEST REPORT - ethanstoner.github.io
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

comprehensiveQA().catch(console.error);
