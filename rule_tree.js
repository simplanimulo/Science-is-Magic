export {randomTree, randomTree2, evalTree, printExpr, getTreeCharacteristics}

const ops = ['+', '-', '*', '/', 'min', 'max'];

function constantEvalObject(objValue, objType) {
    const constant = {
        value: objValue,
        getValue() { return this.value; },
        name: objValue.toString(),
        type: objType        
    }
    return constant;
}

function randomRealConstantEvalObject(min, max) {
    let objValue = min + Math.random() * (max - min);
    return constantEvalObject(objValue, 'realConstant');
}

function randomDiscreteConstantEvalObject(min, max) {
    let objValue = min + Math.floor(Math.random() * (max - min)) + 1;
    return constantEvalObject(objValue, 'discreteConstant');
}

function gaussianNoiseEvalObject() {
    return {
        getValue() {
            let u = 0, v = 0;
            while (u === 0) u = Math.random(); // avoid 0
            while (v === 0) v = Math.random();
            return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        },

        name: 'N(0,1)',
        type: 'gaussianNoise'
    };
}

function leaf(evalObject) {
    return {type: 'leaf', evalObject};
}

function opNode(op, left, right) {
    return { type: 'op', op, left, right }; 
}

function randomTree(evalObject, {maxDepth = 3, probLeaf = 0.4} = {}, depth = 0) {
  // if too deep or by chance, return leaf
  if (depth >= maxDepth || Math.random() < probLeaf) {
    const sv = evalObject[Math.floor(Math.random() * evalObject.length)];
    return leafNode(sv);
  }
  const op = ops[Math.floor(Math.random() * ops.length)];
  return opNode(op,
    randomTree(evalObject, {maxDepth, probLeaf}, depth + 1),
    randomTree(evalObject, {maxDepth, probLeaf}, depth + 1)
  );
}

const defaultLeafTypeChances = [
    0, // evalObject
    1, // real constant
    5, // discrete constant
    1  // gaussian noise
];

function randomTree2(evalObjects, {leaves = 10, constantMin = 1, constantMax = 5, leafTypeChances,
     spellVariableUniqueOccurence} = {}) {
    if(!Array.isArray(leafTypeChances)) leafTypeChances = defaultLeafTypeChances;
    if (leaves === 1) {
        const sum = Object.values(leafTypeChances).reduce((s, v) => s + v, 0);
        let rand = Math.random() * sum;     
        if (rand < leafTypeChances[0]) {
            if (!(evalObjects.length > 0)) {
                rand += leafTypeChances[0];
            } else {
                const evalObjectNumber = Math.floor(Math.random() * evalObjects.length);
                if (spellVariableUniqueOccurence === true) {
                    const [evalObject] = evalObjects.splice(evalObjectNumber,1);
                    return leaf(evalObject);
                } else {
                    return leaf(evalObjects[evalObjectNumber]);
                }
            }
        }
        rand = rand - leafTypeChances[0];
        if (rand < leafTypeChances[1]) {
            return leaf(randomRealConstantEvalObject(constantMin, constantMax));
        }
        rand = rand - leafTypeChances[1];
        if (rand < leafTypeChances[2]) {
            return leaf(randomDiscreteConstantEvalObject(constantMin, constantMax));
        }
        rand = rand - leafTypeChances[2];
        return leaf(gaussianNoiseEvalObject());
    } else {
        const leftLeaves = Math.floor(Math.random() * (leaves - 1)) + 1;
        const l = randomTree2(evalObjects, {leaves: leftLeaves, constantMin, constantMax, leafTypeChances, spellVariableUniqueOccurence});
        const r = randomTree2(evalObjects, {leaves: leaves - leftLeaves, constantMin, constantMax, leafTypeChances, spellVariableUniqueOccurence});
        const op = ops[Math.floor(Math.random() * ops.length)];
        return opNode (op, l, r);
    }
}

function evalTree(node) {
    if (node.type === 'leaf') return node.evalObject.getValue();
    const a = evalTree(node.left);
    const b = evalTree(node.right);
    switch (node.op) {
        case '+': return a + b;
        case '-': return a - b;
        case '*': return a * b;
        case '/': return a / b; // doesn't avoid inf/NaN atm
        case 'max': return Math.max(a, b);
        case 'min': return Math.min(a, b);
        default: throw new Error('unknown op');
    }
}

function printExpr(node) {
    if (node.type === 'leaf') return node.evalObject.name;
    const l = printExpr(node.left), r = printExpr(node.right);
    return node.op.length === 1 ? `(${l} ${node.op} ${r})` : `${node.op}(${l}, ${r})`;
}

function countSpellVariables(node) {
    if (node.type === 'leaf') {
        return node.evalObject.type === 'spellVariable' ? 1 : 0;
    } else {
        return countSpellVariables(node.left) + countSpellVariables(node.right);
    }
}

function existConstantSubtrees(node) {
    if (node.type === 'leaf') return false;
    if (node.left.type === 'leaf' &&
        node.left.evalObject.type !== 'spellVariable' &&
        node.right.type === 'leaf' &&
        node.right.evalObject.type !== 'spellVariable'
        ) return true;
    return existConstantSubtrees(node.left) || existConstantSubtrees(node.right);
}

function getTreeCharacteristics(node) {
    return {
        leafSpellVariablesCount: countSpellVariables(node),
        existConstantSubtrees: existConstantSubtrees(node)
    };
}