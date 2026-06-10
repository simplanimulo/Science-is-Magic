const chat_HF_URL = 'https://router.huggingface.co/v1/chat/completions';
const picture_HF_URL = 'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0';

const comparisonPromptObjectConstants = {
    model: "moonshotai/Kimi-K2-Instruct-0905",
    max_tokens: 200,
    temperature: 0,
    stream: false,
    messages : [
        { role: "system", content: "You provide strictly one number between 0% and 100% as your comparison of two functions in the user query. 0% means little in common, 100% means the two functions are equivalent. You need to end your response with % sign." }
    ]
}

const spellPicturePromptObjectConstants = {

}

export function generateComparisonPromptObject(rule, ruleGuess) {
    let promptText = `Function 1: ${rule}; Function 2: ${ruleGuess}`;
    const promptObjectBody = {
        ...comparisonPromptObjectConstants,
        messages: [
            ...comparisonPromptObjectConstants.messages,
            {role: "user", content: promptText}
        ]
    };
    const promptObject = {
        API_URL: chat_HF_URL,
        promptObjectBody
    }
    return promptObject;
}