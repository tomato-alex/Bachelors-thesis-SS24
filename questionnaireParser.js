import { FormatConverter } from "./parserLibraries/formatConverter.js";
import { MarkdownToJson } from "./parserLibraries/mdToJson.js";
import { JsonToLss } from "./parserLibraries/jsonToLss.js";
import { MarkdownToHtml } from "./parserLibraries/mdToHtml.js";

export class QuestionnaireParser {
    constructor() {
        this.converter = new FormatConverter();
        this.convertedMarkdown = {};
    }

    async parseMarkdown(data, type) {
        const formatConverter = new MarkdownToJson();
        this.convertedMarkdown = await formatConverter.parseData(data);

        if (type === undefined || type === "") {
            type = "json";
        }

        let output;
        if (type === "lss") {
            console.log("Generating a LSS file");
            output = await this.generateLss();
        } else if (type === "html") {
            // implement new html parser
        } else if (type === "json") {
            console.log("Generating a JSON file");
            output = await this.generateJson();
        }

        return output;
    }

    async generateLss() {
        this.converter = new JsonToLss();
        return this.converter.parseData(this.convertedMarkdown);
    }

    async generateJson() {
        return this.convertedMarkdown;
    }
}
