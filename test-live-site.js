const { chromium } = require('playwright');

async function testLiveSite() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    console.log('Testing live site...\n');
    
    try {
        await page.goto('https://ethanstoner.github.io', { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(2000);
        
        // Check scrollbar
        const scrollbarWidth = await page.evaluate(() => {
            return window.innerWidth - document.documentElement.clientWidth;
        });
        console.log(`Scrollbar width: ${scrollbarWidth}px`);
        
        // Check if smoothScrollTo exists
        const scriptContent = await page.evaluate(async () => {
            const response = await fetch('/script.js');
            const text = await response.text();
            return text.includes('smoothScrollTo');
        });
        console.log(`smoothScrollTo in script.js: ${scriptContent}`);
        
        // Test actual scroll behavior
        console.log('\nTesting scroll to about...');
        const start = await page.evaluate(() => window.pageYOffset);
        console.log(`Start position: ${start}px`);
        
        await page.click('a[href="#about"]');
        
        // Check positions during scroll
        for (let i = 0; i < 10; i++) {
            await page.waitForTimeout(100);
            const pos = await page.evaluate(() => window.pageYOffset);
            console.log(`  After ${(i+1)*100}ms: ${pos}px`);
        }
        
        await page.waitForTimeout(2000);
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        // Keep browser open for inspection
        await page.waitForTimeout(5000);
        await browser.close();
    }
}

testLiveSite().catch(console.error);
