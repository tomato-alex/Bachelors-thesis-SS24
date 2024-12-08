import { QuestionnaireParser } from "./questionnaireParser.js";
import xml2js from "xml2js";
import { promises as fs } from "fs";

export class JsonToLss extends QuestionnaireParser {
    constructor() {
        super();
        this.groupCount = 1;
        this.groupOrder = 1;
        this.questionOrder = 1;
        this.surveyId = 123456;
        //this.init();
    }

    async init() {
        try {
            this.output = await this.generateInitialStructure();
        } catch (err) {
            console.error("Error initializing structure:", err);
        }
    }
    async parseData(json) {
        const jsonData = JSON.parse(json);
        if (!this.output) {
            // Await the structure generation before proceeding
            this.output = await this.generateInitialStructure();
            this.initializeRows();
            console.log("Prefilled structure parsed...");
        }

        /*console.log(
            "survey title",
            JSON.stringify(this.output.document.groups[0].rows)
        );*/

        this.output.document.surveys_languagesettings[0].rows[0].row.surveyls_title =
            this.generateTitle(jsonData.title);
        this.output.document.languages[0].language = this.generateLanguage(
            jsonData.language
        );

        jsonData.groups?.forEach((group) => {
            this.questionOrder = 1;
            this.output.document.groups[0].rows[0].row.push(
                this.generateGroup(group)
            );

            this.output.document.group_l10ns[0].rows[0].row.push(
                this.generateGroupL10ns(group)
            );
            this.groupOrder++;

            group.questions.forEach((question) => {
                this.output.document.questions[0].rows[0].row.push(
                    this.generateQuestion(
                        question,
                        group.id,
                        this.questionOrder
                    )
                );
                this.output.document.question_l10ns[0].rows[0].row.push(
                    this.generateQuestionL10ns(question)
                );
                //this.generateQuestion(question, group.id, this.questionOrder);
                this.questionOrder++;
            });
        });

        return this.cleanXml(this.buildXml(this.output));
        console.log("returing jsonified output");
        return JSON.stringify(this.output);
        return this.output;
    }

    exportData() {
        return this.output;
    }

    initializeRows() {
        this.output.document.answers[0].rows = [{ row: [] }];
        this.output.document.answer_l10ns[0].rows = [{ row: [] }];
        this.output.document.groups[0].rows = [{ row: [] }];
        this.output.document.group_l10ns[0].rows = [{ row: [] }];
        this.output.document.questions[0].rows = [{ row: [] }];
        this.output.document.question_l10ns[0].rows = [{ row: [] }];
        this.output.document.subquestions[0].rows = [{ row: [] }];
        this.output.document.question_attributes[0].rows = [{ row: [] }];
    }

    attachToSkeleton(xmlToBeAttached, placeToAttach) {}

    buildXml(object) {
        const builder = new xml2js.Builder();
        return builder.buildObject(object);
    }

    removeHeader(object) {
        return object.replace(
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n',
            ""
        );
    }

