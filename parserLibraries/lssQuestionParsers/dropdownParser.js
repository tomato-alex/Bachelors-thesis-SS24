import { LssQuestionParser } from "./lssQuestionParser.js";

export class DropdownParser extends LssQuestionParser {
    parseQuestion(lines, currentId) {
        let idCounter = currentId;

        const label = this.parserHelper.parseLabel(lines);
        const helpText = this.parserHelper.parseHelpText(lines);

        const question = {
            id: `${++idCounter}`,
            code: "",
            label: label,
            help_text: helpText,
            type: "dropdown",
            type_lss: "!",
            mandatory: "N",
            encrypted: "N",
            question_order: "",
            question_theme_name: "bootstrap_dropdown",
            options: [],
        };

        let parseAnswersResult = this.parserHelper.parseAnswers(
            lines,
            "() ",
            idCounter
        );
        question.options = parseAnswersResult.options;

        return {
            question: question,
            subquestions: [],
            newId: parseAnswersResult.newId,
        };
    }
}
