import {randomTree, randomTree2, evalTree, printExpr, getTreeCharacteristics}  from './rule_tree.js';

export class SpellVariable {
    constructor({name, scaleType='discrete', min=0, max=1} = {}) {
        if (!name) throw new Error('name required');
        if (!['discrete','continuous'].includes(scaleType)) throw new Error('invalid scaleType');
        if (typeof min !== 'number' || typeof max !== 'number' || min > max) throw new Error('invalid range');
        this.name = name;
        this.scaleType = scaleType;
        this.min = min;
        this.max = max;
        this.type = 'spellVariable';
    }

    validateValue() {
        if (typeof this.value !== 'number') {
            throw new Error('number expected');
        } else if (!Number.isFinite(this.value)) {
            throw new Error('finite number expected')
        } else if (this.value < this.min || this.value > this.max) {
            throw new Error('spell variable out of bounds');
        } else if (this.scaleType === 'discrete' && Number.isInteger(this.value) === false) {
            throw new Error('integer expected');
        }
    }

    randomValue() {
        if (this.scaleType === 'discrete') {
            return Math.floor(Math.random() * (ths.max - this.min + 1)) + this.min;
        } else {
            return Math.random() * (this.max - this.min) + this.min
        }
    }

    getValue() { return this.value };
    setValue(value) {
        this.value = value;
        this.validateValue();
    }
}

export const spellVariables = [
    new SpellVariable({name: 'sun height', scaleType: 'continuous', min: 0, max: 10, type: 'spellVariable'}),
    new SpellVariable({name: 'chant length', scaleType: 'discrete', min: 1, max: 10, type: 'spellVariable' }),
    new SpellVariable({name: 'casting implement length', scaleType: 'continuous', min: 1, max: 10, type: 'spellVariable'}),
    new SpellVariable({name: 'number of targets', scaleType: 'discrete', min: 1, max: 10, type: 'spellVariable'}),
    new SpellVariable({name: 'number of casters', scaleType: 'discrete', min: 1, max: 10, type: 'spellVariable'}),
    new SpellVariable({name: 'caster\'s beard length', scaleType: 'continuous', min: 0, max: 10, type: 'spellVariable'}),
    new SpellVariable({name: 'Dark Lord\'s presence', scaleType: 'discrete', min: 0, max: 1, type: 'spellVariable'}),
    new SpellVariable({name: 'coolness factor', scaleType: 'continuous', min: 0, max: 10, type: 'spellVariable'}),
    new SpellVariable({name: 'Light Lord\'s presence', scaleType: 'discrete', min: 0, max: 1, type: 'spellVariable'}),
    new SpellVariable({name: 'target\'s extravagance', scaleType: 'continuous', min: 0, max: 10, type: 'spellVariable'})
];

//let spellVariables = ['sun height', 'chant length', 'casting implement length', 'number of targets'];
export const effectNames = ['mana drain', 'spell power', 'spell duration'];

export class Spell {
    constructor(params) {
        this.spellName = this.randomName(3);
        this.effectName = shuffle(effectNames)[0];
        this.spellVariables = this.randomSpellVariables(params.relevantSpellVariablesAmount);

        let i;
        for (i = 1; i < 100; i++) {
            const spellVariablesCopy = this.spellVariables.slice();
            this.effectEquation = randomTree2(spellVariablesCopy, params);
            const tc = getTreeCharacteristics(this.effectEquation);
            if (tc.leafSpellVariablesCount < params.minSpellVariables ||
                tc.leafSpellVariablesCount > params.maxSpellVariables
            ) continue;
            if (!params.constSubtreesPermitted && tc.existConstantSubtrees) continue;
            break;
        }
        if (i === 100) {
            throw Error('couldnt generate valid effect equation in ' + i + ' iterations');
        } else {
            console.log('effectEquation generated in ' + i + ' iteration(s)');
        }

    }

    randomName(nameLength) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const charsArray = chars.split('');
        const randomCharsArray = shuffle(charsArray);
        return randomCharsArray.slice(0, nameLength).join('');
    }

    randomSpellVariables(amount) {
        const randomizedSpellVariables = shuffle(spellVariables);
        return randomizedSpellVariables.slice(0, amount)
    }

    setSpellVariables(argumentArray) {
        if (argumentArray.length < this.spellVariables.length) {
            throw new Error('too few arguments to set spell variables');
        }
        for (let i = 0; i < this.spellVariables.length; ++i) {
            this.spellVariables[i].setValue(argumentArray[i]);
        }
    }

    spellVariablesDescrption() {
        let desc = '';
        for (let i = 0; i < this.spellVariables.length; ++i) {
            let variableDesc = '<strong>' + this.spellVariables[i].name + '</strong>;';
            variableDesc += ' scale type: ' + this.spellVariables[i].scaleType + ';';
            variableDesc += ' min: ' + this.spellVariables[i].min + ';';
            variableDesc += ' max: ' + this.spellVariables[i].max;
            desc += variableDesc;
            if (i !== this.spellVariables.length - 1) desc += ' <br />';
        }
        return desc;
    }
}

export function shuffle(array){
  const a = array.slice();
  for(let i = a.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}