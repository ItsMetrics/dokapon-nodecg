'use strict';
var stage;
var preload;
function init()
{
    preload = new createjs.LoadQueue();
    preloadAssets();
}

const MAGIC_NUM_PLAYERS = 4;
const MAGIC_NAMEPLATE_OFFSET = 90;
const MAGIC_INITIAL_OFFSET = 275;
const MAGIC_SCOREBOARD_INDENT = 45;
const MAGIC_NAMEPLATE_INDENT = 0;
var scoreboardContainers = [];

var parsedData = null;
var lastParsedData = null;



const currentParsedData = nodecg.Replicant('parsed-data');
function createScoreboardContainers()
{
    // clean up existing containers.
    scoreboardContainers.length = 0;
    
    // TODO - set this up to create multiple containers in a loop, and set their bounds
    // create the container
    var scoreboardBackground = new createjs.Bitmap('./img/backgrounds/Element.Frame.png');
    
    scoreboardBackground.setTransform(0,0,1,.66);
    scoreboardBackground.x = MAGIC_SCOREBOARD_INDENT - 26;
    scoreboardBackground.y = MAGIC_INITIAL_OFFSET + 450;
    stage.addChild(scoreboardBackground);

    //todo - this should be a customizable size
    for(var i = 0; i < MAGIC_NUM_PLAYERS; ++i)
    {
        var container = new createjs.Container();
        container.x = MAGIC_SCOREBOARD_INDENT + MAGIC_NAMEPLATE_INDENT*i;
        container.y = i * MAGIC_NAMEPLATE_OFFSET + MAGIC_INITIAL_OFFSET;

        // add the nameplate
        var nameplate = new createjs.Bitmap('./img/backgrounds/Round.Nameplate.Blank.png');
        container.addChild(nameplate);

        // add the image
        var bmp = new createjs.Bitmap('./img/png_faces/Black-F-Acrobat.png');
        bmp.x = 28;
        bmp.y = 22;
        container.addChild(bmp);


        // text 
        var string = "TestName " + (i+1);
        var text = new createjs.Text(string, "30px MS Gothic", "#000000");
        text.x = 90;
        text.y = 49;
        text.textBaseline = "alphabetic";

        container.addChild(text);

        // add to the stage
        stage.addChild(container);
        var containerData = {};
        containerData.container = container;
        containerData.head = bmp;
        containerData.name = text;

        scoreboardContainers.push(containerData);
    }


    
}

function tick(e)
{
    stage.update();
}

var vidElement;
function setLoadBackground(video, border)
{
    video.loop = true;
    video.autoplay = true;
    video.play();
    console.log(video);
    var videoBuffer = new createjs.VideoBuffer(video);
    var videoBMP = new createjs.Bitmap(videoBuffer);
    
    stage.addChild(videoBMP);

    var videoFrame = new createjs.Bitmap(border);
    stage.addChild(videoFrame);

}

function createDOMElement()
{
    const WIDTH = 450;
    const HEIGHT = 1080;
}

function preloadAssets()
{
    preload.on("complete", preloadComplete, this);
    preload.loadFile({src:'./video/DoABarrelRoll_1.webm', id:"video", type:"video"});
    preload.loadFile({src:'./video/Vid.Border.Flooded.Corners.png', id:"border"});
    preload.load();
    
}

function preloadComplete()
{
    stage = new createjs.Stage("scoreboardCanvas");
    
    var video = preload.getResult("video");
    var border = preload.getResult("border");

    setLoadBackground(video, border);
    assignSidebarHeader();

    createScoreboardContainers(stage);
    createjs.Ticker.addEventListener("tick", tick);
    createjs.Ticker.setFPS(30);

    if(shouldUpdateUI)
    {
        updateUIComplete();
    }
    stage.update();
}

function assignSidebarHeader()
{
    var header = new createjs.Bitmap('./img/placards/Dokapon_Kingdom_logo.png');
    header.setTransform(75,50,0.5,0.5);
    stage.addChild(header);
}

// Handle data from the backend
currentParsedData.on('change', (newValue, oldValue) => {
    if(!newValue || newValue == oldValue)
    {
        return;
    }
    console.log(currentParsedData.value);
    newDataSubmitted();
});

function newDataSubmitted()
{
    // TODO - This assumes only one object changed, since the dashboard only changes one player at a time
    // Find which item changed
    parsedData = currentParsedData.value;
    if(!lastParsedData)
    {
        // we dont have any old data. Use this for everything
        lastParsedData = currentParsedData.value;
        updateUIComplete();
    }
    else
    {
        var ID = parsedData.lastChangedID;
        updatePlayerUI(ID);
        lastParsedData = parsedData;
    }

    
}
var shouldUpdateUI = false;
//nodecg.listenFor('updatePlayer', playerData)
function updateUIComplete()
{
    //completely new data
    console.log("Updating WHOLE dataset");
    console.log(parsedData.players);
    if(!scoreboardContainers.length > 0)
    {
        console.log("Scoreboad containers is empty!");
        shouldUpdateUI = true;
        return;
    }
    console.log("Scoreboard Elements Exist");
    shouldUpdateUI = false;
    // iterate through the data to change the values
    // Names:
    for(var i = 0; i < MAGIC_NUM_PLAYERS; ++i)
    {
        console.log(parsedData.players[i].playerTempName);
        if(parsedData.players[i].playerTempName != "")
        {
            scoreboardContainers[i].name.text = parsedData.players[i].playerTempName;
        }
        else
        {
            console.log('Using Real Name');
            scoreboardContainers[i].name.text = parsedData.players[i].playerName;
        }

        // Images:
        var filename = createImageFileFromData(parsedData.players[i])
        var newImage = new createjs.Bitmap(filename);
        scoreboardContainers[i].head.image = newImage.image;
        console.log(filename);
    }
    

}

function updatePlayerUI(index)
{
    console.log("Updating player index: " + index);

    // name
    if(parsedData.players[index].playerTempName != "")
    {
        scoreboardContainers[index].name.text = parsedData.players[index].playerTempName;
    }
    else
    {
        console.log('Using Real Name');
        scoreboardContainers[index].name.text = parsedData.players[index].playerName;
    }

    var filename = createImageFileFromData(parsedData.players[index]);
    var newImage = new createjs.Bitmap(filename);
    scoreboardContainers[index].head.image = newImage.image;
}

// TODO - This is a temporary procedure for creating the file name paths
function createImageFileFromData(playerData)
{
    var filename = "./img/png_faces/";
    if(playerData.job != "Darkling")
        filename += playerData.color + '-';
    filename += playerData.gender == "male" ? "M-" : "F-";
    filename += playerData.job + ".png"
    //console.log(filename);
    return filename;
}