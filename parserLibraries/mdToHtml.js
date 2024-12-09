#!/usr/bin/env node
import { marked } from "marked";
import { QuestionnaireParser } from "./questionnaireParser.js";

export class MarkdownToHtml extends QuestionnaireParser {
    constructor() {
        super();
        this.createParsers();
    }

    async parseData(data) {
        // First, apply the custom questionnaire block parser
        // Then, parse the Markdown using the standard marked parser for basic Markdown
        let html = data;
        this.blockParsers.forEach(({ regex, parser }) => {
            html = html.replace(regex, (match, blockContent) =>
                parser(blockContent.trim())
            );
        });

        this.output = marked(html);
        return this.output;
    }

    exportData() {
        return this.output;
    }

    createParsers() {
        this.blockParsers = [
            {
                regex: /\[slider\]([\s\S]*?)\[\/slider\]/g,
                parser: (block) => this.parseSlider(block),
            },
            {
                regex: /\[rating\]([\s\S]*?)\[\/rating\]/g,
                parser: (block) => this.parseRating(block),
            },
            {
                regex: /\[radio\]([\s\S]*?)\[\/radio\]/g,
                parser: (block) => this.parseRadio(block),
            },
            {
                regex: /\[multi-select\]([\s\S]*?)\[\/multi-select\]/g,
                parser: (block) => this.parseMultiSelect(block),
            },
            {
                regex: /\[text-input\]([\s\S]*?)\[\/text-input\]/g,
                parser: (block) => this.parseTextInput(block),
            },
            {
                regex: /\[dropdown-single\]([\s\S]*?)\[\/dropdown-single\]/g,
                parser: (block) => this.parseDropdown(block, false),
            },
            {
                regex: /\[dropdown-multi\]([\s\S]*?)\[\/dropdown-multi\]/g,
                parser: (block) => this.parseDropdown(block, true),
            },
        ];
    }

    parseOptions(optionsStr) {
        return optionsStr.split(/\n\s*-\s*/).slice(1);
    }

    parseSlider(block) {
        // Extracting values from the block using regex
        const label = block.match(/label:\s*(.*)/)[1];
        const min = parseInt(block.match(/min:\s*(\d+)/)[1]);
        const max = parseInt(block.match(/max:\s*(\d+)/)[1]);
        const step = parseInt(block.match(/step:\s*(\d+)/)[1]);

        // Create HTML with styles and formatting
        let html = `<label for="${label}" style="font-size: 1.2em; font-weight: bold; color: #333;">${label}</label><br>`;
        html += `\n<div class="slider-container" style="margin-bottom: 20px; padding: 10px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">`;
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
             <script class="questionnaire-md">
                 const slider = document.getElementById("${label}");
                 const valueDisplay = slider.nextElementSibling;
                 slider.addEventListener("input", function() {
                     valueDisplay.textContent = slider.value;
                 });
             </script>`;

        return html;
    }

    ratingStyle() {
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
            transition: background-color 0.3s;
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
    }

    // source: https://dev.to/vaibhavbshete/star-rating-input-using-html-css-45jj
    parseRating(block) {
        const label = block.match(/label:\s*(.*)/)[1];
        const min = block.match(/min:\s*(\d+)/)[1];
        const max = block.match(/max:\s*(\d+)/)[1];

        let ratingHTML = `\n<style>`;
        ratingHTML += this.ratingStyle();
        ratingHTML += `\n</style>`;

        ratingHTML += `\n<label for="${label}" style="font-size: 1.2em; font-weight: bold; color: #333;">${label}</label><br>`;
        ratingHTML += `\n<div class="star-wrap">`;
        ratingHTML += `<input class="star" checked type="radio" value="-1" id="skip-star" name="star-radio" autocomplete="off" />`;
        ratingHTML += `<label class="star-label hidden"></label>`;

        for (let i = min; i <= max; i++) {
            ratingHTML += `\n<input class="star" type="radio" id="st-${i}" value="${i}" name="star-radio" autocomplete="off"`;
            ratingHTML += `\n style="`;
            ratingHTML += this.ratingStyle();
            ratingHTML += `"/>`;
            ratingHTML += `\n<label class="star-label" for="st-${i}"><div class="star-shape"></div></label>`;
        }
        ratingHTML += ` <label class="skip-button" for="skip-star">&times;</label>`;

