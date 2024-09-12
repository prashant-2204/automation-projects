const puppeteer = require('puppeteer');
let count=0;

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto('https://github.com/prashant-2204');

    // Open a new tab and switch to it
    const newPage = await browser.newPage();
    await newPage.goto('https://github.com/prashant-2204');
    
    // Optional: Automatically close the new tab if needed
    // await newPage.close();

    // Keep reloading the new tab every 2 seconds
    setInterval(async () => {
        await newPage.reload();
        count++;
        console.log(`New tab reloaded! ${count}`);
        if(count>100)
        {
            browser.close();
        }
    }, 1500);
})();
