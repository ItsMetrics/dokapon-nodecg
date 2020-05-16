'use strict';


var stage;



const STAGE_WIDTH = 450;
const STAGE_HEIGHT = 500;
const STAGE_X_OFFSET = STAGE_WIDTH + 50;

const DISPLAY_TIME = 5* 1000;

// Tween stuff
const TIME_TO_STAGE = 1000;
const TIME_TO_EXIT = 1000;

// references to the objects being displayed and in the queue
var currentDisplay = null;
var displayQueue = [];
function init()
{
    setUpStage();

    // HACK - testing out the staging area idea
    //fillVisibleArea();
    //drawToStagingArea();

    // TESTING THE ACTUAL OBJECTS
    createWeeklyEvent('abnormousDisaster');
    preloadSocial();
    preloadLogo();
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

    currentDisplay = getFirstItem();
    var container = currentDisplay.container;
    container.x = STAGE_X_OFFSET;
    container.y = 0;

    stage.addChild(container);
    createjs.Tween.get(container).to({x:0}, TIME_TO_STAGE, createjs.Ease.bounceOut)
        .wait(DISPLAY_TIME) // Display the object on the stage
        .to({x: -STAGE_WIDTH}, TIME_TO_EXIT, createjs.Ease.backIn)
        .call(addToQueue,[currentDisplay])
        .call(stageNextElement);
}

//#region Weekly Events
// TODO - move all of this into its own module
var weeklyPreload;
function createWeeklyEvent(eventName)
{
    preloadWeeklyAsset(eventName);
}

function preloadWeeklyAsset(eventName)
{
    var filename = './img/announcements/' + eventName+'.png';
    weeklyPreload = new createjs.LoadQueue();
    weeklyPreload.on("complete", handleWeeklyPreload, this, true);
    weeklyPreload.loadFile({id:"weeklyEvent", src: filename});
    
}

function handleWeeklyPreload()
{
    var container = new createjs.Container();
    var bmp = new createjs.Bitmap(weeklyPreload.getResult("weeklyEvent"));
    bmp.x = 53;
    bmp.y = 15;
    container.addChild(bmp);

    createStagingItem("weekly", container);
    

    // HACK - just testing the logic here
    stageNextElement();
}

//#endregion

//region Social Items
var socialPreload;
function preloadSocial()
{
    var filename = './img/announcements/testSocial.png';
    socialPreload = new createjs.LoadQueue();
    socialPreload.on("complete", handleSocialPreload, this, true);
    socialPreload.loadFile({id:'social', src:filename});
}

function handleSocialPreload()
{
    var container = new createjs.Container();
    var bmp = new createjs.Bitmap(socialPreload.getResult("social"));
    bmp.x = 47;
    bmp.y = 15;
    container.addChild(bmp);

    createStagingItem('social', container);
}
//endregion

//region Logo Item
var logoPreload;
function preloadLogo()
{
    var filename = './img/announcements/testLogo.png';
    logoPreload = new createjs.LoadQueue();
    logoPreload.on('complete', handleLogoPreload, this, true);
    logoPreload.loadFile({id:'logo', src:filename});
}

function handleLogoPreload()
{
    var container = new createjs.Container();
    var bmp = new createjs.Bitmap(logoPreload.getResult('logo'));
    bmp.x = 47;
    bmp.y = 15;
    container.addChild(bmp);

    createStagingItem('logo', container);
}
//endregion

//region Queue Management
function addToQueue(item)
{
    // TODO - should be testing this to make sure that it conforms to the queue, damn you JS
    displayQueue.push(item);
}

// remove from queue and return the item
function getFirstItem()
{
    return displayQueue.shift();
}


function peekQueue()
{
    if(displayQueue.length <= 0)
    {
        return null;
    }
    return displayQueue[0];
}

function createStagingItem(_id, _container)
{
    var item = {id : _id, container : _container};
    addToQueue(item);
}

//endregion
