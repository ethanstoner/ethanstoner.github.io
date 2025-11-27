const { chromium } = require('playwright');

async function testSmoothScroll() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    console.log('🧪 Testing smooth scrolling improvements...\n');
    
    try {
        await page.goto('https://ethanstoner.github.io', { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(2000);
        
        // Test 1: Check if scrollbar is hidden
        console.log('1. Testing scrollbar visibility...');
        const scrollbarWidth = await page.evaluate(() => {
            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
            return scrollbarWidth;
        });
        console.log(`   Scrollbar width: ${scrollbarWidth}px (should be 0 or very small)`);
        
        // Test 2: Test smooth scroll to "about" section
        console.log('\n2. Testing smooth scroll to "about" section...');
        const initialScroll = await page.evaluate(() => window.pageYOffset);
        console.log(`   Initial scroll position: ${initialScroll}px`);
        
        await page.click('a[href="#about"]');
        
        // Wait for scroll animation (800ms + buffer)
        await page.waitForTimeout(1000);
        
        const finalScroll = await page.evaluate(() => window.pageYOffset);
        console.log(`   Final scroll position: ${finalScroll}px`);
        console.log(`   Scroll distance: ${finalScroll - initialScroll}px`);
        
        if (finalScroll > initialScroll + 100) {
            console.log('   ✅ Smooth scroll works - page scrolled down');
        } else {
            console.log('   ⚠️  Scroll may not have worked properly');
        }
        
        // Test 3: Check URL hash update
        const hash = await page.evaluate(() => window.location.hash);
        console.log(`   URL hash: ${hash} (should be #about)`);
        if (hash === '#about') {
            console.log('   ✅ URL hash updated correctly');
        }
        
        // Test 4: Test smooth scroll to "projects"
        console.log('\n3. Testing smooth scroll to "projects" section...');
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(500);
        
        const projectsInitial = await page.evaluate(() => window.pageYOffset);
        await page.click('a[href="#projects"]');
        await page.waitForTimeout(1000);
        
        const projectsFinal = await page.evaluate(() => window.pageYOffset);
        console.log(`   Scrolled from ${projectsInitial}px to ${projectsFinal}px`);
        
        if (projectsFinal > projectsInitial + 100) {
            console.log('   ✅ Smooth scroll to projects works');
        }
        
        // Test 5: Test smooth scroll to "contact"
        console.log('\n4. Testing smooth scroll to "contact" section...');
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(500);
        
        const contactInitial = await page.evaluate(() => window.pageYOffset);
        await page.click('a[href="#contact"]');
        await page.waitForTimeout(1000);
        
        const contactFinal = await page.evaluate(() => window.pageYOffset);
        console.log(`   Scrolled from ${contactInitial}px to ${contactFinal}px`);
        
        if (contactFinal > contactInitial + 100) {
            console.log('   ✅ Smooth scroll to contact works');
        }
        
        // Test 6: Check if scrollbar CSS is applied
        console.log('\n5. Checking scrollbar CSS...');
        const scrollbarStyle = await page.evaluate(() => {
            const style = window.getComputedStyle(document.documentElement);
            return {
                webkitScrollbar: style.getPropertyValue('-webkit-scrollbar-width'),
                scrollbarWidth: style.getPropertyValue('scrollbar-width'),
                msOverflowStyle: style.getPropertyValue('-ms-overflow-style')
            };
        });
        console.log(`   CSS properties:`, scrollbarStyle);
        
        console.log('\n✅ All smooth scroll tests complete!');
        
    } catch (error) {
        console.error('❌ Test error:', error);
    } finally {
        await browser.close();
    }
}

testSmoothScroll().catch(console.error);
