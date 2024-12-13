import express from "express";
import fs from "fs";
import path from "path";
import { QuestionnaireParser } from "./questionnaireParser.js";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Use json in request bodies
app.use(express.json());

// Serve the frontend HTML file from 'public' folder
app.use(express.static(path.join(__dirname, "public")));

// Serve the index.html at the root path
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html")); // Absolute path
});

// Endpoint to handle the file upload and parsing
app.post("/parse", async (req, res) => {
    const markdown = req.body.markdown;

    const questionnaireParser = new QuestionnaireParser();
    const lssFile = await questionnaireParser.parseMarkdown(markdown, "lss");

    // Convert the markdown to an .lss file

    const filePath = path.join(__dirname, "survey.lss");
    fs.writeFileSync(filePath, lssFile);

    // Send the .lss file for download
    res.download(filePath, "survey.lss", (err) => {
        if (err) {
            console.error("Server Error:", err);
        }
        fs.unlinkSync(filePath); // Clean up after download
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
