export {setDifficulty}

const difficultyLevelConstants = [
    {},
    {   // level 1
        formulaOperations: "tier1",
        powerInputs: [1,0,0,0,0,0,0],
        leafTypeInputs: [4,0,3,0],
        constMin: 1,
        constMax: 5,
        SVLPercentMin: 50,
        SVLPercentMax: 75,
        variableSettingInaccuracy: 0,
        resultMeasurementInaccuracy: 0
    },
    {   // level 2
        formulaOperations: "tier2",
        powerInputs: [2,1,1,0,0,0,0],
        leafTypeInputs: [4,0,3,0],
        constMin: 1,
        constMax: 5,
        SVLPercentMin: 50,
        SVLPercentMax: 75,
        variableSettingInaccuracy: 0.05,
        resultMeasurementInaccuracy: 0.05
    },
    {   // level 3
        formulaOperations: "tier2",
        powerInputs: [5,2,2,1,1,0,0],
        leafTypeInputs: [4,1,2,0],
        constMin: 1,
        constMax: 5,
        SVLPercentMin: 50,
        SVLPercentMax: 75,
        variableSettingInaccuracy: 0.1,
        resultMeasurementInaccuracy: 0.1
    }
]

function setDifficulty (difficultyLevel) {
    const difficultyObj = difficultyLevelConstants[difficultyLevel];

    document.getElementById('formulaOperations').value = difficultyObj.formulaOperations;
    Array.from(document.getElementsByClassName('powerInput')).forEach((el, i) => {
        el.value = difficultyObj.powerInputs[i];
    });
    Array.from(document.getElementsByClassName('leafTypeInput')).forEach((el, i) => {
        el.value = difficultyObj.leafTypeInputs[i];
    });
    document.getElementById('constMin').value = difficultyObj.constMin;
    document.getElementById('constMax').value = difficultyObj.constMax;
    document.getElementById('SVLPercentMin').value = difficultyObj.SVLPercentMin;
    document.getElementById('SVLPercentMax').value = difficultyObj.SVLPercentMax;
    document.getElementById('variableSettingInaccuracy').value = difficultyObj.variableSettingInaccuracy;
    document.getElementById('resultMeasurementInaccuracy').value = difficultyObj.resultMeasurementInaccuracy;
}