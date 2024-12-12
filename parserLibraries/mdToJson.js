import { QuestionnaireParser } from "./questionnaireParser.js";

export class MarkdownToJson extends QuestionnaireParser {
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

        this.currentGroup = this.createGroup("Group 1");
    }

    parseData(markdown) {
        const lines = markdown.split("\n");

        lines.forEach((line) => {
            line = line.trim();

            // Detect survey title
            if (line.startsWith("# ") && this.json.title === "") {
                this.json.title = line.substring(2);
            }
            // Group separator
            else if (line.startsWith("--- ")) {
                if (this.currentGroup) {
                    this.json.groups.push(this.currentGroup);
                }
                this.currentGroup = this.createGroup(line.substring(4));
            }
            // Detect questions
            else if (line.startsWith("?:")) {
                this.parseQuestion(line, lines);
            }
            // Slider or rating type
            else if (line.startsWith("/:")) {
                this.parseRating(line);
            }
            // Dropdown type
            else if (line.startsWith("+:")) {
                this.parseDropdown(line, lines);
            }
            // Datepicker
            else if (line.startsWith("#:")) {
                this.parseDatepicker(line);
            }
            // Number input
            else if (line.startsWith("%:")) {
                this.parseNumberInput(line);
            }
            //Display text
            else if (line.startsWith("## ")) {
                this.parseDisplayText(line);
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

    parseLabel(line) {
        const label = line.match(/:\s*"([^"]+)"/)[1];
        return label;
    }

    parseQuestion(line, lines) {
        const label = this.parseLabel(line);
        const question = {
            id: `${++this.idCounter}`,
            code: `GQ0${++this.questionCount}`,
            label: label,
            mandatory: "N",
            encrypted: "N",
            question_order: this.questionCount,
            options: [],
        };

        line += "\r";

        if (lines[lines.indexOf(line) + 1].startsWith("() ")) {
            question.type = "radio";
            question.type_lss = "L";
            question.question_theme_name = "listradio";
            this.parseOptions(question, line, lines, "() ");
        } else if (lines[lines.indexOf(line) + 1].startsWith("[] ")) {
            question.type = "checkbox";
            question.type_lss = "M";
            question.question_theme_name = "multiplechoice";
            this.parseOptionsMultiSelect(
                this.currentGroup,
                question,
                line,
                lines,
                "[] "
            );
        } else {
            question.type = "text";
            question.type_lss = "T";
            question.question_theme_name = "longfreetext";
        }

        this.currentGroup.questions.push(question);
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

    parseDropdown(line, lines) {
        const label = this.parseLabel(line);
        const question = {
            id: `${++this.idCounter}`,
            code: `GQ0${++this.questionCount}`,
            label: label,
            type: "dropdown",
            type_lss: "!",
            mandatory: "N",
            encrypted: "N",
            question_order: this.questionCount,
            question_theme_name: "list_dropdown",
            options: [],
        };

        line += "\r";

        this.parseOptions(question, line, lines, "() ");

        this.currentGroup.questions.push(question);
    }

    parseOptionsMultiSelect(group, question, line, lines, optionType) {
        let orderCounter = 0;
        while (lines[lines.indexOf(line) + 1].startsWith(optionType)) {
            const option = lines[lines.indexOf(line) + 1]
                .substring(3)
                .replace(/\r/g, "");
            group.subquestions.push({
                qid: `${++this.idCounter}`,
                parent_qid: question.id,
                type_lss: "T",
                code: `SQO0${orderCounter + 1}`,
                other: "N",
                encrypted: "N",
                question_order: orderCounter++,
                value: option,
                label: option,
            });

            lines.splice(lines.indexOf(line) + 1, 1);
        }
    }

    parseOptions(question, line, lines, optionType) {
        // finds the index by the line
        while (lines[lines.indexOf(line) + 1].startsWith(optionType)) {
            const option = lines[lines.indexOf(line) + 1]
                .substring(3)
                .replace(/\r/g, "");
            question.options.push({
                value: option,
                label: option,
                id: `${++this.answerCounter}`,
                code: `AO0${question.options.length + 1}`,
            });
            lines.splice(lines.indexOf(line) + 1, 1);
        }
    }

    parseDatepicker(line) {
        const label = this.parseLabel(line);
        const question = {
            id: `${++this.idCounter}`,
            code: `GQ0${this.questionCount}`,
            label: label,
            type: "date",
            type_lss: "D",
            mandatory: "N",
            encrypted: "N",
            question_order: this.questionCount,
            question_theme_name: "date",
        };
        this.currentGroup.questions.push(question);
    }

    parseNumberInput(line) {
        const label = this.parseLabel(line);
        const question = {
            id: `${++this.idCounter}`,
            code: `GQ0${this.questionCount}`,
            label: label,
            type: "numberinput",
            type_lss: "N",
            mandatory: "N",
            encrypted: "N",
            question_order: this.questionCount,
            question_theme_name: "numerical",
        };
        this.currentGroup.questions.push(question);
    }

    parseDisplayText(line) {
        const label = line.substring(3);
        const question = {
            id: `${++this.idCounter}`,
            code: `GQ0${++this.questionCount}`,
            label: label,
            type: "displaytext",
            type_lss: "X",
            mandatory: "N",
            encrypted: "N",
            question_order: this.questionCount,
            question_theme_name: "boilerplate",
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
