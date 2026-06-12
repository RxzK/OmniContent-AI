const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Opera GX paths - uses your existing sessions/cookies (Render, GitHub, etc.)
const OPERA_GX_EXE = 'C:\\Users\\Buba2\\AppData\\Local\\Programs\\Opera GX\\opera.exe';
const OPERA_GX_PROFILE = 'C:\\Users\\Buba2\\AppData\\Roaming\\Opera Software\\Opera GX Stable';

async function launchBrowser(useProfile = true) {
    const options = {
        headless: false,
        defaultViewport: null,
        executablePath: OPERA_GX_EXE,
        args: [
            '--start-maximized',
            '--no-first-run',
            '--no-default-browser-check'
        ]
    };

    if (useProfile) {
        // Inherit Opera GX cookies/sessions (logged-in to Render, GitHub, etc.)
        options.args.push(`--user-data-dir=${OPERA_GX_PROFILE}`);
    }

    const browser = await puppeteer.launch(options);
    const page = (await browser.pages())[0] || await browser.newPage();
    return { browser, page };
}

async function openURL(url) {
    console.log(`[Oracle Vision] Opening: ${url}`);
    const { browser, page } = await launchBrowser(false);
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    return { browser, page };
}

async function clickButtonOnPage(url, buttonText) {
    console.log(`[Oracle Vision] Navigating to ${url}`);
    const { browser, page } = await launchBrowser(true); // Use profile for auth
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    console.log(`[Oracle Vision] Searching for "${buttonText}" button...`);

    // Improved search for button or submit input
    const clicked = await page.evaluate((text) => {
        const query = (s) => Array.from(document.querySelectorAll(s));
        // Try exact match and then partial match
        const elements = [...query('button'), ...query('a'), ...query('input[type="submit"]')];
        const target = elements.find(el => {
            const val = (el.innerText || el.value || "").trim().toLowerCase();
            return val === text.toLowerCase() || val.includes(text.toLowerCase());
        });

        if (target) {
            target.scrollIntoView();
            target.click();
            return true;
        }
        return false;
    }, buttonText);

    if (clicked) {
        console.log(`[Oracle Vision] Clicked "${buttonText}" successfully!`);
        await new Promise(r => setTimeout(r, 10000)); // Give time for transition
    } else {
        console.log(`[Oracle Vision] Could not find "${buttonText}" or similar element.`);
    }

    return { browser, page, clicked };
}

async function deployToRender(repoUrl) {
    const renderUrl = `https://dashboard.render.com/blueprints/new?repo=${repoUrl}`;
    console.log(`[Oracle Vision] Deploying to Render: ${repoUrl}`);

    // Try multiple possible labels for the "Apply" button
    const labels = ["Apply", "Apply Spec", "Aplicar"];
    let result = { clicked: false };

    for (const label of labels) {
        result = await clickButtonOnPage(renderUrl, label);
        if (result.clicked) break;
    }

    if (!result.clicked) {
        console.log(`[Oracle Vision] Manual review required. Keeping browser open.`);
    } else {
        console.log(`[Oracle Vision] Deployment initiated successfully.`);
    }

    // Do NOT close the browser - let the user finish if needed or see success
    return result.clicked;
}

module.exports = { openURL, clickButtonOnPage, deployToRender, launchBrowser };
