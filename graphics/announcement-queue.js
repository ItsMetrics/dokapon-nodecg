'use strict';


var stage;
var preload;


const STAGE_WIDTH = 450;
const STAGE_HEIGHT = 500;
const STAGE_X_OFFSET = STAGE_WIDTH + 50;


// Tween stuff
const TIME_TO_STAGE = 1000;

// references to the objects being displayed and in the queue
var currentDisplay = null;
var displayQueue = [];
function init()
{
    setUpStage();

    // HACK - testing out the staging area idea
    fillVisibleArea();
    //drawToStagingArea();

    // TESTING THE ACTUAL OBJECTS
    createWeeklyEvent('abnormousDisaster');
}

function setUpStage()
{
    stage = new createjs.Stage("announcementCanvas");
    createjs.Ticker.addEventListener("tick", tick);
    createjs.Ticker.setFPS(30);
}

function fillVisibleArea()
{
    var g = new createjs.Graphics();
    g.setStrokeStyle(1);
    g.beginStroke(createjs.Graphics.getRGB(0,0,0));
    g.beginFill(createjs.Graphics.getRGB(255,0,0));
    g.drawRect(0,0,STAGE_WIDTH, STAGE_HEIGHT);

    var s = new createjs.Shape(g);
    stage.addChild(s);

}

function drawToStagingArea()
{
    var container = new createjs.Container();
    container.x = STAGE_WIDTH;
    container.y = 0;


    var g = new createjs.Graphics();
    g.setStrokeStyle(1);
    g.beginStroke(createjs.Graphics.getRGB(0,0,0));
    g.beginFill(createjs.Graphics.getRGB(0,255,0));
    g.drawRect(0,0,STAGE_WIDTH, STAGE_HEIGHT);

    var s = new createjs.Shape(g);
    container.addChild(s);


    stage.addChild(container);
    createjs.Tween.get(container).to({x:0}, 1000);
    createjs.Ticker.addEventListener("tick", stage);
}

function buildInStaging(containerToBuild)
{

}



function tick(e)
{
    stage.update()
}


function stageNextElement()
{
    if(displayQueue.length == 0)
    {
        console.log('staging called with no elements in queue');
    }

    var item = displayQueue[0];
    item.x = STAGE_X_OFFSET;
    item.y = 0;

    stage.addChild(item);
    createjs.Tween.get(item).to({x:0}, TIME_TO_STAGE, createjs.Ease.backOut);
}

//#region Weekly Events
// TODO - move all of this into its own module
function createWeeklyEvent(eventName)
{
    preloadWeeklyAsset(eventName);
}

function preloadWeeklyAsset(eventName)
{
    var filename = './img/announcements/' + eventName+'.png';
    preload = new createjs.LoadQueue();
    preload.on("complete", handleWeeklyPreload, this, true);
    preload.loadFile({id:"weeklyEvent", src: filename});
    
}

function handleWeeklyPreload()
{
    var container = new createjs.Container();
    var bmp = new createjs.Bitmap(preload.getResult("weeklyEvent"));
    bmp.x = 53;
    bmp.y = 15;
    container.addChild(bmp);
    displayQueue.push(container);

    // HACK - just testing the logic here
    stageNextElement();
}
//#endregion