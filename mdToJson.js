export class QuestionnaireParser {
    constructor() {
        this.json = {
            title: "",
            language: "en",
            groups: [],
        };
        this.currentGroup = this.createGroup("g1", "G01");
        this.questionCount = 0;
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
            else if (line.startsWith("---")) {
                if (this.currentGroup) {
                    this.json.groups.push(this.currentGroup);
                }
                this.currentGroup = this.createGroup(
                    `g${this.json.groups.length + 1}`,
                    `G0${this.json.groups.length + 1}`
                );
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

    parseLabel(line) {
        const label = line.match(/:\s*"([^"]+)"/)[1];
        return label;
    }

    parseQuestion(line, lines) {
        const label = this.parseLabel(line);
        const question = {
            id: `q${++this.questionCount}`,
            code: `GQ0${this.questionCount}`,
            label: label,
            options: [],
        };

        if (lines[lines.indexOf(line) + 1].startsWith("() ")) {
            question.type = "radio";
            this.parseOptions(question, line, lines, "() ");
        } else if (lines[lines.indexOf(line) + 1].startsWith("[] ")) {
            question.type = "checkbox";
            this.parseOptions(question, line, lines, "[] ");
        } else {
            question.type = "text";
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
            id: `q${++this.questionCount}`,
            code: `GQ0${this.questionCount}`,
            label: label,
            type: "rating",
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
            id: `q${++this.questionCount}`,
            code: `GQ0${this.questionCount}`,
            label: label,
            type: "dropdown",
            options: [],
        };

        this.parseOptions(question, line, lines, "() ");

        this.currentGroup.questions.push(question);
    }

    parseOptions(question, line, lines, optionType) {
        // finds the index by the line
        while (lines[lines.indexOf(line) + 1].startsWith(optionType)) {
            const option = lines[lines.indexOf(line) + 1].substring(3);
            question.options.push({
                value: option,
                label: option,
                id: `q${this.questionCount}a${question.options.length + 1}`,
                code: `AO0${question.options.length + 1}`,
            });
            lines.splice(lines.indexOf(line) + 1, 1);
        }
    }

    parseDatepicker(line) {
        const label = this.parseLabel(line);
        const question = {
            id: `q${++this.questionCount}`,
            code: `GQ0${this.questionCount}`,
            label: label,
            type: "datepicker",
        };
        this.currentGroup.questions.push(question);
    }

    parseNumberInput(line) {
        const label = this.parseLabel(line);
        const question = {
            id: `q${++this.questionCount}`,
            code: `GQ0${this.questionCount}`,
            label: label,
            type: "number",
        };
        this.currentGroup.questions.push(question);
    }

    parseDisplayText(line) {
        const label = line.substring(3);
        const question = {
            id: `q${++this.questionCount}`,
            code: `GQ0${this.questionCount}`,
            label: label,
            type: "displaytext",
        };
        this.currentGroup.questions.push(question);
    }

    createGroup(id, code) {
        return {
            id: id,
            code: code,
            questions: [],
        };
    }

    exportData() {
        return JSON.stringify(this.json, null, 2);
    }
}
