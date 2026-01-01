// 兼容 Vercel 的 Serverless Function 写法
const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');

module.exports = async (req, res) => {
  let browser;
  try {
    // 启动浏览器
    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    await page.goto('https://www.ft28.cc/', { waitUntil: 'networkidle2', timeout: 30000 });

    // 提取数据
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
      res.status(500).json({ success: false, error: 'No data found' });
    }
  } catch (error) {
    if (browser) await browser.close();
    res.status(500).json({ success: false, error: error.message });
  }
};
