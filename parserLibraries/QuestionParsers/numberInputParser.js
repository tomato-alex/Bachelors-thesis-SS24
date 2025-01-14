import { QuestionParser } from "./questionParser.js";

export class NumberParser extends QuestionParser {
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
            type_lss: "K",
            mandatory: "N",
            encrypted: "N",
            question_order: "",
            question_theme_name: "multiplenumerical",
        };

        const subquestions = [
            {
                qid: `${++idCounter}`,
                parent_qid: question.id,
                type_lss: "T",
                code: `SQO0${1}`,
                other: "N",
                encrypted: "N",
                question_order: 0,
                value: "",
                label: "",
            },
        ];

        return {
            question: question,
            subquestions: subquestions,
            newId: idCounter,
        };
    }
}
