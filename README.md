# Bachelor's Thesis Repository

## Markdown for Questionnaires

This repository contains the code for the **Markdown for Questionnaires** project. It includes a CLI program and a local Node.js server, which starts a graphical conversion tool for questionnaire markdown files.

### Requirements

```bash
node
npm
```

### CLI Usage

After cloning the repository, run `npm install` to ensure all dependencies are installed.

```bash
node cli-questionnaire-md-parser.js
Usage: cli-questionnaire-md-parser [options] <inputFile>

CLI tool for parsing custom Markdown for questionnaires

Arguments:
  inputFile                  Markdown file to parse

Options:
  -V, --version              output the version number
  -o, --output <outputFile>  File to write the generated HTML to
  -t, --type <outputType>    File Type to be written to
  -d, --display              Display the generated HTML in the console
  --debug                    Display debug information
  -h, --help                 Display this help message
```

#### Example usage:

`node cli-questionnaire-md-parser.js ../questionnaire.md -o output.lss -t lss` > this will generate a lss file for LimeSurvey

`node cli-questionnaire-md-parser.js ../questionnaire.md -o output.json` > this will generate a json file structure

`node cli-questionnaire-md-parser.js ../questionnaire.md -o outputDir/output.lss` > if an output directory is specified but doesn't exist, it will be created

Example files and syntax you can find in ./examplesyntax specifically in `q4.md` and `q5.md`

You can then use the exported .lss file and import it directly into LimeSurvey.

### GUI Tool usage (BETA)

##### Running the tool locally

Alternatively, you can clone the repository and run the tool locally!

To run the graphical tool locally after cloning, use the following commands:

```bash
npm install
node servermockup.js
```

Then, access the webpage at `http://localhost:3000/`. The GUI allows for users to upload a Markdown file with questionnaire syntax and downloads an .lss file ~~and visualizes the output directly in the browser~~.

### Supported Limesurvey Question Types

-   [x] Radio Button
-   [x] Multi Select Question
-   [x] Input Text Area
-   [x] Display Text
-   [x] Date Input
-   [x] Number Input
-   [x] Dropdown
-   [ ] Rating (Five Point Choice)

| Task                                                                           | Status       |
| ------------------------------------------------------------------------------ | ------------ |
| ~~Priority! Check if compatibility works after update~~                        | Done         |
| ~~Implement a Json to LSS formatter~~                                          | Done         |
| ~~Add inheritance and use the Strategy pattern to decide which parser to use~~ | Done         |
| reimplement the frontend to be able to display the lss structure               | Out of scope |
| Implement syntax for required questions                                        | Out of scope |
| support markdown in question titles (bold, underline, etc)                     | Out of scope |
| rating implementation                                                          | Backlog      |
