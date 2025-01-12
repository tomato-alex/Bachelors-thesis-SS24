import { FormatConverter } from "./formatConverter.js";
import { LssQuestionParser } from "./lssQuestionParsers/lssQuestionParser.js";
import { DropdownParser } from "./lssQuestionParsers/dropdownParser.js";
import { DatepickerParser } from "./lssQuestionParsers/datepickerParser.js";
import { NumberParser } from "./lssQuestionParsers/numberInputParser.js";
import { DisplayTextParser } from "./lssQuestionParsers/displayTextParser.js";

export class MarkdownToJson extends FormatConverter {
    constructor() {
        super();

        this.questionCount = 0;
        this.idCounter = 0;
        this.answerCounter = 0;

        this.json = {
            title: "",
            language: "en",
            groups: [],
        };

        this.questionParser = new LssQuestionParser();

        this.currentGroup = this.createGroup("Group 1");
    }

    async parseData(markdown) {
        const lines = markdown.split("\n");

        lines.forEach((line) => {
            line = line.trim();

            let linesToBeParsed = this.generateQuestionBlock(line, lines);

            // Detect survey title
            if (line.startsWith("# ") && this.json.title === "") {
                this.json.title = line.substring(2);
            }
            // Group separator
            else if (line.startsWith("--- ")) {
                if (this.currentGroup.questions.length === 0) {
                    this.currentGroup.name = line.substring(4);
                } else {
                    if (this.currentGroup) {
                        this.json.groups.push(this.currentGroup);
                    }
                    this.currentGroup = this.createGroup(line.substring(4));
                }
            }
            // Detect questions
            else if (line.startsWith("?:")) {
                this.questionParser = new LssQuestionParser();
                this.parseQuestion(linesToBeParsed);
            }
            // Slider or rating type
            else if (line.startsWith("/:")) {
                // To be reimplemented
                //this.parseRating(line);
            }
            // Dropdown type
            else if (line.startsWith("+:")) {
                this.questionParser = new DropdownParser();
                this.parseQuestion(linesToBeParsed);
            }
            // Datepicker
            else if (line.startsWith("#:")) {
                this.questionParser = new DatepickerParser();
                this.parseQuestion(linesToBeParsed);
            }
            // Number input
            else if (line.startsWith("%:")) {
                this.questionParser = new NumberParser();
                this.parseQuestion(linesToBeParsed);
            }
            //Display text
            else if (line.startsWith("## ")) {
                this.questionParser = new DisplayTextParser();
                this.parseQuestion(linesToBeParsed);
            }
        });

        // Push the last group if it hasn't been added
        if (this.currentGroup) {
            this.json.groups.push(this.currentGroup);
        }

        return this.json;
    }

    exportData() {
        return JSON.stringify(this.json, null, 2);
    }

    generateQuestionBlock(line, lines) {
        const startIndex = lines.indexOf(line + "\r");
        let endIndex = lines.indexOf("\r", startIndex + 1);

        if (endIndex === -1) {
            endIndex = lines.length;
        }

        return lines.slice(startIndex, endIndex);
    }

    addQuestionToGroup(question) {
        question.question.code = `GQ0${++this.questionCount}`;
        question.question.question_order = this.questionCount;

        this.currentGroup.questions.push(question.question);
        this.currentGroup.subquestions.push(...question.subquestions);
    }

    parseQuestion(linesToBeParsed) {
        let parseQuestionResult = this.questionParser.parseQuestion(
            linesToBeParsed,
            this.idCounter
        );
        this.addQuestionToGroup(parseQuestionResult);
        this.idCounter = parseQuestionResult.newId;
    }

    parseRating(line) {
        const [label, minMax] = line
            .match(/:\s*"([^"]+)"\s*(\d+\s*\d*)?/)
            .slice(1);
        let [min, max] = minMax.split(" ").map(Number);
        if (max == undefined) {
            max = min;
            min = 1;
        }
        const question = {
            id: `${++this.idCounter}`,
            code: `GQ0${++this.questionCount}`,
            label: label,
            type: "rating",
            type_lss: "F",
            mandatory: "N",
            encrypted: "N",
            question_order: this.questionCount,
            question_theme_name: "arrays/array",
            options: [
                {
                    min: min,
                    max: max,
                },
            ],
        };

        this.currentGroup.questions.push(question);
    }

    createGroup(name) {
        return {
            id: ++this.idCounter,
            code: `G0${this.json.groups.length + 1}`,
            questions: [],
            subquestions: [],
            name: name,
        };
    }
}
