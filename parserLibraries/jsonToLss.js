import { QuestionnaireParser } from "./questionnaireParser.js";
import xml2js from "xml2js";
import { promises as fs } from "fs";
import path from "path";

export class JsonToLss extends QuestionnaireParser {
    constructor() {
        super();
        this.groupCount = 1;
        this.groupOrder = 1;
        this.questionOrder = 1;
        this.surveyId = 123456;
        this.finalDocument;
        this.structureFiles = [];
        this.questionsWithAnswers = ["radio", "dropdown", "checkbox"];
        //this.init();
    }

    async init() {
        try {
            this.output = await this.generateInitialStructure();
            // Here in the main structure there are
            // some vars that need to be set
            // like <surveyId>
            // <surveyLanguage>
            // and <surveyName>. Otherwise the program does not get imported
            // also multi select and rating dont work because they use subquestions??
            // need to figure this out
        } catch (err) {
            console.error("Error initializing structure:", err);
        }
    }
    async parseData(json) {
        const jsonData = JSON.parse(json);
        if (!this.output) {
            // Await the structure generation before proceeding
            this.structureFiles = await this.generateInitialStructure();
            this.output = this.structureFiles.SurveyPrefilled.document;
            this.output.surveys[0].rows[0].row[0].sid = this.surveyId;
            this.output.surveys[0].rows[0].row[0].language =
                this.output.languages[0].language;
            this.output.surveys_languagesettings[0].rows[0].row[0].sid =
                this.surveyId;
            this.output.surveys_languagesettings[0].rows[0].row[0].surveyls_language =
                this.output.languages[0].language;

            console.log("this.output", this.output);
            this.initializeRows();

            console.log("Prefilled structure parsed...");
        }

        /*console.log(
            "survey title",
            JSON.stringify(this.output.document.groups[0].rows)
        );*/

        this.output.surveys_languagesettings[0].rows[0].row.surveyls_title =
            this.generateTitle(jsonData.title);
        this.output.languages[0].language = this.generateLanguage(
            jsonData.language
        );

        jsonData.groups?.forEach((group) => {
            this.questionOrder = 1;
            this.output.groups[0].rows[0].row.push(this.generateGroup(group));

            this.output.group_l10ns[0].rows[0].row.push(
                this.generateGroupL10ns(group)
            );
            console.log("Generated group...");
            this.groupOrder++;

            group.questions.forEach((question) => {
                this.output.questions[0].rows[0].row.push(
                    this.generateQuestion(
                        question,
                        group.id,
                        this.questionOrder
                    )
                );
                this.output.question_l10ns[0].rows[0].row.push(
                    this.generateQuestionL10ns(question)
                );

                let attributes = this.generateQuestionAttributes(
                    question,
                    this.structureFiles[question.type]
                )?.row;

                if (attributes != undefined) {
                    this.output.question_attributes[0].rows[0].row.push(
                        ...attributes
                    );
                }

                this.questionOrder++;

                if (
                    question.options != [] &&
                    this.questionsWithAnswers.includes(question.type)
                ) {
                    question.options.forEach((option) => {
                        this.output.answers[0].rows[0].row.push(
                            this.generateAnswers(option, question)
                        );
                        this.output.answer_l10ns[0].rows[0].row.push(
                            this.generateAnswerL10ns(option, question)
                        );
                    });
                }
            });

            console.log("Generated questions...");
        });

        console.log("Generated structure...");

        return this.cleanXml(this.buildXml({ document: this.output }));
        console.log("returing jsonified output");
        return JSON.stringify(this.output);
        return this.output;
    }

    exportData() {
        return this.output;
    }

