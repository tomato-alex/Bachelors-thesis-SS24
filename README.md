# Bachelor's Thesis Repository

## Markdown for Questionnaires

This repository contains the code for the **Markdown for Questionnaires** project. It includes a CLI program and a local Node.js server, which starts a graphical conversion tool for questionnaire markdown files.

### CLI Usage

```bash
node cli-questionnaire-md-parser.js
Usage: [options] <inputFile>

Arguments:
  inputFile                  Markdown file to parse

Options:
  -V, --version              Output the version number
  -o, --output <outputFile>  Specify the file to write the generated HTML to
  -d, --display              Display the generated HTML in the console
  -h, --help                 Display help for the command
```

#### Example usage:

`node cli-questionnaire-md-parser.js ../questionnaire.md -o output.html -d`

### GUI Tool usage

To run the graphical tool, use the following command:

```bash
node servermockup.js
```

Then, access the webpage at `http://localhost:3000/`. The GUI allows for users to upload a Markdown file with questionnaire syntax and visualizes the output directly in the browser.

TODO:

-   rename program name to be shorter
-   consider other program options
-   rename server executable
-   styles cleanup
-   index.html drag and drop and restyle
-   index.html copy and download html button
-   reformat the "architecture"
-   parser for different md syntax. Dont like the current one
-   dynamic script loading in webpage
-   multiselect doesnt work
