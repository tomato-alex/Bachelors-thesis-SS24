document.addEventListener("DOMContentLoaded", () => {
    generateUploadFormEventListener();
    generateConvertedMarkdownSubmitEventListener();
});

function generateUploadFormEventListener() {
    document
        .getElementById("upload-form")
        .addEventListener("submit", async (event) => {
            event.preventDefault();

            const fileInput = document.getElementById("markdown-file");
            const file = fileInput.files[0];

            if (!file) {
                alert("Please upload a markdown file.");
                return;
            }

            const formData = new FormData();
            formData.append("markdown-file", file);

            // Send the file to the server
            const response = await fetch("/parse", {
                method: "POST",
                body: formData,
            });

            const result = await response.text();

            // Update rendered HTML section
            document.getElementById("rendered-form").innerHTML = result;

            // Optionally, append a submit button
            document.getElementById("rendered-form").innerHTML +=
                '<button type="submit" value="Submit">Submit</button>';

            // Update raw HTML code section
            document.getElementById("html-code-pre").textContent = result;

            const parser = new DOMParser();
            const doc = parser.parseFromString(result, "text/html");
            const scripts = doc.querySelectorAll("script");

            scripts.forEach((script) => {
                console.log("script" + script.textContent); //TODO remove this and also find a way to execute the added scripts
                const scriptTag = document.createElement("script");
                scriptTag.textContent = script.textContent;
                document.body.appendChild(scriptTag);
            });
        });
}

function generateConvertedMarkdownSubmitEventListener() {
    document
        .getElementById("rendered-form")
        .addEventListener("submit", function (event) {
            event.preventDefault(); // Prevent the default form submission

            const formData = new FormData(event.target);

            // Log each form entry
            console.log(JSON.stringify(event.target.value));
            // each input needs defined name and value pair, where dropdowns need to have the name in select and value in options
            for (let [name, value] of formData.entries()) {
                console.log(name, ":", value);
            }
        });
}
