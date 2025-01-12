import { LssQuestionParser } from "./lssQuestionParser.js";

export class DisplayTextParser extends LssQuestionParser {
    parseQuestion(lines, currentId) {
        let idCounter = currentId;

        const label = this.parserHelper.parseLabel(lines);
        const helpText = this.parserHelper.parseHelpText(lines);

        const question = {
            id: `${++idCounter}`,
            code: "",
            label: label,
            help_text: helpText,
            type: "displaytext",
            type_lss: "X",
            mandatory: "N",
            encrypted: "N",
            question_order: "",
            question_theme_name: "boilerplate",
        };

        return { question: question, subquestions: [], newId: idCounter };
    }
}