    initializeRows() {
        this.output.answers[0].rows = [{ row: [] }];
        this.output.answer_l10ns[0].rows = [{ row: [] }];
        this.output.groups[0].rows = [{ row: [] }];
        this.output.group_l10ns[0].rows = [{ row: [] }];
        this.output.questions[0].rows = [{ row: [] }];
        this.output.question_l10ns[0].rows = [{ row: [] }];
        //this.output.subquestions[0].rows = [{ row: [] }];
        this.output.question_attributes[0].rows = [{ row: [] }];
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
                    _: "<![CDATA[" + this.output.languages[0].language + "]]>",
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

    generateSubquestions(question, groupId, questionOrder) {
        let row = {
            qid: [{ _: "<![CDATA[" + question.id + "]]>" }],
            parent_qid: [{ _: "<![CDATA[" + question.parent_id + "]]>" }],
            sid: [{ _: "<![CDATA[" + this.surveyId + "]]>" }],
            gid: [{ _: "<![CDATA[" + groupId + "]]>" }],
            type: [{ _: "<![CDATA[" + question.type_lss + "]]>" }],
            title: [{ _: "<![CDATA[" + question.code + "]]>" }],
            other: [{ _: "<![CDATA[N]]>" }],
            encrypted: [{ _: "<![CDATA[" + question.encrypted + "]]>" }],
            question_order: { _: "<![CDATA[" + questionOrder + "]]>" },
            scale_id: [{ _: "<![CDATA[0]]>" }],
            same_default: [{ _: "<![CDATA[0]]>" }],
            relevance: [{ _: "<![CDATA[1]]>" }],
            same_script: [{ _: "<![CDATA[0]]>" }],
        };

        return row;
    }
    // TODO this is relevant for rating and apparently multiple choice

    generateQuestionL10ns(question) {
        let row = {
            id: [{ _: "<![CDATA[" + question.id + "]]>" }],
            qid: [{ _: "<![CDATA[" + question.id + "]]>" }],
            question: [{ _: "<![CDATA[" + question.label + "]]>" }],
            // TODO implement help syntax help: [{ _: "<![CDATA[" + question.help + "]]>" }],
            help: [{ _: "" }],
            language: [
                {
                    _: "<![CDATA[" + this.output.languages[0].language + "]]>",
                },
            ],
        };

        const noScriptTypes = ["text", "arrays/array"];
        if (!noScriptTypes.includes(question.type)) {
            row = this.addModuleToQuestion(row, "script");
        }

        return row;
    }

    generateQuestionAttributes(question, type) {
        if (type == null) {
            return;
        }
        let rows = structuredClone(type.rows.row);

        rows.forEach((row) => {
            const value = row.value[0];
            const attribute = row.attribute[0];
            if (question.type == "checkbox") {
                console.log(question.type, JSON.stringify(row));
                console.log("row value", value);
                console.log("row attribute", attribute);
            }

            row.qid = [{ _: "<![CDATA[" + question.id + "]]>" }];

            if (row.language != "") {
                row.language = [
                    {
                        _:
                            "<![CDATA[" +
                            this.output.languages[0].language +
                            "]]>",
                    },
                ];
            }
            if (row.value != "") {
                if (question.type == "checkbox") console.log("r2", row.value);
                row.value = [{ _: "<![CDATA[" + row.value + "]]>" }];
            }
            row.attribute = [{ _: "<![CDATA[" + row.attribute + "]]>" }];
        });

        return { row: rows };
    }

    generateAnswers(answer, question) {
        let row = {
            aid: [{ _: "<![CDATA[" + answer.id + "]]>" }],
            qid: [{ _: "<![CDATA[" + question.id + "]]>" }],
            code: [{ _: "<![CDATA[" + answer.code + "]]>" }],
            sortorder: [{ _: "<![CDATA[0]]>" }],
            assessment_value: [{ _: "<![CDATA[0]]>" }],
            scale_id: [{ _: "<![CDATA[0]]>" }],
        };

        return row;
    }

    generateAnswerL10ns(answer, question) {
        let row = {
            id: [{ _: "<![CDATA[" + answer.id + "]]>" }],
            aid: [{ _: "<![CDATA[" + answer.id + "]]>" }],
            answer: [{ _: "<![CDATA[" + answer.label + "]]>" }],
            language: [
                {
                    _: "<![CDATA[" + this.output.languages[0].language + "]]>",
                },
            ],
        };
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
            "./lssStructureFiles/checkbox.lss",
            "./lssStructureFiles/date.lss",
            "./lssStructureFiles/displaytext.lss",
            "./lssStructureFiles/dropdown.lss",
            "./lssStructureFiles/numberinput.lss",
            "./lssStructureFiles/radio.lss",
            "./lssStructureFiles/rating.lss",
            // free text area doesnt need a lss file
        ];
        //const skeletonStructureFile = "./lssStructureFiles/SurveyPrefilled.lss";

        try {
            const parser = new xml2js.Parser();
            let result = {};

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
                const fileName = path.parse(structureFile).name;
                result[fileName] = parseResult;
            }

            //console.log("result", JSON.stringify(result.checkbox));
            return result; // Return parsed structure as output
        } catch (err) {
            console.error(`Error reading or parsing file: ${err.message}`);
            throw err; // Throw the error to handle it in the caller
        }
    }
}