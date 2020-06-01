'use strict';

var fixtures = [];
var scenes = [];
//replicants
const fixtureReplicant = nodecg.Replicant('fixture-list');


// document elements
const flexContainer = document.getElementById('flexboxContainer');
const sceneContainer = document.getElementById('sceneContainer');
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
    fakeFixture.values = [0,0,0,0];
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
    var fixtureString = "fixture" + (fixtures.length - 1);
    
    createFixtureElements(fixtureString, fixtureToAdd);
    
}


function createFixtureElements(fixtureString, fixtureToAdd)
{
    // create html elements
    var itemContainer = document.createElement("div");
    itemContainer.id = fixtureString;
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
        var itemString = "channel".concat(i+1);
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
        slider.value = fixtureToAdd.values[i];
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
        input.value = fixtureToAdd.values[i];
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
    var sliderElement = document.getElementById(slider.id);

    // find the element that belongs to this group
    var inputText = slider.id+"input";
    var input = document.getElementById(inputText);
    input.value = sliderElement.value;

    // HACK- Terrible Data binding

    var parentId = parseInt(sliderElement.parentNode.id.split('fixture')[1]);
    var channelId = parseInt(slider.id.split('channel')[1]);

    channelToData(parentId, channelId, input.value);
}

function numberChanged(input)
{
    var split = input.id.split('input');
    var sliderElement = document.getElementById(split[0]);
    sliderElement.value = document.getElementById(input.id).value;

    // HACK- Terrible Data binding
    var parentId = parseInt(sliderElement.parentNode.id.split('fixture')[1]);
    var channelId = parseInt(split[0].split('channel')[1]);

    channelToData(parentId, channelId, sliderElement.value);
}
// Terrible data binding
function channelToData(parentId, channelId, value)
{
    console.log(parentId);
    console.log(channelId);

    var fixedId = channelId - 1;
    // update the data
    fixtures[parentId].values[fixedId] = value;
}

function addressChanged(address)
{
    console.log(address);
    var index = address.id.replace(/[^0-9]/g,'');
    console.log(index);
    console.log(fixtures[index]);
    // update the fixture value
    fixtures[index].address = parseInt(document.getElementById(address.id).value);
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

function clearFixtures()
{
    // clear out the existing elements.
    flexContainer.innerHTML = '';
    fixtures = [];
}

function handleParsedData(data)
{
    replaceFixtures(data.fixtures);
}

function replaceFixtures(fixtures)
{
    clearFixtures();
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

//#region Scenes

// HACK - just storing the scene as a collection of fixtures. This isn't how we should be handling it, but it 
//  will save a lot of time in pairing data back and forth between the outputs.

// Gather all of the lighting data for each fixture
// TODO - this is fucking hideous, need to solve the data binding problem
function fillLightingData()
{
    // Get the list of items
    var items = document.getElementsByClassName('flex-item');
    for(let i = 0; i < items.length; ++i)
    {
        let item = items[i];
        var values = item.getElementsByClassName('slider');
        for(let j = 0; j < values.length; ++j)
        {
            fixtures[i].values[j] = values[j].value;
        }
    }
    console.log(fixtures);
    createSceneData();
}

function createSceneData()
{
    var sceneData = {};
    for(let i = 0; i < fixtures.length; ++i)
    {
        let start = fixtures[i].address;
        for(let j = 0; j < fixtures[i].values.length; ++j)
        {
            sceneData[start + j] = parseInt(fixtures[i].values[j]);
        }
    }
    console.log(sceneData);
    console.log(sceneData.length);
}

// Itterate through the fixtures to update the scene controls
function updateFixturesToScene(scene)
{
    replaceFixtures(scene.fixtures);
}

function createSceneWithCurrent(name, trigger)
{
    let scene = 
    {
        name : name,
        trigger : trigger,
        fixtures : fixtures
    }
    createSceneElement(scene);
    scenes.push(scene);
    return scene;
}

function createSceneElement(scene)
{
    var sceneId = "scene".concat(scenes.length);
    var item = document.createElement('div');
    item.classList.add('scene-item');
    item.id = sceneId

    var nameLabel = document.createElement('label');
    nameLabel.for = sceneId.concat('name');
    nameLabel.innerText = "Name:";
    item.appendChild(nameLabel);

    var nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.value = scene.name;
    nameInput.id = sceneId.concat('name');
    nameInput.classList.add('scene-name');
    item.appendChild(nameInput);

    // Break
    item.appendChild(document.createElement('br'));

    var triggerLabel = document.createElement('label');
    triggerLabel.for = sceneId.concat('trigger');
    triggerLabel.innerText = "Trigger:"
    item.appendChild(triggerLabel);

    var triggerInput = document.createElement('input');
    triggerInput.type = 'text';
    triggerInput.value = scene.trigger;
    triggerInput.id = sceneId.concat('trigger');
    triggerInput.classList.add('scene-name');
    item.appendChild(triggerInput);

    //add it to the collection
    sceneContainer.appendChild(item);
}

function createTestScene()
{
    var scene = createSceneWithCurrent('testScene', 'default');
    console.log(scene);
    console.log(scenes);
}
//#endregion