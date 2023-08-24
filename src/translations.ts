
import * as fs from "node:fs";
import { getConfig } from "./config";

// Format string with a JSON array like `` tags do
const formatString = (format: string, args: Record<string, any>): string => {
    let response = format;
    Object.keys(args).forEach((key) => {
        response = response.replace("${" + key + "}", args[key].toString());
    });
    return response;
}

// Get locale string by id
const getLocaleString = (id: string): string => {
    return JSON.parse(fs.readFileSync(`assets/locale/${getConfig().currentLocale}.json`).toString())[id];
}

// Format locale string like `` tags do
const formatLocale = (id: string, args: Record<string, any>): string => {
    return formatString(getLocaleString(id), args);
}

export { getLocaleString, formatString, formatLocale };
