import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { parseMarkdownToHTML } from "./custom-questionnaire-syntax-parser.js";
import { marked } from "marked";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const upload = multer({ dest: "uploads/" });

// Serve the frontend HTML file from 'public' folder
app.use(express.static(path.join(__dirname, "public")));

// Serve the index.html at the root path
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html")); // Absolute path
});

// Endpoint to handle the file upload and parsing
app.post("/parse", upload.single("markdown-file"), (req, res) => {
    const filePath = req.file.path;

    fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
            return res.status(500).send("Error reading the file");
        }

        // Parse the markdown
        const customHTML = parseMarkdownToHTML(data);
        //console.log("customHTML" + customHTML);
        const renderedHTML = marked(customHTML);

        // Return the rendered HTML to the client
        res.send(renderedHTML);

        // Optionally, delete the uploaded file
        fs.unlink(filePath, (err) => {
            if (err) console.error("Error deleting file:", err);
        });
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
