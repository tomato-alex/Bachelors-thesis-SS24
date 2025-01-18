export class ParserHelper {
    constructor() {}

    parseLabel(lines) {
        if (lines[0].startsWith("## ")) {
            return lines[0].substring(3);
        }

        const label = lines[0].match(/:\s*"([^"]+)"/)[1];
        return label;
    }

    parseHelpText(lines) {
        if (lines.length === 1) {
            return "";
        }
        if (lines[1].startsWith(":: ")) {
            return lines[1].substring(3).replace(/\r/g, "");
        }
        return "";
    }

    parseAnswers(lines, optionType, currentId) {
        let idCounter = currentId;
        let options = [];

        lines.forEach((line) => {
            if (line.startsWith(optionType)) {
                const option = line.substring(3).replace(/\r/g, "");

                if (optionType === "() ") {
                    options.push({
                        value: option,
                        label: option,
                        id: `${++idCounter}`,
                        code: `AO0${idCounter}`,
                    });
                } else if (optionType === "[] ") {
                    options.push({
                        value: option,
                        label: option,
                        id: `${++idCounter}`,
                        code: `SQO0${idCounter}`,
                        parent_qid: "",
                        type_lss: "T",
                        other: "N",
                        encrypted: "N",
                        question_order: idCounter,
                    });
                }
            }
        });

        return { options: options, newId: idCounter };
    }
}
