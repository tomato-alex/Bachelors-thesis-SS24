export class FormatConverter {
    constructor() {
        this.output = "";
    }

    async parseData(data) {
        this.output = data;
        return this.output;
    }

    exportData() {
        return this.output;
    }
}
