/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI } from '@google/genai';
import { marked } from 'marked';

// --- DOM Element Selection ---
const codeInput = document.getElementById('codeInput') as HTMLTextAreaElement;
const analyzeBtn = document.getElementById('analyzeBtn') as HTMLButtonElement;
const resultsContainer = document.getElementById('results') as HTMLDivElement;
const languageSelect = document.getElementById('languageSelect') as HTMLSelectElement;
const btnText = analyzeBtn.querySelector('.btn-text') as HTMLSpanElement;
const spinner = analyzeBtn.querySelector('.spinner') as HTMLDivElement;

// --- State Management ---
const setButtonLoading = (isLoading: boolean) => {
    analyzeBtn.disabled = isLoading;
    if (isLoading) {
        btnText.textContent = 'Analyzing...';
        spinner.hidden = false;
    } else {
        btnText.textContent = 'Analyze Code';
        spinner.hidden = true;
    }
};

// --- Gemini AI Initialization ---
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Core Logic ---
const analyzeCode = async () => {
    const code = codeInput.value.trim();
    if (!code) {
        return;
    }

    setButtonLoading(true);
    resultsContainer.innerHTML = ''; // Clear previous results

    try {
        const selectedLanguage = languageSelect.value;
        const prompt = `
        Analyze the following code snippet. Provide a comprehensive analysis covering these points, in ${selectedLanguage}:

        1.  **Line-by-Line Explanation**: Explain the code's functionality, breaking it down line by line or in logical blocks.
        2.  **Bugs and Inefficiencies**: Identify any potential bugs, logical errors, or inefficient patterns.
        3.  **Optimization Suggestions**: Suggest improvements for performance and readability.
        4.  **Optimized Version**: Provide an optimized version of the code with explanatory comments.

        Format your response in clear, readable Markdown.

        --- CODE SNIPPET ---
        \`\`\`
        ${code}
        \`\`\`
        `;

        const responseStream = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        let fullResponse = '';
        for await (const chunk of responseStream) {
            fullResponse += chunk.text;
            // Use marked.parse for real-time markdown rendering
            resultsContainer.innerHTML = marked.parse(fullResponse) as string;
        }
    } catch (error) {
        console.error('Error analyzing code:', error);
        resultsContainer.innerHTML = `<p class="error">An error occurred while analyzing the code. Please check the console for details.</p>`;
    } finally {
        setButtonLoading(false);
    }
};

// --- Event Listeners ---
analyzeBtn.addEventListener('click', analyzeCode);

codeInput.addEventListener('input', () => {
    // Enable button only if there is text in the textarea
    if (codeInput.value.trim().length > 0) {
        analyzeBtn.disabled = false;
    } else {
        analyzeBtn.disabled = true;
    }
});