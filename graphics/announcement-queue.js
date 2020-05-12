'use strict';
var stage;
var preload;


const STAGE_WIDTH = 450;
const STAGE_HEIGHT = 500;
const STAGE_X_OFFSET = 50;

function init()
{
    preload = new createjs.LoadQueue();
    setUpStage();

    // HACK - testing out the staging area idea
    fillVisibleArea();
    drawToStagingArea();
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

function tick(e)
{
    stage.update()
}