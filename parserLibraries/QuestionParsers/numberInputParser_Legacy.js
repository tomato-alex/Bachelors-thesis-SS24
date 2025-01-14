import { QuestionParser } from "./questionParser.js";

export class NumberParser_Legacy extends QuestionParser {
    parseQuestion(lines, currentId) {
        let idCounter = currentId;

        const label = this.parserHelper.parseLabel(lines);
        const helpText = this.parserHelper.parseHelpText(lines);

        const question = {
            id: `${++idCounter}`,
            code: "",
            label: label,
            help_text: helpText,
            type: "numberinput",
            type_lss: "N",
            mandatory: "N",
            encrypted: "N",
            question_order: "",
            question_theme_name: "numerical",
        };

        return { question: question, subquestions: [], newId: idCounter };
    }
}
