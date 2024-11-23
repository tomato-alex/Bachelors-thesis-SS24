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
    .option("-d, --display", "Display the generated HTML in the console")
    .help((info) => {
        return info;
    })
    .action((inputFile, options) => {
        fs.readFile(inputFile, "utf8", (err, data) => {
            if (err) {
                console.error(`Error reading file: ${err.message}`);
                process.exit(1);
            }

            // First, apply the custom questionnaire block parser
            // Then, parse the Markdown using the standard marked parser for basic Markdown
            const customMarkdownToHTML = parseMarkdownToHTML(data);
            const standardMarkdownToHTML = marked(customMarkdownToHTML);

            if (options.display) {
                console.log("custom html > " + customMarkdownToHTML);
                console.log("standard html > " + standardMarkdownToHTML);
            }

            if (options.output) {
                fs.writeFile(options.output, standardMarkdownToHTML, (err) => {
                    if (err) {
                        console.error(`Error writing file: ${err.message}`);
                        process.exit(1);
                    }
                    console.log(`Output written to ${options.output}`);
                });
            } else {
                console.log(standardMarkdownToHTML);
            }
        });
    });

program.parse(process.argv);
