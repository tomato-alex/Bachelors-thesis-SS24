export class QuestionnaireParser {
    constructor() {
        this.output = "";
    }

    parseData(data) {
        this.output = data;
        return this.output;
    }

    exportData() {
        return this.output;
    }
}
