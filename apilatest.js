const puppeteer = require('puppeteer-core');

module.exports = async (req, res) => {
  let browser;
  try {
    // 使用 Vercel 内置的 Chromium 路径
    const executablePath = process.env.CHROMIUM_PATH || '/usr/bin/chromium-browser';
    
    browser = await puppeteer.launch({
      executablePath,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: true,
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    await page.goto('https://www.ft28.cc/', { waitUntil: 'networkidle2', timeout: 30000 });

    const data = await page.evaluate(() => {
      const tds = document.querySelectorAll('td[data-v-3ea25d3d]');
      if (tds.length >= 7) {
        return {
          issue: tds[0].innerText.trim(),
          number: tds[1].innerText.trim(),
          size: tds[2].innerText.trim(),
          odd_even: tds[3].innerText.trim(),
          combination: tds[4].innerText.trim(),
          extreme: tds[5].innerText.trim(),
          special: tds[6].innerText.trim()
        };
      }
      return null;
    });

    await browser.close();

    if (data && data.issue) {
      res.status(200).json({ success: true, data });
    } else {
      res.status(500).json({ success: false, error: 'No valid data found' });
    }
  } catch (error) {
    if (browser) await browser.close();
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
