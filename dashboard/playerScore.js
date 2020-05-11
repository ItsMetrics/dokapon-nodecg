const playerName = document.getElementById('playerName');
const tempName = document.getElementById('playerTempName');
const gender = document.getElementById('playerGender');
const job = document.getElementById('jobSelect');
const color = document.getElementById('colorSelect');
const fileSelection = document.getElementById('FileSelector');


// need this to see who is currently being submitted
const currentPlayer = document.getElementById('playerSelect');

// TODO - Replace this garbage with a file store of some sort
var fakePlayerData = 
'{' +
    '"players":['+
        '{ "playerID": 1, "playerName" : "FAKE1", "playerTempName" : "", "gender" : "male", "job" : "Thief", "color" : "Red"},'+
        '{ "playerID": 2, "playerName" : "FAKE2","playerTempName" : "" , "gender" : "female", "job" : "Warrior", "color" : "Green"},'+
        '{ "playerID": 3, "playerName" : "FAKE3", "playerTempName" : "" , "gender" : "male", "job" : "Cleric", "color" : "Blue"}, '+
        '{ "playerID": 4, "playerName" : "FAKE4", "playerTempName" : "Blarghle" , "gender" : "female", "job" : "Magician", "color" : "Pink"}]}';

const saveListReplicant = nodecg.Replicant('save-list');
const currentParsedData = nodecg.Replicant('parsed-data');

const updatedPlayer = nodecg.Replicant('player-update');


var parsedData = null;
var hasBeenParsed = false;
function parseData()
{
    if(!hasBeenParsed)
    {
        parsedData = JSON.parse(fakePlayerData);
        hasBeenParsed = true; //comment this out if we need to reload data
        updateAllPlayerSelections();
    }

}
function getUserData(selectObject)
{

    // TODO - this is the extension handling
    loadFileList();
    // parse the json
    // TODO - get this from some sort of storage
    parseData();
    updateCurrentPlayerInfo(selectObject);

}

function updateCurrentPlayerInfo(selectedPlayerId)
{
    var arrId = selectedPlayerId - 1;
    var playerData = parsedData.players[arrId];
    playerName.value = playerData.playerName;
    tempName.value = playerData.playerTempName;
    gender.value = playerData.gender;
    job.value = playerData.job;
    color.value = playerData.color;
}

function submitData()
{
    // Who are we working on?
    var playerID = currentPlayer.value - 1;


    var playerData = parsedData.players[playerID];
    playerData.playerName =playerName.value;
    playerData.playerTempName = tempName.value;
    playerData.gender = gender.value;
    playerData.job = job.value;
    playerData.color = color.value;


    // TODO - temp test for filename selection
    var filename = createImageFileFromData(playerData);
    
    // replace the working model
    parsedData.players[playerID] = playerData;
    parsedData.lastChangedID = playerID;

    currentParsedData.value = parsedData;
    // hacky test for the save file function
    saveData();

}

//TODO - temporary Function
// Update the innerHTML of the select box based on the userdata
function updateAllPlayerSelections()
{
    var options = currentPlayer.options;
    //console.log(options);
    [].forEach.call(options, function(item){
        var text = "Player ";
        var id = item.value - 1;
        text += item.value + " - ";
        text += parsedData.players[id].playerName;

        item.innerHTML = text;
    });
        
}

// TODO - This is a temporary procedure for creating the file name paths
function createImageFileFromData(playerData)
{
    var filename = "";
    if(playerData.job != "Darkling")
        filename += playerData.color + '-';
    filename += playerData.gender == "male" ? "M-" : "F-";
    filename += playerData.job + ".png"
    //console.log(filename);
    return filename;
}

// Moving logic to extension
function loadFileList()
{
    nodecg.sendMessage('getFileList');
}


//Update the file listings dropdown
saveListReplicant.on('change', (newValue, oldValue) => {
    if(!newValue)
    {
        return;
    }
    console.log('File List Updated')
    createFileListOptions();  
});

// create the options list from the filenames received.
function createFileListOptions()
{
    // Clear existing options
    fileSelection.length = 0;

    // Create a list of new files:
    saveListReplicant.value.forEach(file => {
        // create element
        var opt = document.createElement('option');

        // create text node
        opt.appendChild(document.createTextNode(file));
        // set value
        opt.value = file;
        // append to the box
        fileSelection.appendChild(opt);
    });

    // create an option to save a new file
    var opt = document.createElement('option');
    opt.appendChild(document.createTextNode('New File...'));
    opt.value = 'new';
    fileSelection.appendChild(opt);
}

// Load the save data when a file is selected from the dropdown
function loadData()
{
    nodecg.sendMessage('openFile', fileSelection.value);
}

currentParsedData.on('change', (newValue, oldValue) => {
    if(!newValue)
    {
        return;
    }
    console.log('New Parsed Data to Process');
    onNewData();
});

function onNewData()
{
    // TODO - any cleanup needed before switching the data
    // move the new data into our local var
    parsedData = currentParsedData.value;
    console.log(parsedData);
    // Update the player option box
    updateAllPlayerSelections();
    
    // Fill in the data for the currently selected player
    updateCurrentPlayerInfo(currentPlayer.value);

}

// called on button press, do we need this?
function saveData()
{
    console.log('saveData called');
    if(fileSelection.value == 'new')
    {
        saveNewFile(parsedData);
    }
    else
    {
        saveExistingFile(fileSelection.value, parsedData);
    }
}

function saveNewFile(data)
{
    // TODO - Save on new file selected
}

function saveExistingFile(filename, data)
{
    console.log('Saving existing file:' + filename);

    // TODO - clean up this construction, there has to be a better way!
    var message = {};
    message.filename = filename;
    message.data = data;

    nodecg.sendMessage('saveFile', message, error =>{
        if(error)
        {
            console.log(error);
            return;
        }
        console.log('File Saved as ' + filename);
    });
}