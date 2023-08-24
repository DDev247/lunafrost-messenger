import { Page } from "puppeteer";
import { Message, sendMessage } from ".";
import axios from "axios";
import { formatLocale, getLocaleString } from "./translations";

// Dice command
const diceRoll = async (message: Message, contentBits: string[], page: Page) => {
    const sides = Number.parseInt(contentBits[1]) || 6;
    const result = Math.floor(Math.random() * sides) + 1;
    await sendMessage(formatLocale("diceRoll", { result, sides }), page);
};

// Coinflip command
const coinFlip = async (message: Message, page: Page) => {
    const result = Math.random() < 0.5 ? "Heads" : "Tails";
    await sendMessage(formatLocale("coinFlip", {result: getLocaleString("coinFlip" + result)}), page);
};

// 8ball responses
const eightBallResponses = [
    "Yes",
    "No",
    "Maybe",
    "Certainly not",
    "Ask again later",
    "Most likely",
    "It is uncertain",
    "Outlook good",
];

// 8ball
const eightBall = async (message: Message, page: Page) => {
    const response = eightBallResponses[Math.floor(Math.random() * eightBallResponses.length)];
    await sendMessage(`🎱 ${response}`, page);
};

// Fetches a joke from the JokeAPI
const joke = async (message: Message, page: Page) => {
    // const resp = await fetch("https://v2.jokeapi.dev/joke/Any?blacklistFlags=nsfw,racist,explicit");
    const resp = (await axios.get("https://v2.jokeapi.dev/joke/Any?safe-mode")).data;
    if (resp.type == "twopart") {
        await sendMessage(`🎭 ${resp.setup}\n${resp.delivery}`, page);
    }
    else if (resp.type == "single") {
        await sendMessage(`🎭 ${resp.joke}`, page);
    }
};

export { diceRoll, coinFlip, eightBall, joke };