    cleanXml(object) {
        return object
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">");
    }

    generateTitle(title) {
        return "<![CDATA[" + title + "]]>";
    }

    generateLanguage(language) {
        return language;
    }

    generateGroup(group) {
        const row = {
            gid: [{ _: "<![CDATA[" + group.id + "]]>" }],
            sid: [{ _: "<![CDATA[" + this.surveyId + "]]>" }],
            group_order: { _: "<![CDATA[" + this.groupOrder + "]]>" },
            randomization_group: { _: "" },
            grelevance: [{ _: "<![CDATA[1]]>" }],
        };
        return row;
    }

    generateGroupL10ns(group) {
        const row = {
            id: [{ _: "<![CDATA[" + group.id + "]]>" }],
            gid: [{ _: "<![CDATA[" + group.id + "]]>" }],
            group_name: [{ _: "<![CDATA[" + group.name + "]]>" }],
            description: [{ _: "" }],
            language: [
                {
                    _:
                        "<![CDATA[" +
                        this.output.document.languages[0].language +
                        "]]>",
                },
            ],
            sid: [{ _: "<![CDATA[" + this.surveyId + "]]>" }],
            group_order: { _: "<![CDATA[" + this.groupOrder + "]]>" },
            randomization_group: { _: "" },
            grelevance: [{ _: "<![CDATA[1]]>" }],
        };
        return row;
    }

    generateQuestion(question, groupId, questionOrder) {
        let row = {
            qid: [{ _: "<![CDATA[" + question.id + "]]>" }],
            parent_qid: [{ _: "<![CDATA[0]]>" }],
            sid: [{ _: "<![CDATA[" + this.surveyId + "]]>" }],
            gid: [{ _: "<![CDATA[" + groupId + "]]>" }],
            type: [{ _: "<![CDATA[" + question.type_lss + "]]>" }],
            title: [{ _: "<![CDATA[" + question.code + "]]>" }],
            other: [{ _: "<![CDATA[N]]>" }],
            mandatory: [{ _: "<![CDATA[" + question.mandatory + "]]>" }],
            encrypted: [{ _: "<![CDATA[" + question.encrypted + "]]>" }],
            question_order: { _: "<![CDATA[" + questionOrder + "]]>" },
            scale_id: [{ _: "<![CDATA[0]]>" }],
            same_default: [{ _: "<![CDATA[0]]>" }],
            relevance: [{ _: "<![CDATA[1]]>" }],
            question_theme_name: [
                { _: "<![CDATA[" + question.question_theme_name + "]]>" },
            ],
            same_script: [{ _: "<![CDATA[0]]>" }],
        };

        if (question.type != "text") {
            row = this.addModuleToQuestion(row, "modulename");
        }

        if (question.type == "number") {
            row = this.addModuleToQuestion(row, "preg");
        }

        return row;
    }

    generateQuestionL10ns(question) {
        let row = {
            id: [{ _: "<![CDATA[" + question.id + "]]>" }],
            qid: [{ _: "<![CDATA[" + question.id + "]]>" }],
            question: [{ _: "<![CDATA[" + question.label + "]]>" }],
            // TODO implement help syntax help: [{ _: "<![CDATA[" + question.help + "]]>" }],
            help: [{ _: "" }],
            language: [
                {
                    _:
                        "<![CDATA[" +
                        this.output.document.languages[0].language +
                        "]]>",
                },
            ],
        };

        const noScriptTypes = ["text", "arrays/array"];
        if (!noScriptTypes.includes(question.type)) {
            row = this.addModuleToQuestion(row, "script");
        }

        return row;
    }

    generateQuestionAttributes(question) {
        let row = {};
        return row;
    }

    addModuleToQuestion(question, module) {
        question[module] = [{ _: "" }];
        return question;
    }

    generateRating(question, groupId, questionOrder) {
        const row = {};
        return row;
    }

    async generateInitialStructure() {
        const structureFiles = [
            "./lssStructureFiles/SurveyPrefilled.lss",
            "./lssStructureFiles/DropdownPrefilled.lss",
            "./lssStructureFiles/DisplayTextPrefilled.lss",
            "./lssStructureFiles/DatePickerPrefilled.lss",
            "./lssStructureFiles/MultiselectPrefilled.lss",
            "./lssStructureFiles/RatingPrefilled.lss",
            "./lssStructureFiles/TextAreaPrefilled.lss",
            "./lssStructureFiles/RadioPrefilled.lss",
        ];
        //const skeletonStructureFile = "./lssStructureFiles/SurveyPrefilled.lss";

        try {
            const parser = new xml2js.Parser();
            let result = [];

            for (const structureFile of structureFiles) {
                // Use promise-based fs to read the file
                const data = await fs.readFile(
                    structureFile,
                    "utf8",
                    (err, data) => {
                        return data;
                    }
                );

                // Parse the XML
                let parseResult = await parser.parseStringPromise(data);
                let resultObject = {};
                resultObject[structureFile] = parseResult;
                result.push(resultObject);
            }

            console.log("result", result);
            return result; // Return parsed structure as output
        } catch (err) {
            console.error(`Error reading or parsing file: ${err.message}`);
            throw err; // Throw the error to handle it in the caller
        }
    }
}
