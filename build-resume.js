const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

(async () => {
  const htmlPath = path.resolve(__dirname, 'resume.html');
  const pdfPath = path.resolve(__dirname, 'Ethan_Stoner_Resume.pdf');

  if (!fs.existsSync(htmlPath)) {
    console.error('resume.html not found');
    process.exit(1);
  }

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('file://' + htmlPath.replace(/\\/g, '/'), { waitUntil: 'networkidle' });
  await page.pdf({
    path: pdfPath,
    format: 'Letter',
    printBackground: true,
    margin: { top: '0in', bottom: '0in', left: '0in', right: '0in' },
  });
  await browser.close();
  console.log('Built', pdfPath);
})();
