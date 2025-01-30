import { ParserHelper } from "./parserHelper.js";

export class QuestionParser {
    constructor() {
        this.parserHelper = new ParserHelper();
    }

    parseQuestion(lines, currentId) {
        let idCounter = currentId;

        const label = this.parserHelper.parseLabel(lines);
        const helpText = this.parserHelper.parseHelpText(lines);

        // When updating to TypeScript,
        // Set the question to have those fields mandatory
        // The other fields should be optional.
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

        // If just a single line of text, it's a free text question
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

        // The brackets of the first line only are relevant
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

            question.options = parseAnswersResult.options;

            // lss specific
            parseAnswersResult.options.forEach((option) => {
                option.parent_qid = question.id;
            });

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
