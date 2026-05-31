import {Spell, shuffle} from './round.js';
import {randomTree, randomTree2, evalTree, printExpr, getTreeCharacteristics}  from './rule_tree.js';

window.m = {Spell, shuffle, randomTree, randomTree2, printExpr, getTreeCharacteristics}; // declared for console use

const spellName = document.getElementById("spell name");
const spellDescription = document.getElementById("spell description");
const experimentInput = document.getElementById("experiment parameters");
const runExperimentButton = document.getElementById("runExperimentButton");
const revealRuleButton = document.getElementById("revealRuleButton");
const experimentLog = document.getElementById("experimentLog");
const ruleRevealContainer = document.getElementById("ruleRevealContainer");
const rerollSpellButton = document.getElementById('rerollSpellButton');
const guessRuleButton = document.getElementById('guessRuleButton');
const ruleGuessInput = document.getElementById('ruleGuessInput');

let roundDifficulty;
let spellParameters;
let s; // spell
let ruleRevealed;
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
    ruleRevealed = false;
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
    spellName.innerHTML += ' ' + s.spellName;
    spellDescription.innerHTML += 'Discover the Rule for the spell\'s <strong>' + s.effectName + '<strong/> <br />';
    spellDescription.innerHTML += 'The rule may depend on the following spell variables:<br />'
    spellDescription.innerHTML += s.spellVariablesDescrption();
}

revealRuleButton.addEventListener('click', (e) => {
    if(!ruleRevealed) {
        const p = document.createElement('p');
        p.setAttribute('class', 'spaced-lines');
        let ruleDescription = '';
        ruleDescription += '<strong> The rule </strong> for'
        ruleDescription += ' <strong>' + s.effectName + '</strong> goes as follows: <br />'
        ruleDescription += printExpr(s.effectEquation);
        p.innerHTML = ruleDescription;
        ruleRevealContainer.appendChild(p);
        ruleRevealed = true;
    }
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

rerollSpellButton.addEventListener('click', (e) => {
    init();
});

guessRuleButton.addEventListener('click', (e) => {
    ruleGuessNumber += 1;
    let ruleGuess = '<strong>Rule guess ' + ruleGuessNumber + ':</strong> ';
    ruleGuess += ruleGuessInput.value;
    addExperimentLogEntry(ruleGuess);
});

function runExperiment(parameters) {
    experimentNumber++;
    let experimentDescription = '';
    experimentDescription += 'Running <strong>experiment ' + experimentNumber + '</strong>';
    experimentDescription += ' with parameters ' + parameters + '. ........Result: ';
    const parametersArray = parameters.trim().split(/\s+/).map(Number); // array of numbers
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
    experimentLog.appendChild(p);
}

init();