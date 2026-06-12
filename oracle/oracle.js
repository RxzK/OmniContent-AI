const { GoogleGenerativeAI } = require("@google/generative-ai");
const { crawl } = require('./indexer');
const { openURL, clickButtonOnPage, deployToRender } = require('./vision');
const chalk = require('chalk');
const fs = require('fs');
const readline = require('readline');
const path = require('path');
const { exec } = require('child_process');
require('dotenv').config({ path: '../backend/.env' });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const ROOT_DIR = path.join(__dirname, '..');
const ARTIFACT_DIR = 'C:/Users/Buba2/.gemini/antigravity/brain/b43b5df9-1a30-4b6e-bc00-49ae7aee5428';

// Global context/state
let index = [];
let chat = null;

async function handleCommand(response) {
    if (response.startsWith("COMMAND: open")) {
        const target = response.replace("COMMAND: open", "").trim();
        console.log(chalk.magenta(`Executing: Opening ${target}`));
        exec(`start "" "${target}"`);
    } else if (response.startsWith("COMMAND: WEB_ACTION deploy_render")) {
        const repoUrl = response.replace("COMMAND: WEB_ACTION deploy_render", "").trim();
        console.log(chalk.magenta(`[Oracle Vision] Deploying ${repoUrl} to Render...`));
        deployToRender(repoUrl).then(success => {
            console.log(success
                ? chalk.green('[Oracle Vision] Deployment triggered successfully!')
                : chalk.yellow('[Oracle Vision] Could not find the Apply button. Please try manually.')
            );
        });
    } else if (response.startsWith("COMMAND: WEB_ACTION click")) {
        const parts = response.replace("COMMAND: WEB_ACTION click", "").trim().split(" ");
        const url = parts[0];
        const buttonText = parts.slice(1).join(" ");
        console.log(chalk.magenta(`[Oracle Vision] Clicking "${buttonText}" on ${url}`));
        clickButtonOnPage(url, buttonText).then(({ clicked }) => {
            console.log(clicked
                ? chalk.green(`[Oracle Vision] Button clicked!`)
                : chalk.yellow(`[Oracle Vision] Button not found.`)
            );
        });
    }
}

async function processInput(input, loopCallback) {
    if (input.trim().startsWith('COMMAND:')) {
        await handleCommand(input.trim());
        if (loopCallback) loopCallback();
        return;
    }

    const contextItems = index.filter(item =>
        item.name.toLowerCase().includes(input.toLowerCase()) ||
        item.content.toLowerCase().includes(input.toLowerCase())
    ).slice(0, 5);

    let contextStr = "Here are some relevant files found on your PC:\n";
    contextItems.forEach(item => {
        contextStr += `- ${item.name} (${item.path}): ${item.content}...\n`;
    });

    const prompt = `
        USER QUERY: "${input}"
        ${contextStr}
        
        You are PC Oracle, a local extension of "Antigravity". 
        COMMANDS: 
        - "COMMAND: open <path or url>"
        - "COMMAND: WEB_ACTION click <url> <buttonText>"
        - "COMMAND: WEB_ACTION deploy_render <repoUrl>"
    `;

    try {
        const result = await chat.sendMessage(prompt);
        const response = result.response.text();

        if (response.startsWith("COMMAND:")) {
            await handleCommand(response);
        } else {
            console.log(chalk.white(response));
        }
    } catch (error) {
        console.error(chalk.red("Error:"), error.message);
    }
    if (loopCallback) loopCallback();
}

async function askOracle() {
    console.log(chalk.cyan("\n--- PC Oracle: Synchronizing with Assistant ---"));
    index = [...crawl(ROOT_DIR), ...crawl(ARTIFACT_DIR)];
    console.log(chalk.green(`Synchronization complete. Indexed ${index.length} files.`));

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    chat = model.startChat({ history: [] });

    console.log(chalk.yellow("\nAsk me anything about your PC or files. (Type 'exit' to quit)"));

    setInterval(() => {
        const remoteCmdPath = path.join(__dirname, 'remote_command.json');
        if (fs.existsSync(remoteCmdPath)) {
            try {
                const data = JSON.parse(fs.readFileSync(remoteCmdPath));
                fs.unlinkSync(remoteCmdPath);
                console.log(chalk.magenta(`\n\n[MESSAGE FROM ANTIGRAVITY]: ${data.message}`));
                processInput(data.message, null);
            } catch (e) { }
        }
    }, 1000);

    const loop = () => {
        rl.question(chalk.blue("> "), async (input) => {
            if (input.toLowerCase() === 'exit') {
                rl.close();
                process.exit();
            }
            processInput(input, loop);
        });
    };

    loop();
}

askOracle();
