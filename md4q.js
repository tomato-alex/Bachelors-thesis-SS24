import fs from "fs";
import path from "path";
import { program } from "commander";
import { QuestionnaireParser } from "./questionnaireParser.js";

// Command-line interface definition
program
    .version("1.0.0")
    .description("CLI tool for parsing custom Markdown for questionnaires")
    .helpOption("-h, --help", "Display this help message")
    .argument("<inputFile>", "Markdown file to parse")
    .option("-o, --output <outputFile>", "File to write the result to")
    .option("-t, --type <outputType>", "File Type to be written to")
    .option("-d, --display", "Display the generated HTML in the console")
    .option("-s, --syntax", "Display the parsed syntax in the console")
    .option("--debug", "Display debug information")
    .action(async (inputFile, options) => {
        try {
            if (options.syntax) {
                const syntax = [
                    { type: "Title", syntax: "#", example: "# Title" },
                    {
                        type: "Display Text",
                        syntax: "##",
                        example: "## Display Text",
                    },
                    {
                        type: "Question",
                        syntax: "?:",
                        example: '?:"What is your favorite color?"',
                    },
                    {
                        type: "Radio Button",
                        syntax: "?:\n()",
                        example:
                            '?:"What color do you prefer?"\n() Red\n() Blue\n() Green',
                    },
                    {
                        type: "Checkbox",
                        syntax: "?:\n[]",
                        example:
                            '?:"Select your hobbies"\n[] Reading\n[] Cooking\n[] Sports',
                    },
                    {
                        type: "Dropdown",
                        syntax: "+:\n()",
                        example:
                            '?:"What is your favorite color?"\n() Red\n() Blue\n() Green',
                    },
                    {
                        type: "Date",
                        syntax: "/:",
                        example: '/:"When is your birthday?"',
                    },
                    {
                        type: "Number",
                        syntax: "/:",
                        example: '/:"How old are you?"',
                    },
                    {
                        type: "Group",
                        syntax: "---",
                        example: "--- This is a new group name",
                    },
                    {
                        type: "Help Text",
                        syntax: "::",
                        example: '?:"Write a joke:"\n:: Use only 3 sentences.',
                    },
                ];

                const red = "\x1b[31m";
                const green = "\x1b[32m";
                const reset = "\x1b[0m";

                console.log(red + '\n\nTreat "\\n" as a new line!\n' + reset);
                console.log("Syntax:");
                console.table(syntax);
                process.exit(0);
            }

            if (!fs.existsSync(inputFile)) {
                console.error(`Error: Input file ${inputFile} does not exist.`);
                process.exit(1);
            }

            // Ensure the input file has a .md extension
            if (!inputFile.endsWith(".md")) {
                console.error(`Error: File must be a .md file`);
                process.exit(1);
            }

            const compatibleOutputTypes = ["lss", "json"];

            if (options.output) {
                const outputExt = path.extname(options.output).substring(1); // Get the file extension without the dot

                // Check if the output file has a compatible extension
                if (!compatibleOutputTypes.includes(outputExt)) {
                    console.error(
                        `Error: Output file extension .${outputExt} is not supported. Must be one of: ${compatibleOutputTypes.join(
                            ", "
                        )}`
                    );
                    process.exit(1);
                }
            }

            if (options.type && !compatibleOutputTypes.includes(options.type)) {
                console.error(
                    `Error: Output type ${
                        options.type
                    } is not supported. Must be one of: ${compatibleOutputTypes.join(
                        ", "
                    )}`
                );
                process.exit(1);
            }

            const data = await fs.promises.readFile(inputFile, "utf8");

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
                const outputDir = path.dirname(options.output);

                // Check if the output directory exists; create it if it doesn't
                if (!fs.existsSync(outputDir)) {
                    console.log(
                        `Output directory does not exist. Creating ${outputDir}...`
                    );
                    await fs.promises.mkdir(outputDir, { recursive: true });
                }

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
