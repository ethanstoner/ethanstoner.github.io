const { chromium } = require('playwright');

async function verifyImprovements() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    console.log('🔍 Verifying all improvements on live site...\n');
    
    const results = {
        smoothScroll: false,
        scrollbarHidden: false,
        enhancedDescriptions: false,
        personalAbout: false
    };
    
    try {
        await page.goto('https://ethanstoner.github.io', { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(3000);
        
        // Test 1: Verify smooth scrolling (not teleporting)
        console.log('1. Testing smooth scrolling...');
        const initialScroll = await page.evaluate(() => window.pageYOffset);
        
        // Click about link and measure scroll animation
        const scrollStart = Date.now();
        await page.click('a[href="#about"]');
        
        // Check scroll position at multiple intervals to verify smooth animation
        let previousPos = initialScroll;
        let smoothAnimation = true;
        
        for (let i = 0; i < 10; i++) {
            await page.waitForTimeout(100);
            const currentPos = await page.evaluate(() => window.pageYOffset);
            const change = Math.abs(currentPos - previousPos);
            
            // If position jumps more than 500px at once, it's teleporting
            if (change > 500 && i > 0) {
                smoothAnimation = false;
                break;
            }
            previousPos = currentPos;
        }
        
        await page.waitForTimeout(500);
        const finalScroll = await page.evaluate(() => window.pageYOffset);
        
        if (smoothAnimation && finalScroll > initialScroll + 100) {
            console.log(`   ✅ Smooth scroll works (scrolled from ${initialScroll}px to ${finalScroll}px)`);
            results.smoothScroll = true;
        } else {
            console.log(`   ❌ Smooth scroll failed - may be teleporting`);
        }
        
        // Test 2: Verify scrollbar is hidden
        console.log('\n2. Testing scrollbar visibility...');
        const scrollbarWidth = await page.evaluate(() => {
            return window.innerWidth - document.documentElement.clientWidth;
        });
        
        const scrollbarStyle = await page.evaluate(() => {
            const htmlStyle = window.getComputedStyle(document.documentElement);
            const bodyStyle = window.getComputedStyle(document.body);
            return {
                htmlScrollbarWidth: htmlStyle.getPropertyValue('scrollbar-width'),
                bodyScrollbarWidth: bodyStyle.getPropertyValue('scrollbar-width'),
                webkitScrollbar: htmlStyle.getPropertyValue('-webkit-scrollbar-width')
            };
        });
        
        if (scrollbarWidth === 0 || scrollbarStyle.htmlScrollbarWidth === 'none' || scrollbarStyle.bodyScrollbarWidth === 'none') {
            console.log(`   ✅ Scrollbar is hidden (width: ${scrollbarWidth}px)`);
            results.scrollbarHidden = true;
        } else {
            console.log(`   ❌ Scrollbar may be visible (width: ${scrollbarWidth}px)`);
            console.log(`   CSS: ${JSON.stringify(scrollbarStyle)}`);
        }
        
        // Test 3: Verify enhanced project descriptions
        console.log('\n3. Testing enhanced project descriptions...');
        const project1Text = await page.locator('.project-card').first().textContent();
        const hasWhatILearned = project1Text.includes('What I learned') || project1Text.includes('Tech highlights') || project1Text.includes('Key features');
        const hasDetailedDescription = project1Text.length > 200; // Enhanced descriptions are longer
        
        if (hasWhatILearned && hasDetailedDescription) {
            console.log(`   ✅ Enhanced descriptions found (length: ${project1Text.length} chars)`);
            results.enhancedDescriptions = true;
        } else {
            console.log(`   ❌ Enhanced descriptions not found`);
            console.log(`   Has "What I learned": ${hasWhatILearned}, Length: ${project1Text.length}`);
        }
        
        // Test 4: Verify personal About section
        console.log('\n4. Testing personal About section...');
        const aboutText = await page.locator('#about').textContent();
        const hasPersonalNarrative = aboutText.includes('What got me into cloud engineering') || 
                                     aboutText.includes('started with simple Python scripts') ||
                                     aboutText.includes('satisfying about seeing a system scale');
        
        if (hasPersonalNarrative) {
            console.log(`   ✅ Personal narrative found in About section`);
            results.personalAbout = true;
        } else {
            console.log(`   ❌ Personal narrative not found`);
            console.log(`   About text preview: ${aboutText.substring(0, 200)}...`);
        }
        
        // Test 5: Verify smoothScrollTo function exists
        console.log('\n5. Testing smoothScrollTo function...');
        const hasSmoothScrollFunction = await page.evaluate(() => {
            return typeof window.smoothScrollTo !== 'undefined' || 
                   document.body.innerHTML.includes('smoothScrollTo') ||
                   document.body.innerHTML.includes('easeInOutCubic');
        });
        
        // Check script.js content
        const scriptContent = await page.evaluate(() => {
            const scripts = Array.from(document.getElementsByTagName('script'));
            for (const script of scripts) {
                if (script.src && script.src.includes('script.js')) {
                    return 'external script';
                }
            }
            return 'inline or external';
        });
        
        console.log(`   Script type: ${scriptContent}`);
        if (hasSmoothScrollFunction) {
            console.log(`   ✅ Smooth scroll function detected`);
        } else {
            console.log(`   ⚠️  Smooth scroll function may not be loaded`);
        }
        
        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('📊 VERIFICATION RESULTS');
        console.log('='.repeat(60));
        console.log(`✅ Smooth Scrolling: ${results.smoothScroll ? 'PASS' : 'FAIL'}`);
        console.log(`✅ Scrollbar Hidden: ${results.scrollbarHidden ? 'PASS' : 'FAIL'}`);
        console.log(`✅ Enhanced Descriptions: ${results.enhancedDescriptions ? 'PASS' : 'FAIL'}`);
        console.log(`✅ Personal About Section: ${results.personalAbout ? 'PASS' : 'FAIL'}`);
        
        const allPassed = Object.values(results).every(r => r === true);
        console.log(`\n${allPassed ? '✅ ALL IMPROVEMENTS VERIFIED' : '❌ SOME IMPROVEMENTS MISSING'}`);
        
        // Take screenshot
        await page.screenshot({ path: 'qa-reports/verification-screenshot.png', fullPage: true });
        console.log('\n📸 Screenshot saved to: qa-reports/verification-screenshot.png');
        
    } catch (error) {
        console.error('❌ Verification error:', error);
    } finally {
        await browser.close();
    }
}

verifyImprovements().catch(console.error);
