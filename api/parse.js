import { QuestionnaireParser } from "../../questionnaireParser.js";

export default async function handler(req, res) {
    if (req.method === "POST") {
        const { markdown } = req.body;

        try {
            const questionnaireParser = new QuestionnaireParser();
            const lssFile = await questionnaireParser.parseMarkdown(
                markdown,
                "lss"
            );

            // Set the headers for downloading the file
            res.setHeader(
                "Content-Disposition",
                'attachment; filename="survey.lss"'
            );
            res.setHeader("Content-Type", "application/octet-stream");
            res.status(200).send(lssFile);
        } catch (error) {
            res.status(500).json({
                error: "An error occurred during the conversion",
            });
        }
    } else {
        res.status(405).json({ message: "Method Not Allowed" });
    }
}
