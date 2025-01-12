import { QuestionParser } from "./questionParser.js";

export class DatepickerParser extends QuestionParser {
    parseQuestion(lines, currentId) {
        let idCounter = currentId;

        const label = this.parserHelper.parseLabel(lines);
        const helpText = this.parserHelper.parseHelpText(lines);

        const question = {
            id: `${++idCounter}`,
            code: "",
            label: label,
            help_text: helpText,
            type: "date",
            type_lss: "D",
            mandatory: "N",
            encrypted: "N",
            question_order: "",
            question_theme_name: "date",
        };

        return { question: question, subquestions: [], newId: idCounter };
    }
}
