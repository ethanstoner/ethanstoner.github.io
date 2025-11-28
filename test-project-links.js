const { chromium } = require('playwright');

async function testProjectLinks() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    console.log('🔗 Testing Project Links...\n');
    
    try {
        await page.goto('https://ethanstoner.github.io', { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(2000);
        
        const projectLinks = await page.locator('.project-link').all();
        const expectedUrls = [
            'https://github.com/ethanstoner/vulture',
            'https://github.com/ethanstoner/sora-bot',
            'https://github.com/ethanstoner/free-chatbot-api'
        ];
        
        console.log(`Found ${projectLinks.length} project links\n`);
        
        for (let i = 0; i < projectLinks.length; i++) {
            const link = projectLinks[i];
            const href = await link.getAttribute('href');
            const text = await link.textContent();
            
            console.log(`Link ${i + 1}: ${text.trim()}`);
            console.log(`  URL: ${href}`);
            
            if (expectedUrls[i] && href === expectedUrls[i]) {
                console.log(`  ✅ Correct URL`);
                
                // Test if the GitHub page exists
                try {
                    const response = await page.goto(href, { waitUntil: 'networkidle', timeout: 10000 });
                    if (response && response.status() === 200) {
                        const title = await page.title();
                        if (title && !title.includes('404')) {
                            console.log(`  ✅ GitHub repository exists and is accessible`);
                        } else {
                            console.log(`  ⚠️  GitHub page may not exist (404)`);
                        }
                    }
                } catch (e) {
                    console.log(`  ⚠️  Could not verify GitHub page: ${e.message}`);
                }
            } else {
                console.log(`  ❌ Incorrect URL (expected: ${expectedUrls[i]})`);
            }
            console.log('');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await browser.close();
    }
}

testProjectLinks().catch(console.error);
