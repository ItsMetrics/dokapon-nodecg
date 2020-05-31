'use strict';

var fixtures = [];
var scenes = [];
//replicants
const fixtureReplicant = nodecg.Replicant('fixture-list');


// document elements
const flexContainer = document.getElementById('flexboxContainer');
const fileProgress = document.getElementById('fileProgress');

var reader;
function Init()
{
    reader = new FileReader();
    reader.addEventListener('load', onFileRead);
    reader.addEventListener('progress', onFileProgress);
}

function fakeFixture()
{
    var fakeFixture = {};
    fakeFixture.name = "Faked Data".concat(fixtures.length + 1);
    fakeFixture.channels = ["red", "blue", "green", "dimming"];
    fakeFixture.address = 1;
    return fakeFixture;
}

function addFixture(fixtureIn = null)
{
    var fixtureToAdd;
    if(!fixtureIn)
    {
        // HACK - faking the data for the test
        fixtureToAdd = fakeFixture();
    }
    else
    {
        fixtureToAdd = fixtureIn;
    }
    // TODO - refactor this to just use the param
    // add fixture to list
    fixtures.push(fixtureToAdd);

    // HACK - just seeing how far we can get with just replicants
    fixtureReplicant.value = fixtures;

    // string builder
    var fixtureString = "fixture" + fixtures.length;
    
    createFixtureElements(fixtureString, fixtureToAdd);
    
}


function createFixtureElements(fixtureString, fixtureToAdd)
{
    // create html elements
    var itemContainer = document.createElement("div");
    itemContainer.classList.add("flex-item");

    var header = document.createElement("h2");
    header.innerText = fixtureToAdd.name;
    itemContainer.appendChild(header);
    itemContainer.appendChild(document.createElement('br'));
    
    // TODO - need to add an address field
    var addressLabel = document.createElement('label');
    addressLabel.for = fixtureString + 'address';
    addressLabel.innerText = "Address: ";
    addressLabel.classList.add('address-label');
    itemContainer.appendChild(addressLabel);

    var addressInput = document.createElement('input');
    addressInput.type = 'number';
    addressInput.value = fixtureToAdd.address;
    addressInput.id = fixtureString + 'address';
    addressInput.classList.add('address-input');
    addressInput.onchange = function(event) {
        addressChanged(event.srcElement);
    };
    itemContainer.appendChild(addressInput);
    itemContainer.appendChild(document.createElement('br'));

    
    for(var i = 0; i < fixtureToAdd.channels.length; ++i)
    {
        var itemString = "channel" + i+1;
        // Label
        var label = document.createElement('label');
        label.for = fixtureString + itemString;
        //label.style = "float: left;";
        label.innerText = fixtureToAdd.channels[i];

        itemContainer.appendChild(label);

        // slider
        var slider = document.createElement("input");
        slider.id = fixtureString + itemString;
        slider.type = 'range';
        slider.min = 0;
        slider.max = 255;
        slider.value = 0;
        slider.classList.add("slider");
        slider.oninput = function(slider) {
            sliderChanged(slider.srcElement);
        };

        itemContainer.appendChild(slider);

        // number box
        var input = document.createElement("input");
        input.id = fixtureString + itemString + "input";
        input.type = 'number';
        input.classList.add('slider-input');
        input.value = 0;
        input.oninput = function(input) {
            numberChanged(input.srcElement);
        };


        itemContainer.appendChild(input);

        // br
        itemContainer.appendChild(document.createElement('br'));
    }

    //add the element to the document
    flexContainer.appendChild(itemContainer);
}

// Handle the input/slider combinations
function sliderChanged(slider)
{
    console.log(slider);
    var sliderElement = document.getElementById(slider.id);
    console.log(sliderElement.value);

    // find the element that belongs to this group
    var inputText = slider.id+"input";
    var input = document.getElementById(inputText);
    input.value = sliderElement.value;
}

function numberChanged(input)
{
    console.log(input);
    var split = input.id.split('input');
    var sliderElement = document.getElementById(split[0]);
    sliderElement.value = document.getElementById(input.id).value;
}

function addressChanged(address)
{
    console.log(address);
    var index = address.id.replace(/[^0-9]/g,'');
    console.log(index);
    console.log(fixtures[index]);
    // update the fixture value
    fixtures[index].address = document.getElementById(address.id).value;
}
var lastReceivedFixture; 
nodecg.listenFor('new-fixture', (fixture, ack) => {
    if(JSON.stringify(fixture) === JSON.stringify(lastReceivedFixture))
    {
        console.log('duplicate message received');        
    }
    else
    {
        console.log('received fixture in main page');
        console.log(fixture);
        lastReceivedFixture = fixture;
        addFixture(fixture);
    }
});

//#region Configs
// Loading and handling the config files
//Event Handler
const fileInput = document.getElementById('fileInput');
fileInput.addEventListener("change", handleFile, false);

reader = null;

function handleFile()
{
    console.log('loaded a file');
    const files = this.files;

    var numFiles = files.length;
    if(numFiles)
    {
        // read the first (should be only) file
        fileProgress.hidden = false;
        reader.readAsText(files[0]);    }

}

function onFileRead()
{
    // hide the progress bar again
    fileProgress.hidden = true;
    console.log(this.result);
    var jsonParsedData = JSON.parse(this.result);
    handleParsedData(jsonParsedData);
}

function onFileProgress()
{
    if(this.loaded && this.total)
    {
        const percent = (this.loaded / this.total) * 100;
        fileProgress.value = percent;
    }
}


function handleParsedData(data)
{
    // clear out the existing elements.
    flexContainer.innerHTML = '';
    fixtures = [];

    fixtures = data.fixtures;
    // TODO - recreate all the fixtures
    for(let i = 0; i < fixtures.length; ++i)
    {
        //create the fixture string
        let fixtureString = "fixture" + i;
        let currentFixture = fixtures[i];
        createFixtureElements(fixtureString, currentFixture);
    }
}

function serializeFixtureData()
{
    // TODO - handle all the serialization here
    // TODO - should this handle both directions?
    // Get the fixtures data
    var serializedData = {
        fixtures: fixtures
    }
     
    // TODO - serialize all the other data
    // Scenes
    // Triggers/Events
    
    return JSON.stringify(serializedData);
}

function saveData()
{
    var data = serializeFixtureData();
    var blob = new Blob([data], {type: 'application/json'});

    // Testing if this works
    var a = document.createElement('a');
    var url = URL.createObjectURL(blob);
    a.href = url;
    a.download = 'fixtureData.json';
    document.body.appendChild(a);
    a.click();
    setTimeout(function() {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 0);
}
//#endregion