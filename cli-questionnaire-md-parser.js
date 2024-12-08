import fs from "fs";
import { program } from "commander";
import { MarkdownToHtml } from "./parserLibraries/mdToHtml.js";
import { MarkdownToJson } from "./parserLibraries/mdToJson.js";
import { JsonToLss } from "./parserLibraries/jsonToLss.js";
import { QuestionnaireParser } from "./parserLibraries/questionnaireParser.js";

// Command-line interface definition
program
    .version("1.0.0")
    .description("CLI tool for parsing custom Markdown for questionnaires")
    .helpOption("-h, --help", "Display this help message")
    .argument("<inputFile>", "Markdown file to parse")
    .option("-o, --output <outputFile>", "File to write the generated HTML to")
    .option("-t, --type <outputType>", "File Type to be written to")
    .option("-d, --display", "Display the generated HTML in the console")
    .option("--debug", "Display debug information")
    .action((inputFile, options) => {
        fs.readFile(inputFile, "utf8", (err, data) => {
            if (err) {
                console.error(`Error reading file: ${err.message}`);
                process.exit(1);
            }

            if (!inputFile.endsWith(".md")) {
                console.error(`Error: File must be a .md file`);
                process.exit(1);
            }

            // Use the new MD to Json parser to first get the initial structure
            // Why json? To add more flexability when transforming into different formats like html, lss, xml or others
            const questionnaireParser = new MarkdownToJson();
            questionnaireParser.parseData(data);
            const markdownToJson = questionnaireParser.exportData();
            let output = markdownToJson;

            let jsonParser = new QuestionnaireParser();
            if (options.type === "html/depr") {
                // Parsing for the old version of the markdown syntax.
                // TODO implement json to Html with the new format();
                jsonParser = new MarkdownToHtml();
            } else if (options.type === "lss") {
                // Parsing for the new version of the markdown syntax.
                jsonParser = new JsonToLss();
            } else if (options.type === "html") {
                // implement new html parser
            } else if (options.type === "json") {
                fs.writeFile(options.output, output, (err) => {
                    if (err) {
                        console.error(`Error writing file: ${err.message}`);
                        process.exit(1);
                    }
                    console.log(`Output written to ${options.output}`);
                });
                return;
            }

            output = jsonParser.parseData(output).then((output) => {
                if (options.debug) {
                    console.log("Jsonified Markdown > \n" + markdownToJson);
                }

                if (options.display) {
                    console.log("Entire output > \n" + output);
                }

                if (options.output) {
                    fs.writeFile(options.output, output, (err) => {
                        if (err) {
                            console.error(`Error writing file: ${err.message}`);
                            process.exit(1);
                        }
                        console.log(`Output written to ${options.output}`);
                    });
                } else {
                    console.log(output);
                }
            });
        });
    });

program.parse(process.argv);
