#!/usr/bin/env node

export function parseMarkdownToHTML(markdown) {
    // Helper functions
    const parseOptions = (optionsStr) => optionsStr.split(/\n\s*-\s*/).slice(1);

    const parseSlider2 = (block) => {
        const label = block.match(/label:\s*(.*)/)[1];
        const min = parseInt(block.match(/min:\s*(\d+)/)[1]);
        const max = parseInt(block.match(/max:\s*(\d+)/)[1]);
        const step = parseInt(block.match(/step:\s*(\d+)/)[1]);

        let html = `\n<label>${label} ${min} - ${max} {${step}}</label><br>`;
        html += `\n<input type="range" name="${label}" min="${min}" max="${max}" step="${step}" value="${min}" list="slider-values">`;
        html += `\n<datalist id="slider-values">`;
        for (let i = min; i <= max; i += step) {
            html += `\n\t<option value="${i}" label="${i}"></option>`;
        }
        html += "\n</datalist><br>";

        return html;
    };

    const parseSlider = (block) => {
        // Extracting values from the block using regex
        const label = block.match(/label:\s*(.*)/)[1];
        const min = parseInt(block.match(/min:\s*(\d+)/)[1]);
        const max = parseInt(block.match(/max:\s*(\d+)/)[1]);
        const step = parseInt(block.match(/step:\s*(\d+)/)[1]);

        // Create HTML with styles and formatting
        let html = `<div class="slider-container" style="margin-bottom: 20px; padding: 10px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">`;
        html += `\n\t<label for="${label}" style="font-size: 1.2em; font-weight: bold; color: #333;">${label}</label><br>`;
        html += `\n\t<input type="range" id="${label}" name="${label}" min="${min}" max="${max}" step="${step}" value="${min}" list="slider-values" 
                    style="width: 100%; height: 8px; background: #ddd; border-radius: 5px; outline: none; transition: all 0.3s;">`;
        html += `\n\t<datalist id="slider-values">`;

        // Adding options to the datalist
        for (let i = min; i <= max; i += step) {
            html += `\n\t<option value="${i}" label="${i}"></option>`;
        }

        html += `\n\t</datalist>`;
        html += `\n<div class="slider-value" style="margin-top: 10px; text-align: center; font-size: 1.2em; color: #555;">${min}</div>`;
        html += `\n</div>`;

        // Adding interactivity: displaying the current value of the slider
        html += `
            <script>
                document.addEventListener("DOMContentLoaded", function() {
                    const slider = document.getElementById("${label}");
                    const valueDisplay = slider.nextElementSibling;
                    slider.addEventListener("input", function() {
                        valueDisplay.textContent = slider.value;
                    });
                });
            </script>`;

        return html;
    };

    const parseRating2 = (block) => {
        const label = block.match(/label:\s*(.*)/)[1];
        const min = block.match(/min:\s*(\d+)/)[1];
        const max = block.match(/max:\s*(\d+)/)[1];
        const symbol = block.match(/symbol:\s*(.)/)[1];
        let ratingHTML = `\n<label>${label}</label><br>`;
        for (let i = min; i <= max; i++) {
            ratingHTML += `\n\t<input type="radio" name="${label}" value="${i}">${symbol.repeat(
                i
            )} `;
        }
        return ratingHTML + "<br>";
    };

    const ratingStyle = () => {
        let ratingHTML = "";
        ratingHTML += `.star-wrap {
            width: max-content;
            margin: 0 auto;
            position: relative;
            }
            .star-label.hidden {
            display: none;
            }
            .star-label {
            display: inline-flex;
            justify-content: center;
            align-items: center;
            width: 4rem;
            height: 4rem;
            }`;
        /*star shaped cutout, works  best if it is applied to a square*/
        /*from Clippy @ https://bennettfeely.com/clippy/*/
        ratingHTML += `\n.star-shape {
            background-color: gold;
            width: 80%;
            height: 80%;
            clip-path: polygon(
                50% 0%,
                61% 35%,
                98% 35%,
                68% 57%,
                79% 91%,
                50% 70%,
                21% 91%,
                32% 57%,
                2% 35%,
                39% 35%
            );
            }`;
        /* make stars *after* the checked radio gray*/
        ratingHTML += `\n.star:checked + .star-label ~ .star-label .star-shape {
            background-color: lightgray;
            }`;

        /*hide away the actual radio inputs*/
        ratingHTML += `\n.star {
            position: fixed;
            opacity: 0;
            left: -90000px;
            }`;

        ratingHTML += `\n.star:focus + .star-label {
            outline: 2px dotted black;
            }`;

        ratingHTML += `\n.skip-button {
            display: block;
            width: 2rem;
            height: 2rem;
            border-radius: 1rem;
            position: absolute;
            top: -2rem;
            right: -1rem;
            /*transform: translateY(-50%);*/
            text-align: center;
            line-height: 2rem;
            font-size:2rem;
            background-color: rgba(255, 255, 255, 0.1);
          }
          .skip-button:hover {
            background-color: rgba(255, 255, 255, 0.2);
          }
          #skip-star:checked ~ .skip-button {
            display: none;
          }`;
        return ratingHTML;
    };

    const parseRating = (block) => {
        const label = block.match(/label:\s*(.*)/)[1];
        const min = block.match(/min:\s*(\d+)/)[1];
        const max = block.match(/max:\s*(\d+)/)[1];
        const symbol = block.match(/symbol:\s*(.)/)[1];

        let ratingHTML = `\n<style>`;
        ratingHTML += ratingStyle();
        ratingHTML += `\n</style>`;

        ratingHTML += `\n<label>${label}</label><br>`;
        ratingHTML += `\n<div class="star-wrap">`;
        ratingHTML += `<input class="star" checked type="radio" value="-1" id="skip-star" name="star-radio" autocomplete="off" />`;
        ratingHTML += `<label class="star-label hidden"></label>`;

        for (let i = min; i <= max; i++) {
            ratingHTML += `\n<input class="star" type="radio" id="st-${i}" value="${i}" name="star-radio" autocomplete="off"`;
            ratingHTML += `\n style="`;
            ratingHTML += ratingStyle();
            ratingHTML += `"/>`;
            ratingHTML += `\n<label class="star-label" for="st-${i}"><div class="star-shape"></div></label>`;
        }
        ratingHTML += ` <label class="skip-button" for="skip-star">&times;</label>`;

        ratingHTML += `\n</div>`;
        ratingHTML += "<br>";
        return ratingHTML;
    };

    const parseRadio = (block) => {
        const label = block.match(/label:\s*(.*)/)[1];
        const options = parseOptions(block.match(/options:([\s\S]*)/)[1]);
        let radioHTML = `\n<label>${label}</label><br>`;
        options.forEach((option) => {
            radioHTML += `\n\t<input type="radio" name="${label}" value="${option}">${option}<br>`;
        });
        return radioHTML;
    };

    const parseMultiSelect = (block) => {
        const label = block.match(/label:\s*(.*)/)[1];
        const options = parseOptions(block.match(/options:([\s\S]*)/)[1]);
        let multiSelectHTML = `\n<label>${label}</label><br>`;
        options.forEach((option) => {
            multiSelectHTML += `\n\t<input type="checkbox" name="${label}" value="${option}">${option}<br>`;
        });
        return multiSelectHTML;
    };

    const parseTextInput = (block) => {
        const label = block.match(/label:\s*(.*)/)[1];
        const placeholder = block.match(/placeholder:\s*(.*)/)[1];
        return `\n<label>${label}</label><br><textarea name="${label}" placeholder="${placeholder}"></textarea><br>`;
    };

    const parseDropdown = (block, isMulti) => {
        const label = block.match(/label:\s*(.*)/)[1];
        const options = parseOptions(block.match(/options:([\s\S]*)/)[1]);
        const multiAttr = isMulti ? "multiple" : "";
        let dropdownHTML = `\n<label>${label}</label><select name="${label}" ${multiAttr}>`;
        options.forEach((option) => {
            dropdownHTML += `\n\t<option value="${option}">${option}</option>`;
        });
        return dropdownHTML + "\n</select><br>";
    };

    // Markdown block parsers
    const blockParsers = [
        { regex: /\[slider\]([\s\S]*?)\[\/slider\]/g, parser: parseSlider },
        { regex: /\[rating\]([\s\S]*?)\[\/rating\]/g, parser: parseRating },
        { regex: /\[radio\]([\s\S]*?)\[\/radio\]/g, parser: parseRadio },
        {
            regex: /\[multi-select\]([\s\S]*?)\[\/multi-select\]/g,
            parser: parseMultiSelect,
        },
        {
            regex: /\[text-input\]([\s\S]*?)\[\/text-input\]/g,
            parser: parseTextInput,
        },
        {
            regex: /\[dropdown-single\]([\s\S]*?)\[\/dropdown-single\]/g,
            parser: (block) => parseDropdown(block, false),
        },
        {
            regex: /\[dropdown-multi\]([\s\S]*?)\[\/dropdown-multi\]/g,
            parser: (block) => parseDropdown(block, true),
        },
    ];

    // Apply parsers to the markdown
    let html = markdown;
    blockParsers.forEach(({ regex, parser }) => {
        html = html.replace(regex, (match, blockContent) =>
            parser(blockContent.trim())
        );
    });

    return html;
}
