'use strict';

const channelSelection = document.getElementById('channelSelect');
const channelNameHolder = document.getElementById('channel-name-collection');
const fixtureAddress = document.getElementById('fixtureAddress');
const fixtureName = document.getElementById('fixtureName');
function onNumberChannels()
{
    // empty out the existing list
   channelNameHolder.innerHTML = '';

   // create the elements we need
   var numChannels = parseInt(channelSelection.value);
   for(var i = 0; i < numChannels; ++i)
   {
       // Div to hold em all
       var div = document.createElement('div');

       var id = i + 1;
       // string descriptor
       var name = 'channel' + id;
       //Label
       var label = document.createElement('label');
       label.id = name + 'label'
       label.for = name + 'input';
       label.innerText = 'Channel ' + id +':';
       div.appendChild(label);

       // Input
       var input = document.createElement('input');
       input.type = 'text';
       input.id = name + 'input';
       input.defaultValue = 'Enter Channel Description';
       div.appendChild(input);

       div.appendChild(document.createElement('br'));
       // add the div
       channelNameHolder.appendChild(div);
   }  
}

function init()
{
    // Whatever setup we have
    fixtureName.value = '';
    fixtureAddress.value = 0;
    channelSelection.value = '1';
    onNumberChannels();
}

function createFixtureFromElements()
{
    // is there a better way to do this
    var channelArray = [];
    var valueArray = [];
    var numChannels = parseInt(channelSelection.value);
    for(var i = 0; i < numChannels; ++i)
    {
        var id = i + 1;
        var inputId = 'channel' + id + 'input';
        var value = document.getElementById(inputId).value;
        channelArray.push(value);
        valueArray.push(0);
    }

    var newFixture = {
        name : fixtureName.value,
        address : fixtureAddress.value,
        channels : channelArray,
        values: valueArray
    };
    nodecg.sendMessage('new-fixture', newFixture);
    console.log('Sending Message');
}


//#region DOCUMENT EVENTS
// Called when this is opened
document.addEventListener('dialog-opened', function() {
    init();
});

// called when we are confirming
document.addEventListener('dialog-confirmed', function()
{
    createFixtureFromElements();
});
// called upon dismiss
document.addEventListener('dialog-dismissed', function() {
    console.log('Dismissed Dialog.');
});
//#endregion
