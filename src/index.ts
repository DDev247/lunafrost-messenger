import puppeteer, { Browser, ElementHandle, Page } from 'puppeteer';

import * as fun from "./fun";
import { formatLocale, formatString, getLocaleString } from './translations';
import { getConfig } from './config';

type Message = { user:string; content:string; it:string; };

var messagesRunning = false;

const sendMessage = async (message: string, page: Page) => {
    const selector = getConfig().selectors.input;
    await page.waitForSelector(selector);
    
    let bits = message.split("\n");
    for (let index = 0; index < bits.length; index++) {
        const element = bits[index];
        
        // type text
        await page.type(selector, element, {delay: 10});
        
        // type newline
        await page.keyboard.down('Shift');
        await page.keyboard.down('Enter');
        await page.keyboard.up('Enter');
        await page.keyboard.up('Shift');
    }

    await page.type(selector, "\n");

    // await page.click("div > div > div > div.x9f619.x1n2onr6.x1ja2u2z > div > div > div > div.x78zum5.xdt5ytf.x1t2pt76.x1n2onr6.x1ja2u2z.x10cihs4 > div.x9f619.x2lah0s.x1nhvcw1.x1qjc9v5.xozqiw3.x1q0g3np.x78zum5.x1iyjqo2.x1t2pt76.x1n2onr6.x1ja2u2z > div.x9f619.x1n2onr6.x1ja2u2z.xdt5ytf.x193iq5w.xeuugli.x1r8uery.x1iyjqo2.xs83m0k.x78zum5.x1t2pt76 > div > div > div > div > div > div > div > div.x1uvtmcs.x4k7w5x.x1h91t0o.x1beo9mf.xaigb6o.x12ejxvf.x3igimt.xarpa2k.xedcshv.x1lytzrv.x1t2pt76.x7ja8zs.x1n2onr6.x1qrby5j.x1jfb8zj > div > div > div:nth-child(2) > div > span.x4k7w5x.x1h91t0o.x1h9r5lt.xv2umb2.x1beo9mf.xaigb6o.x12ejxvf.x3igimt.xarpa2k.xedcshv.x1lytzrv.x1t2pt76.x7ja8zs.x1qrby5j.x3nfvp2 > div");
    console.log(`Sending "${message}"`);
}

const processNewMessage = async (message: Message, page: Page) => {
    // Skip bot messages and messages that don't start with our prefix
    if(message.user.startsWith("You") || !message.content.startsWith("!"))
        return;

    console.log(`Command '${message.content}' recieved from '${message.user}'`)

    const content = message.content.substring("!".length);
    const contentBits = content.split(" ");

    switch (contentBits[0]) {
        case "help":
            await sendMessage(getLocaleString("helpText"), page);
            break;
        case "about":
            await sendMessage(getLocaleString("aboutText"), page);
            break;
    
        case "hello":
            await sendMessage(formatLocale("helloReply" + Math.round(Math.random() * 4), {user: message.user}), page);
            break;
        case "joke":
            await fun.joke(message, page);
            break;
        case "dice":
            await fun.diceRoll(message, contentBits, page);
            break;
        case "coinflip":
            await fun.coinFlip(message, page);
            break;
        case "8ball":
            await fun.eightBall(message, page);
            break;

        default:
            break;
    }
}

const parseMessages = (children: { className:string; textContent:string; innerText:string; }[]) => {
    let returning = [];
    
    for(let child of children) {
        if(child.className.includes("x1n2onr6")) {
            const it = child.innerText;
            const bits = it.split("\n");
            const user = bits[0];
            let content = bits[1];
            for (let index = 1; index < bits.length-2; index++) {
                content += bits[index];
            }
            
            returning.push({ user, content, it });
        }
    }

    return returning;
}

const has = (arr: Message[], message: Message) => {
    for (let index = 0; index < arr.length; index++) {
        const m = arr[index];
        if (m.it == message.it) {
            return true;
        }
    }
    return false;
}

// Get children method for the messages element
const getChildren = async (element: ElementHandle<Element>) => {
    return await element.evaluate((e) => {
        const children = Array.from(e.children);
      
        // Create a list of children without unneeded parameters
        const serializableChildren = children.map(child => {
            return {
                className: child.className,
                textContent: child.textContent,
                innerText: (<HTMLElement> child).innerText,
            };
        });
      
        // Serialize the array as JSON
        return JSON.stringify(serializableChildren);
    })
}

