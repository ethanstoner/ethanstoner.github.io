const { chromium } = require('playwright');

async function verifyRepos() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    console.log('🔍 Verifying GitHub Repositories...\n');
    
    const repos = [
        { name: 'Vulture', url: 'https://github.com/ethanstoner/vulture' },
        { name: 'Sora Bot', url: 'https://github.com/ethanstoner/sora-bot' },
        { name: 'Free Chatbot API', url: 'https://github.com/ethanstoner/free-chatbot-api' }
    ];
    
    const results = { passed: [], failed: [] };
    
    for (const repo of repos) {
        try {
            console.log(`Checking ${repo.name}...`);
            const response = await page.goto(repo.url, { waitUntil: 'networkidle', timeout: 15000 });
            
            if (response && response.status() === 200) {
                const title = await page.title();
                if (title && !title.includes('404')) {
                    // Check for README
                    const readmeLink = await page.locator('a[href*="README"]').first();
                    const readmeExists = await readmeLink.count() > 0;
                    
                    // Check for .env.example
                    const envExampleLink = await page.locator('a[href*=".env.example"]').first();
                    const envExampleExists = await envExampleLink.count() > 0;
                    
                    console.log(`  ✅ Repository accessible`);
                    console.log(`  ✅ README: ${readmeExists ? 'Found' : 'Not found'}`);
                    console.log(`  ✅ .env.example: ${envExampleExists ? 'Found' : 'Not found'}`);
                    
                    results.passed.push(`${repo.name}: Accessible, README: ${readmeExists}, .env.example: ${envExampleExists}`);
                } else {
                    console.log(`  ❌ Repository not found (404)`);
                    results.failed.push(`${repo.name}: 404 Not Found`);
                }
            } else {
                console.log(`  ❌ HTTP ${response ? response.status() : 'error'}`);
                results.failed.push(`${repo.name}: HTTP ${response ? response.status() : 'error'}`);
            }
            console.log('');
        } catch (error) {
            console.log(`  ❌ Error: ${error.message}`);
            results.failed.push(`${repo.name}: ${error.message}`);
            console.log('');
        }
    }
    
    await browser.close();
    
    console.log('==========================================');
    console.log('📊 VERIFICATION RESULTS');
    console.log('==========================================');
    console.log(`✅ Passed: ${results.passed.length}`);
    console.log(`❌ Failed: ${results.failed.length}`);
    
    if (results.passed.length > 0) {
        console.log('\n✅ PASSED:');
        results.passed.forEach(r => console.log(`  ✓ ${r}`));
    }
    
    if (results.failed.length > 0) {
        console.log('\n❌ FAILED:');
        results.failed.forEach(r => console.log(`  ✗ ${r}`));
    }
    
    return results.failed.length === 0;
}

verifyRepos().catch(console.error);
