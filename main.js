import {Spell, shuffle, randNormal} from './round.js';
import {randomTree2, evalTree, printExpr, getTreeCharacteristics, setOps}  from './rule_tree.js';
import {generateComparisonPromptObject} from './promptBuilder.js'
import {setDifficulty} from './setDifficulty.js'

window.m = {Spell, shuffle, randomTree2, printExpr, getTreeCharacteristics, randNormal}; // declared for console use

const spellName = document.getElementById("spellName");
const spellDescription = document.getElementById("spell description");
const experimentInput = document.getElementById("experiment parameters");
const runExperimentButton = document.getElementById("runExperimentButton");
const revealRuleButton = document.getElementById("revealRuleButton");
const experimentLog = document.getElementById("experimentLog");
const ruleRevealContainer = document.getElementById("ruleRevealContainer");
const nextRoundButton = document.getElementById('nextRoundButton');
const guessRuleButton = document.getElementById('guessRuleButton');
const ruleGuessInput = document.getElementById('ruleGuessInput');
const formulaOperations = document.getElementById('formulaOperations');
const variableSettingInaccuracy = document.getElementById('variableSettingInaccuracy');
const resultMeasurementInaccuracy = document.getElementById('resultMeasurementInaccuracy');
const difficultySelector = document.getElementById('difficultySelector');

let formulaComplexity;
let spellParameters;
let s; // spell
let experimentNumber;
let ruleGuessNumber;
let experimentResultDisplayGranularity;
let powerChancesArray;
let leafTypeChancesArray;
let ruleRevealed;

function init() {
    spellName.innerHTML = '';
    spellDescription.innerHTML = '';
    experimentLog.innerHTML = '';
    ruleRevealContainer.innerHTML = '';
    formulaComplexity = Math.round(document.getElementById('formulaComplexity').value);
    console.log('Formula complexity: ' + formulaComplexity);
    setFormulaOperations();
    powerChancesArray = Array.from(document.getElementsByClassName('powerInput')).map(el => Number(el.value));
    leafTypeChancesArray = Array.from(document.getElementsByClassName('leafTypeInput')).map(el => Number(el.value));
    initSpellParameters();
    s = new Spell(spellParameters);
    console.log('effectEquation: ' + printExpr(s.effectEquation));
    console.log(getTreeCharacteristics(s.effectEquation));
    initSpellInfoDisplay();
    experimentNumber = 0;
    ruleGuessNumber = 0;
    experimentResultDisplayGranularity = 100; // exp res are rounded to granularity of 1 / experimentResultDisplayGranularity
    ruleRevealed = false;
}

function setFormulaOperations() {
    switch(formulaOperations.value) {
        case "tier1":
            setOps(['+', '-', '*', '/']);
            break;
        case "tier2":
            setOps(['+', '-', '*', '/', 'min', 'max']);
            break;
        default:
            throw new Error("Unknown formula operations value");
    }
    // the exponentiation operation for tier3 is set up with powerChances@initSpellParameters
}

function initSpellParameters() {
    spellParameters = {
        relevantSpellVariablesAmount: formulaComplexity,
        stdDevSpread: variableSettingInaccuracy.value, // for setting spell Variables
        effectMeasurementStdDevSpread: resultMeasurementInaccuracy.value, // for measuring spell effect
        leaves: formulaComplexity,
        constantMin: Number(document.getElementById('constMin').value),
        constantMax: Number(document.getElementById('constMax').value),
        leafTypeChances: leafTypeChancesArray,
        powerChances: powerChancesArray,
        minSpellVariables: Math.ceil(formulaComplexity * document.getElementById('SVLPercentMin').value / 100),
        maxSpellVariables: Math.ceil(formulaComplexity * document.getElementById('SVLPercentMax').value / 100),
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

difficultySelector.addEventListener('change', (e) => {
    switch (difficultySelector.value) {
        case "1":
        case "2":
        case "3":
            setDifficulty(difficultySelector.value);
            setEditabilityOfDetailedRoundCharacteristics(false);
            break;
        case "custom":
            setEditabilityOfDetailedRoundCharacteristics(true);
            break;
        default:
            throw new Error("Unknown difficulty setting selected");
    }
});

// make inputs/textareas/selects interactions enabled or disabled
function setEditabilityOfDetailedRoundCharacteristics(editabilityValue) {
    const container = document.getElementById('detailedRoundCharacteristics');

    container.querySelectorAll('input, textarea, select, button').forEach(el => {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            //el.readOnly = !editabilityValue;    // for text-like inputs
            el.disabled = !editabilityValue;
        } else {
            el.disabled = !editabilityValue;    // for select/button and others
        }
    });
    //detailedRoundCharacteristics.style.backgroundColor = editabilityValue ? 'white' : 'gray';
}

revealRuleButton.addEventListener('click', (e) => {
    let ruleDescription = '';
    ruleDescription += '<strong>RULE REVEAL</strong> for '
    ruleDescription += ' <strong>' + s.effectName + '</strong>: '
    ruleDescription += printExpr(s.effectEquation);
    addExperimentLogEntry(ruleDescription);
    ruleRevealed = true;
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
        if(result.message === '100%' && !ruleRevealed) {
            ruleRevealed = true;
            playVictorySound();
        }
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
        const measuredResult = randNormal(result, s.effectMeasurementStdDev * s.effectMeasurementStdDev);
        const roundedResult = Math.round(measuredResult * experimentResultDisplayGranularity) / experimentResultDisplayGranularity;
        experimentDescription += 'The measured value of <strong>' + s.effectName + '</strong> is ' + roundedResult +'.';
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

function playVictorySound() {
    const rand = Math.floor(Math.random() * 4) + 1;
    const fileName = 'Victory' + rand + '.mp3';
    const a = new Audio(fileName);
    a.play().catch(e => console.error(e));  
}

const evt = new Event('change', { bubbles: true, cancelable: true });
difficultySelector.dispatchEvent(evt); // setting initial values of detailed characteristics inputs through triggering eventListener
init();