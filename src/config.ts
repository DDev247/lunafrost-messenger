
import * as fs from "node:fs";

// Config file wrapper
const getConfig = (file = "config.json") => {
    return JSON.parse(fs.readFileSync("assets/" + file).toString());
}

export { getConfig }
