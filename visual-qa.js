const { chromium } = require('playwright');
const fs = require('fs');

async function visualQA() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    console.log('🎨 Running Visual QA Analysis...\n');
    
    try {
        await page.goto('https://ethanstoner.github.io', { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(3000); // Wait for typewriter animation
        
        // Take screenshot
        await page.screenshot({ path: 'qa-reports/visual-analysis.png', fullPage: true });
        
        // Analyze visual elements
        const analysis = {
            darkTheme: false,
            fontLoaded: false,
            heroVisible: false,
            navVisible: false,
            projectsVisible: false
        };
        
        // Check dark theme
        const bodyBg = await page.evaluate(() => {
            return window.getComputedStyle(document.body).backgroundColor;
        });
        analysis.darkTheme = bodyBg.includes('15, 15, 15') || bodyBg.includes('rgb(15, 15, 15)');
        console.log(`✅ Dark Theme: ${analysis.darkTheme ? 'Applied' : 'NOT Applied'} (${bodyBg})`);
        
        // Check font
        const fontFamily = await page.evaluate(() => {
            return window.getComputedStyle(document.body).fontFamily;
        });
        analysis.fontLoaded = fontFamily.includes('Roboto Mono');
        console.log(`✅ Font: ${analysis.fontLoaded ? 'Roboto Mono Loaded' : 'NOT Loaded'} (${fontFamily})`);
        
        // Check hero section
        const heroTitle = await page.locator('.hero-title');
        analysis.heroVisible = await heroTitle.isVisible();
        const heroText = await heroTitle.textContent();
        console.log(`✅ Hero Section: ${analysis.heroVisible ? 'Visible' : 'NOT Visible'} - "${heroText}"`);
        
        // Check navigation
        const nav = await page.locator('.nav');
        analysis.navVisible = await nav.isVisible();
        console.log(`✅ Navigation: ${analysis.navVisible ? 'Visible' : 'NOT Visible'}`);
        
        // Check project cards
        const projectCards = await page.locator('.project-card');
        const cardCount = await projectCards.count();
        analysis.projectsVisible = cardCount === 3;
        console.log(`✅ Project Cards: ${cardCount} visible (expected 3)`);
        
        // Check button styles
        const btnPrimary = await page.locator('.btn-primary');
        const primaryBg = await btnPrimary.evaluate(el => {
            return window.getComputedStyle(el).backgroundColor;
        });
        console.log(`✅ Primary Button: Background ${primaryBg}`);
        
        // Check scroll progress
        const scrollProgress = await page.locator('.scroll-progress');
        const progressVisible = await scrollProgress.isVisible();
        const progressHeight = await scrollProgress.evaluate(el => {
            return window.getComputedStyle(el).height;
        });
        console.log(`✅ Scroll Progress: ${progressVisible ? 'Visible' : 'NOT Visible'} (height: ${progressHeight})`);
        
        // Test hover states
        console.log('\n🖱️  Testing Hover States...');
        await btnPrimary.hover();
        await page.waitForTimeout(300);
        const primaryHoverBg = await btnPrimary.evaluate(el => {
            return window.getComputedStyle(el).backgroundColor;
        });
        console.log(`  Primary Button Hover: ${primaryHoverBg}`);
        
        const firstCard = page.locator('.project-card').first();
        await firstCard.hover();
        await page.waitForTimeout(300);
        const cardBorder = await firstCard.evaluate(el => {
            return window.getComputedStyle(el).borderColor;
        });
        console.log(`  Project Card Hover Border: ${cardBorder}`);
        
        console.log('\n✅ Visual QA Complete!');
        console.log('📸 Screenshot saved to: qa-reports/visual-analysis.png');
        
    } catch (error) {
        console.error('❌ Visual QA Error:', error);
    } finally {
        await browser.close();
    }
}

visualQA().catch(console.error);
