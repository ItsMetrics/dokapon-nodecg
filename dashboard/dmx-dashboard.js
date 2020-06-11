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

function removeFixture(fixtureID)
{
    var id = parseInt(fixtureID.split('fixture')[1]);
    fixtures.splice(id,1);

    // update the fixture list
    replaceFixtures(fixtures);
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
    //Remove fixture button
    var removeButton = document.createElement('button');
    removeButton.classList.add('remove-fixture');
    removeButton.onclick = function(event) {
        removeFixture(fixtureString);
    };
    removeButton.innerText = 'Remove';
    itemContainer.appendChild(removeButton);

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

function clampValue(input, min, max)
{
    return Math.min(Math.max(input, min), max);
}

function numberChanged(input)
{
    // clamping the values
    var me = document.getElementById(input.id);
    me.value = clampValue(me.value, 0, 255);

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
    replaceScenes(data.scenes);
}

function replaceFixtures(newFixtures)
{
    clearFixtures();
    
    for(let i = 0; i < newFixtures.length; ++i)
    {
        //create the fixture string
        let fixtureString = "fixture" + i;
        let currentFixture = newFixtures[i];
        createFixtureElements(fixtureString, currentFixture);
        fixtures.push(currentFixture);
    }
}

function serializeFixtureData()
{
    // TODO - handle all the serialization here
    // TODO - should this handle both directions?
    // Get the fixtures data
    var serializedData = {
        fixtures: fixtures,
        scenes : scenes
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
    return createSceneData();
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
    return sceneData;
}

// Itterate through the fixtures to update the scene controls
function updateFixturesToScene(scene)
{
    replaceFixtures(scene.fixtures);
}

function createSceneWithCurrent(name, trigger)
{
    let copiedFixtures = deepCopyFunction(fixtures);
    let scene = 
    {
        name : name,
        trigger : trigger,
        fixtures : copiedFixtures
    }
    var sceneId = "scene".concat(scenes.length);
    createSceneElement(sceneId, scene);
    scenes.push(scene);
    return scene;
}

function createSceneElement(sceneId, scene)
{
    // Container for the flexbox
    var item = document.createElement('div');
    item.classList.add('scene-item');
    item.onclick = function(event) {
        onSceneSelect(sceneId);
    };
    item.id = sceneId

    // Name
    var nameLabel = document.createElement('label');
    nameLabel.for = sceneId.concat('name');
    nameLabel.innerText = "Name:";
    item.appendChild(nameLabel);

    var nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.value = scene.name;
    nameInput.id = sceneId.concat('name');
    nameInput.classList.add('scene-name');
    nameInput.onchange = function(event)
    {
        onNameChanged(event.srcElement);
    };
    item.appendChild(nameInput);

    // Break
    item.appendChild(document.createElement('br'));

    // Trigger
    var triggerLabel = document.createElement('label');
    triggerLabel.for = sceneId.concat('trigger');
    triggerLabel.innerText = "Trigger:"
    item.appendChild(triggerLabel);

    var triggerInput = document.createElement('input');
    triggerInput.type = 'text';
    triggerInput.value = scene.trigger;
    triggerInput.id = sceneId.concat('trigger');
    triggerInput.classList.add('scene-name');
    triggerInput.onchange = function(event)
    {
        onTriggerChanged(event.srcElement);
    };
    item.appendChild(triggerInput);

    item.appendChild(document.createElement('br'));

    // button container
    var buttonContainer = document.createElement('div');
    buttonContainer.classList.add('button-container');

    // Update scene with current data
    var update = document.createElement('button');
    update.innerText = 'Update'
    update.onclick = function(event) {
        updateSceneWithCurrent(sceneId);
    };
    update.classList.add('update-scene');
    buttonContainer.appendChild(update);

    // remove scene
    var remove = document.createElement('button');
    remove.innerText = 'Remove Scene';
    remove.onclick = function(event) {
        removeScene(sceneId);
    };
    remove.classList.add('remove-scene');
    buttonContainer.appendChild(remove);

    item.appendChild(buttonContainer);
    //add it to the collection
    sceneContainer.appendChild(item);
}

function clearScenes()
{
    sceneContainer.innerHTML = '';
    scenes = [];
}

function replaceScenes(newScenes)
{
    clearScenes();

    for(let i = 0; i < newScenes.length; ++i)
    {
        let sceneString = "scene".concat(i);
        createSceneElement(sceneString, newScenes[i]);
        scenes.push(newScenes[i]);
    }
}

function createTestScene()
{
    var scene = createSceneWithCurrent('New Scene', 'default');
    console.log(scene);
    console.log(scenes);
}

function onNameChanged(nameItem)
{
    var sceneId = parseInt(nameItem.parentNode.id.replace(/[^0-9]/g,''));
    scenes[sceneId].name = nameItem.value;
}

function onTriggerChanged(triggerItem)
{
    var sceneId = parseInt(triggerItem.parentNode.id.replace(/[^0-9]/g,''));
    scenes[sceneId].trigger = triggerItem.value;
}

function onSceneSelect(sceneId)
{
    var id = parseInt(sceneId.split('scene')[1]);
    var selectedScene = scenes[id];

    // HACK - just replace the fixture en masse, we should be setting the values of the fixtures instead.
    replaceFixtures(selectedScene.fixtures);

}


// HACK - this is what happens when you cant require() in an iframe
const deepCopyFunction = (inObject) => {
    let outObject, value, key;
    
    if (typeof inObject !== "object" || inObject === null) {
        return inObject // Return the value if inObject is not an object
    }

    // Create an array or object to hold the values
    outObject = Array.isArray(inObject) ? [] : {};

    for (key in inObject) {
        value = inObject[key];

        // Recursively (deep) copy for nested objects, including arrays
        outObject[key] = deepCopyFunction(value);
    }

    return outObject;
}

function updateSceneWithCurrent(sceneId)
{
    var id = parseInt(sceneId.split('scene')[1]);
}

function removeScene(sceneId)
{
    var id = parseInt(sceneId.split('scene')[1]);

    // splice out the scene at this id
    scenes.splice(id,1);
    // recreate and replace the elements ( since IDs have changed )
    replaceScenes(scenes);

}
//#endregion


//#region Lights testing
function SendLightsData()
{
    var lightData = fillLightingData();
    nodecg.sendMessage('updateLights', lightData);
}
//#endregion