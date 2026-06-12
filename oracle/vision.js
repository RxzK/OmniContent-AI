const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Opera GX user data directory (inherits your sessions/cookies)
const OPERA_GX_PROFILE = 'C:\\Users\\Buba2\\AppData\\Roaming\\Opera Software\\Opera GX Stable';

async function launchBrowser(useProfile = true) {
    const options = {
        headless: false, // Show the browser window
        defaultViewport: null,
        args: ['--start-maximized']
    };

    if (useProfile) {
        // Use the user's existing Opera/Chromium profile to inherit sessions
        options.args.push(
            `--user-data-dir=${OPERA_GX_PROFILE}`,
            '--no-first-run',
            '--no-default-browser-check'
        );
    }

    const browser = await puppeteer.launch(options);
    const page = (await browser.pages())[0];
    return { browser, page };
}

async function openURL(url) {
    console.log(`[Oracle Vision] Opening: ${url}`);
    const { browser, page } = await launchBrowser(false);
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    return { browser, page };
}

async function clickButtonOnPage(url, buttonText) {
    console.log(`[Oracle Vision] Navigating to ${url} and clicking "${buttonText}"`);
    const { browser, page } = await launchBrowser(true); // Use profile for auth
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // Find and click button by text
    const clicked = await page.evaluate((text) => {
        const buttons = Array.from(document.querySelectorAll('button, a'));
        const target = buttons.find(el => el.textContent.trim().includes(text));
        if (target) { target.click(); return true; }
        return false;
    }, buttonText);

    if (clicked) {
        console.log(`[Oracle Vision] Clicked "${buttonText}" successfully!`);
        await new Promise(r => setTimeout(r, 5000)); // Wait for action
    } else {
        console.log(`[Oracle Vision] Could not find "${buttonText}".`);
    }

    return { browser, page, clicked };
}

async function deployToRender(repoUrl) {
    const renderUrl = `https://dashboard.render.com/blueprints/new?repo=${repoUrl}`;
    console.log(`[Oracle Vision] Deploying to Render: ${repoUrl}`);
    const { browser, page, clicked } = await clickButtonOnPage(renderUrl, 'Apply');

    await new Promise(r => setTimeout(r, 8000)); // Wait for deploy to start
    await browser.close();
    return clicked;
}

module.exports = { openURL, clickButtonOnPage, deployToRender, launchBrowser };
