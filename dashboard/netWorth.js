'use strict';


const netWorthData = nodecg.Replicant('net-worth');
var currentData = [];
var lastWeek;

// elements
const weekSelect = document.getElementById('weeks');
const player1Value = document.getElementById('player1');
const player2Value = document.getElementById('player2');
const player3Value = document.getElementById('player3');
const player4Value = document.getElementById('player4');

function init()
{
    addNewWeek(1);
    // handle the loading and unloading of data
    clearPlayerValues();
}

function clearPlayerValues()
{
    player1Value.value = 0;
    player2Value.value = 0;
    player3Value.value = 0;
    player4Value.value = 0;
}

// Process the current week and save it to the file
function saveWeek()
{
    var weeklyData = {};
    weeklyData.week = weekSelect.value;
    weeklyData.playerData = [];
    
    // TODO: should this be a named field, or just an array of values?
    weeklyData.playerData.push(player1Value.value);
    weeklyData.playerData.push(player2Value.value);
    weeklyData.playerData.push(player3Value.value);
    weeklyData.playerData.push(player4Value.value);

    if(weeklyData.week <= currentData.length)
    {
        updateExistingWeek(weeklyData);
    }
    else
    {
        saveNextWeek(weeklyData);
    }

}

function updateWeekOptions()
{

}

function addNewWeek(weekNum)
{
    var option = document.createElement('option');
    option.appendChild(document.createTextNode("Week " + weekNum));
    option.value = weekNum;
    weekSelect.appendChild(option);
    jumpToCurrentWeek();
}

netWorthData.on('change', (newValue, oldValue) => {
    if(!newValue || newValue == oldValue)
    {
        return;
    }

    onDataLoaded();
});

function onDataLoaded()
{
    var weeklyData = netWorthData.value;
}

function updateExistingWeek(weeklyData)
{
    currentData[weeklyData.week - 1] = weeklyData;
    jumpToCurrentWeek();
}

function saveNextWeek(weeklyData)
{
    currentData.push(weeklyData);
    addNewWeek(parseInt(weeklyData.week) + 1);
    console.log(currentData);
}

function jumpToCurrentWeek()
{
    var lastWeek = currentData.length + 1;
    clearPlayerValues();
    weekSelect.value = lastWeek;
}

function onWeekSelected(week)
{
    if(week > currentData.length)
    {
        // No values are saved for the current week
        clearPlayerValues();
        return;
    }

    if(week < 0)
    {
        console.error("Week selected is less than 0");
        return;
    }

    var dataAtWeek = currentData[week -1];
    fillInExistingData(dataAtWeek);

}

function fillInExistingData(weeklyData)
{
    player1Value.value = weeklyData.playerData[0];
    player2Value.value = weeklyData.playerData[1];
    player3Value.value = weeklyData.playerData[2];
    player4Value.value = weeklyData.playerData[3];
}