        ratingHTML += `\n</div>`;
        ratingHTML += "<br>";
        return ratingHTML;
    }

    parseRadio(block) {
        const label = block.match(/label:\s*(.*)/)[1];
        const options = this.parseOptions(block.match(/options:([\s\S]*)/)[1]);

        // Begin constructing the radio button HTML with some basic styling
        let radioHTML = `<div class="radio-group" style="margin-bottom: 15px;">`;
        radioHTML += `\n\t<label for="${label}" style="font-size: 1.2em; font-weight: bold; color: #333;">${label}</label><br>`;

        options.forEach((option, index) => {
            radioHTML += `\n\t<div class="radio-option" style="margin-bottom: 10px; display: flex; align-items: center;">`;
            radioHTML += `\n\t\t<input type="radio" id="${label}-${index}" name="${label}" value="${option}" `;
            radioHTML += `style="appearance: none; width: 20px; height: 20px; border: 2px solid #ccc; border-radius: 50%; 
                            margin-right: 10px; cursor: pointer; transition: background-color 0.3s, border 0.3s;">`;
            radioHTML += `\n\t\t<label for="${label}-${index}" style="font-size: 1em; color: #666; cursor: pointer;">${option}</label>`;
            radioHTML += `</div>`;
        });

        radioHTML += `</div>`;

        radioHTML += `<style>`;
        radioHTML += `\ninput[type="radio"]:checked {
                background-color: #4CAF50; /* Green color when selected */
                border-color: #4CAF50; /* Green border */
            }
            input[type="radio"]:checked::before {
                content: "\\2022"; /* Unicode for a filled circle */
                font-size: 18px;
                color: white; /* White circle in the center */
                position: absolute;
                top: 2px;
                left: 2px;
            }`;
        radioHTML += `</style>`;

        return radioHTML;
    }

    parseMultiSelect(block) {
        const label = block.match(/label:\s*(.*)/)[1];
        const options = this.parseOptions(block.match(/options:([\s\S]*)/)[1]);

        let multiSelectHTML = `<div class="multi-select-group" style="margin-bottom: 15px;">`;
        multiSelectHTML += `\n<label for="${label}" style="font-size: 1.2em; font-weight: bold; color: #333;">${label}</label><br>`;

        options.forEach((option, index) => {
            multiSelectHTML += `\n\t<div class="multi-select-option" style="margin-bottom: 10px; display: flex; align-items: center;">`;
            multiSelectHTML += `\n\t<input type="checkbox" name="${label}" value="${option}" id="${label}-${index}"`;
            multiSelectHTML += `style="appearance: none; width: 20px; height: 20px; border: 2px solid #ccc; border-radius: 35%; 
                                margin-right: 10px; cursor: pointer; transition: background-color 0.3s, border 0.3s;">`;
            multiSelectHTML += `\n\t\t<label for="${label}-${index}" style="font-size: 1em; color: #666; cursor: pointer;">${option}</label>`;
            multiSelectHTML += `</div>`;
        });

        multiSelectHTML += `</div>`;

        multiSelectHTML += `<style>`;
        multiSelectHTML += `\ninput[type="checkbox"]:checked {
                background-color: #4CAF50; /* Green color when selected */
                border-color: #4CAF50; /* Green border */
            }
            input[type="checkbox"]:checked::before {
                content: "\\2022"; /* Unicode for a filled circle */
                font-size: 18px;
                color: white; /* White circle in the center */
                position: absolute;
                top: 2px;
                left: 2px;
            }`;
        multiSelectHTML += `</style>`;
        return multiSelectHTML;
    }

    parseTextInput(block) {
        const label = block.match(/label:\s*(.*)/)[1];
        const placeholder = block.match(/placeholder:\s*(.*)/)[1];
        let textInputHTML = "";

        textInputHTML += `<div class="text-input-container" style="margin-bottom: 20px;">`;
        textInputHTML += `\n<label for="${label}" style="font-size: 1.2em; font-weight: bold; color: #333; margin-bottom: 5px; display: block;">${label}</label>`;
        textInputHTML += `\n<textarea name="${label}" placeholder="${placeholder}" 
                style="width: 90%; height: 150px; padding: 10px; font-size: 1em; border: 2px solid #ccc; 
                border-radius: 8px; transition: all 0.3s ease; resize: vertical;"></textarea>`;
        textInputHTML += `</div>`;

        return textInputHTML;
    }

    parseDropdown(block, isMulti) {
        const label = block.match(/label:\s*(.*)/)[1];
        const options = this.parseOptions(block.match(/options:([\s\S]*)/)[1]);
        const multiAttr = isMulti ? "multiple" : "";

        let dropdownHTML = "";

        dropdownHTML += `<div class="dropdown-container" style="margin-bottom: 20px;">`;
        dropdownHTML += `\n\t<label for="${label}" style="font-size: 1.2em; font-weight: bold; color: #333; margin-bottom: 5px; display: block;">${label}</label>`;
        dropdownHTML += `\n\t<select name="${label}" ${multiAttr} 
                style="width: 100%; padding: 10px; font-size: 1em; border: 2px solid #ccc; 
                border-radius: 8px; transition: all 0.3s ease; background-color: #fff;">`;

        options.forEach((option) => {
            dropdownHTML += `\n\t\t<option value="${option}">${option}</option>`;
        });

        dropdownHTML += `\n\t</select>`;
        dropdownHTML += `\n</div>`;

        dropdownHTML += `<script class="questionnaire-md">
        document.querySelector('select[name="${label}"]').querySelectorAll('option').forEach(option => {
            option.addEventListener('click', () => {
                console.log('option.selected ' + option.selected);
                option.setAttribute('selected', option.selected === 'selected' ? null : 'selected'); //TODO check why the multiselect doesnt work
                option.selected = !option.selected;
                console.log('option.selected ' + option.selected);
            });
        });
        </script>`;

        return dropdownHTML;
    }
}
