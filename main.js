import {Spell, shuffle} from './round.js';
import {randomTree, randomTree2, evalTree, printExpr, getTreeCharacteristics}  from './rule_tree.js';
import {generateComparisonPromptObject} from './promptBuilder.js'

//window.m = {Spell, shuffle, randomTree, randomTree2, printExpr, getTreeCharacteristics}; // declared for console use

const spellName = document.getElementById("spellName");
const spellDescription = document.getElementById("spell description");
const experimentInput = document.getElementById("experiment parameters");
const runExperimentButton = document.getElementById("runExperimentButton");
const revealRuleButton = document.getElementById("revealRuleButton");
const experimentLog = document.getElementById("experimentLog");
const ruleRevealContainer = document.getElementById("ruleRevealContainer");
const rerollSpellButton = document.getElementById('rerollSpellButton');
const nextRoundButton = document.getElementById('nextRoundButton');
const guessRuleButton = document.getElementById('guessRuleButton');
const ruleGuessInput = document.getElementById('ruleGuessInput');

let roundDifficulty;
let spellParameters;
let s; // spell
let experimentNumber;
let ruleGuessNumber;

function init() {
    spellName.innerHTML = '';
    spellDescription.innerHTML = '';
    experimentLog.innerHTML = '';
    ruleRevealContainer.innerHTML = '';
    roundDifficulty = Math.round(document.getElementById('roundDifficulty').value);
    console.log('Round difficulty: ' + roundDifficulty);
    initSpellParameters();
    s = new Spell(spellParameters);
    console.log('effectEquation: ' + printExpr(s.effectEquation));
    console.log(getTreeCharacteristics(s.effectEquation));
    initSpellInfoDisplay();
    experimentNumber = 0;
    ruleGuessNumber = 0;
}

function initSpellParameters() {
    spellParameters = {
        relevantSpellVariablesAmount: roundDifficulty,
        leaves: roundDifficulty,
        constantMin: 1,
        constantMax: 5,
        leafTypeChances: [4,0,3,0],
        minSpellVariables: Math.ceil(roundDifficulty / 2),
        maxSpellVariables: Math.ceil(roundDifficulty / 1.5),
        constSubtreesPermitted: false,
        spellVariableUniqueOccurence: true
    }
}

function initSpellInfoDisplay() {
    spellName.innerHTML += 'Spell ' + s.spellName;
    spellDescription.innerHTML += 'Discover the Rule (formula) for the <strong>' + s.spellName + '<strong/> ';
    spellDescription.innerHTML += 'spell\'s <strong>' + s.effectName + '</strong>. <br />';
    spellDescription.innerHTML += 'The Rule may depend on the following spell variables:<br />';
    spellDescription.innerHTML += s.spellVariablesDescrption();
}

revealRuleButton.addEventListener('click', (e) => {
    let ruleDescription = '';
    ruleDescription += '<strong>RULE REVEAL</strong> for '
    ruleDescription += ' <strong>' + s.effectName + '</strong>: '
    ruleDescription += printExpr(s.effectEquation);
    addExperimentLogEntry(ruleDescription);
});

runExperimentButton.addEventListener('click', (e) => {
    const parameters = experimentInput.value;
    runExperiment(parameters);
});

experimentInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const parameters = experimentInput.value;
    runExperiment(parameters);
  }
});

nextRoundButton.addEventListener('click', (e) => {
    init();
});

guessRuleButton.addEventListener('click', (e) => {
    ruleGuessNumber += 1;
    const ruleGuess = `<strong>Rule guess ${ruleGuessNumber}:</strong> ${ruleGuessInput.value} has quality `;
    const p = addExperimentLogEntry(ruleGuess);
    const ruleGuessQualityElem = document.createElement('strong');
    p.appendChild(ruleGuessQualityElem);
    const textNode = document.createTextNode('.');
    p.appendChild(textNode);
    reportLLMEvaluatedRuleGuessQuality(ruleGuessQualityElem);
});

async function reportLLMEvaluatedRuleGuessQuality(ruleGuessQualityElem) {
    ruleGuessQualityElem.textContent = '...calculating';
    const promptObject = generateComparisonPromptObject(printExpr(s.effectEquation), ruleGuessInput.value);
    try {
        const response = await fetch('/.netlify/functions/hf3', {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({ promptObject })
        });
        const result = await response.json();
        ruleGuessQualityElem.textContent = result.message;
    } catch(e) { ruleGuessQualityElem.textContent = 'Error: '+ e.message; }
}

function runExperiment(parameters) {
    experimentNumber++;
    let experimentDescription = '';
    experimentDescription += 'Running <strong>experiment ' + experimentNumber + '</strong>';
    experimentDescription += ' with parameters ' + parameters + '. ........Result: ';
    const parametersArray = parameters.trim().split(/\s+/).map(Number); // string to array of numbers
    try {
        s.setSpellVariables(parametersArray);
        const result = evalTree(s.effectEquation);
        experimentDescription += 'The measured value of <strong>' + s.effectName + '</strong> is ' + result +'.';
    } catch (err) {
        experimentDescription += 'Failure, ';
        experimentDescription += (err && err.message) ? err.message : String(err);
    }

    addExperimentLogEntry(experimentDescription);
}

function addExperimentLogEntry(entry) {
    const p = document.createElement('p');
    p.setAttribute('class', 'experiment-paragraph');
    p.innerHTML = entry;
    experimentLog.prepend(p);
    return p;
}

init();