'use strict';

var fixtures = [];

// document elements
var flexContainer = document.getElementById('flexboxContainer');


function fakeFixture()
{
    var fakeFixture = {};
    fakeFixture.name = "Faked Data";
    fakeFixture.channels = ["red", "blue", "green", "dimming"];
    fakeFixture.address = 1;
    return fakeFixture;
}

// TODO - is it innerHTML or innerText we want?

function addFixture()
{
    // HACK - faking the data for the test
    var fixtureToAdd = fakeFixture();

    // add fixture to list
    fixtures.push(fixtureToAdd);
    
    // create html elements
    var itemContainer = document.createElement("div");
    itemContainer.classList.add("flex-item");

    var header = document.createElement("h2");
    header.innerText = fixtureToAdd.name;
    itemContainer.appendChild(header);
    itemContainer.appendChild(document.createElement('br'));
    // TODO - need to add an address field

    // string builder
    var fixtureString = "fixture" + fixtures.length;
    for(var i = 0; i < fixtureToAdd.channels.length; ++i)
    {
        var itemString = "channel" + i+1;
        // Label
        var label = document.createElement('label');
        label.for = fixtureString + itemString;
        label.style = "float: left;";
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

        itemContainer.appendChild(slider);

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