const startMessages = async (page: Page) => {
    messagesRunning = true;
    // await sendMessage("LunaFrost is now online!", page);

    // start loop for checking new messages (ignore the ones already existing)
    const sel = getConfig().selectors.messages;
    console.log("    Waiting for messageElement");

    // Wait for the messages div incase it didn't load yet
    await page.waitForSelector(sel);
    //                                   fix typescript 'type unknown'
    const messagesElement = await page.$(<string>sel);

    // Check if the messages element isn't null or undefined
    if(messagesElement == null || messagesElement == undefined) {
        await sendMessage("LunaFrost error! 'Messages are null'", page);
        console.error("      messages are null");

        // Blindly wait until the message is really sent
        await new Promise((r) => {setTimeout(r, 1000)});
        
        // Tell the main "thread" that we are no longer awaiting messages
        messagesRunning = false;
        return;
    }

    // Messages element isn't undefined or null, continue
    // Get inner HTML (used for detecting changes)
    let lastInner = await messagesElement?.evaluate(el => el.innerHTML);

    console.log("    Getting messageElement.children");
    // Get elements
    // NOTE: messagesElement.evaluate(e => e.children) won't work for some reason!
    let children = JSON.parse(await getChildren(messagesElement));

    // Check if children are null or undefined
    if(children == null || children == undefined) {
        await sendMessage("LunaFrost error! 'Children are null'", page);
        console.error("      children are null");
        
        // Blindly wait until the message is really sent
        await new Promise((r) => {setTimeout(r, 1000)});
        
        // Tell the main "thread" that we are no longer awaiting messages
        messagesRunning = false;
        return;
    }

    // Parse the existing messages
    let lastMessages = parseMessages(children);
    console.log("    Base messages parsed...");
    console.log("Ready!");

    // At this point the bot is ready to receive new messages.

    const run = async () => {
        // Check if messages element isn't null or undefined again (?)
        if(messagesElement == null || messagesElement == undefined)
            return;

        // Get the inner HTML of the element to check if it has changed
        let inner = (await messagesElement?.evaluate(el => el.innerHTML));
        if(inner != lastInner) {
            // Get the children
            children = JSON.parse(await getChildren(messagesElement));

            // Check if children aren't null or undefined
            if(children == null || children == undefined)
                return;

            // Parse messages
            let newMessages = parseMessages(children);

            // Iterate over "new" messages
            // (we don't know if they are new though so it's kind of hacky but filter didn't work.)
            for (let index = lastMessages.length; index < newMessages.length; index++) {
                const element = newMessages[index];
                // console.log(element);

                // Process new message
                await processNewMessage(element, page);
            }

            lastMessages = newMessages;
            lastInner = inner;
        }

        // Set this method to run again in 500 miliseconds
        // (good enough since ping isnt like 10ms or something)
        setTimeout(run, 500);
    }

    run();
};

(async () => {
    console.log("Launching LunaFrost 1.0.0");

    // Launch the browser and open a new blank page
    let params = {};
    if(process.env["DEV"]) {
        console.log("    In DEVMODE");
        params = { debuggingPort: 9229, executablePath: "/bin/google-chrome-stable" }
    }
    else
        console.log("    In normal mode");

    const browser: Browser = await puppeteer.launch(params);
    const page: Page = await browser.newPage();

    // Navigate the page to the login page
    await page.goto("https://www.messenger.com/login/");

    // Set screen size
    await page.setViewport({width: 1080, height: 1024});

    // Wait for some time (?)
    await new Promise((resolve) => {setTimeout(resolve, 2500)});

    // Click accept only essential cookies
    console.log("Clicking cookie button...");
    const cookieButton = await page.$("[data-cookiebanner=accept_only_essential_button]");
    await cookieButton?.click();

    // Type into the login prompts
    console.log("Logging in...");
    await page.type('input#email', getConfig("login.json").email, {delay: 25});
    await page.type('input#pass', getConfig("login.json").pass, {delay: 25});
    await page.click('#loginbutton');

    // Wait for messenger to log in...
    console.log("Waiting for navigation...");
    await page.waitForNavigation();

    console.log(`Probably logged in with ${getConfig("login.json").email}`);

    // Go to wanted group URL
    await page.goto(getConfig("login.json").group);

    // Wait some time (?)
    await new Promise((resolve) => {setTimeout(resolve, 2500)});
    
    // Start the messages loop
    startMessages(page);

    while (messagesRunning) {
        await new Promise((resolve) => {setTimeout(resolve, 100)});
    }

    // After messagesRunning is false close the browser.
    console.log("Session finished. Closing browser");
    await browser.close();
})();

export { Message, sendMessage };
