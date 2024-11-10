import { marked } from "marked";
import fs from "fs";
import { program } from "commander";
import { parseMarkdownToHTML } from "./custom-questionnaire-syntax-parser.js";

// Command-line interface definition
program
    .version("1.0.0")
    .description("CLI tool for parsing custom Markdown for questionnaires")
    .argument("<inputFile>", "Markdown file to parse")
    .option("-o, --output <outputFile>", "File to write the generated HTML to")
    .action((inputFile, options) => {
        fs.readFile(inputFile, "utf8", (err, data) => {
            if (err) {
                console.error(`Error reading file: ${err.message}`);
                process.exit(1);
            }

            // Then, apply the custom questionnaire block parser
            const customHTML = parseMarkdownToHTML(data);
            console.log("custom html > " + customHTML);

            // First, parse the Markdown using the standard marked parser for basic Markdown
            const standardHTML = marked(customHTML);
            console.log("standard html > " + standardHTML);

            if (options.output) {
                fs.writeFile(options.output, standardHTML, (err) => {
                    if (err) {
                        console.error(`Error writing file: ${err.message}`);
                        process.exit(1);
                    }
                    console.log(`Output written to ${options.output}`);
                });
            } else {
                console.log(standardHTML);
            }
        });
    });

program.parse(process.argv);
