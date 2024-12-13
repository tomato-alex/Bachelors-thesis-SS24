import fs from "fs";
import { program } from "commander";
import { QuestionnaireParser } from "./questionnaireParser.js";

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
    .action(async (inputFile, options) => {
        try {
            const data = await fs.promises.readFile(inputFile, "utf8");
            if (!inputFile.endsWith(".md")) {
                console.error(`Error: File must be a .md file`);
                process.exit(1);
            }

            const questionnaireParser = new QuestionnaireParser();
            let output = await questionnaireParser.parseMarkdown(
                data,
                options.type
            );
            // Use the new MD to Json parser to first get the initial structure
            // Why json? To add more flexability when transforming into different formats like html, lss, xml or others

            if (options.debug) {
                console.log("Jsonified Markdown > \n" + output);
            }

            if (options.display) {
                console.log("Entire output > \n" + output);
            }

            if (options.output) {
                fs.promises.writeFile(options.output, output);
                console.log(`Output written to ${options.output}`);
            } else {
                console.log(output);
            }
        } catch (error) {
            console.error(`Error: ${error.message}`);
            process.exit(1);
        }
    });

program.parse(process.argv);
