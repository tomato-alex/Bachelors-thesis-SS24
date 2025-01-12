import { parse } from "marked";
import { ParserHelper } from "./parserHelper.js";

export class QuestionParser {
    constructor() {
        console.log("Constructing questionParser");
        this.parserHelper = new ParserHelper();
    }

    parseQuestion(lines, currentId) {
        let idCounter = currentId;

        const label = this.parserHelper.parseLabel(lines);
        const helpText = this.parserHelper.parseHelpText(lines);

        let question = {
            id: `${++idCounter}`,
            code: "",
            label: label,
            help_text: helpText,
            mandatory: "N",
            encrypted: "N",
            question_order: "",
            options: [],
        };

        const answerLine = lines.find(
            (line) => line.startsWith("()") || line.startsWith("[]")
        );

        if (!answerLine) {
            question.type = "text";
            question.type_lss = "T";
            question.question_theme_name = "longfreetext";

            return { question: question, subquestions: [], newId: idCounter };
        }

        let parseAnswersResult = this.parserHelper.parseAnswers(
            lines,
            answerLine.slice(0, 3),
            idCounter
        );

        if (answerLine.startsWith("()")) {
            question.type = "radio";
            question.type_lss = "L";
            question.question_theme_name = "listradio";

            question.options = parseAnswersResult.options;

            return {
                question: question,
                subquestions: [],
                newId: parseAnswersResult.newId,
            };
        } else if (answerLine.startsWith("[]")) {
            question.type = "checkbox";
            question.type_lss = "M";
            question.question_theme_name = "multiplechoice";

            return {
                question: question,
                subquestions: parseAnswersResult.options,
                newId: parseAnswersResult.newId,
            };
        }

        return {
            question: question,
            subquestions: [],
            newId: parseAnswersResult.newId,
        };
    }
}
