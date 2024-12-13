# Bachelor's Thesis Repository

## Markdown for Questionnaires

This repository contains the code for the **Markdown for Questionnaires** project. It includes a CLI program and a local Node.js server, which starts a graphical conversion tool for questionnaire markdown files.

### Requirements

```bash
node
```

### CLI Usage

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

Example files and syntax you can find in ./examplesyntax specifically in `q4.md` and `q5.md`

You can then use the exported .lss file and import it straightly into LimeSurvey.

### GUI Tool usage

To run the graphical tool, use the following command:

```bash
node servermockup.js
```

Then, access the webpage at `http://localhost:3000/`. The GUI allows for users to upload a Markdown file with questionnaire syntax and visualizes the output directly in the browser.

TODO v2:

| Task                                                                        | Status                                    |
| --------------------------------------------------------------------------- | ----------------------------------------- |
| Implement a Json to LSS formatter                                           | In Progress (80% minimal feature support) |
| Add inheritance and use the Strategy pattern to decide which parser to use. | In Progress (html parser needed)          |
| ~~reimplement the frontend to be able to~~ display the lss structure        | In Progress (html parser needed)          |
| Implement syntax for required questions                                     | Analysis                                  |
| support markdown in question titles (bold, underline, etc)                  | Analysis                                  |
| rating implementation                                                       | Analysis                                  |
