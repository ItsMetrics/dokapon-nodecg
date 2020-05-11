'use strict';

module.exports = function(nodecg){
    // perform initialization
    const fs = require('fs');
    const path = "./bundles/dokapon-nodecg/saves";

    //replicants
    const saveListReplicant = nodecg.Replicant('save-list');
    const currentParsedData = nodecg.Replicant('parsed-data');

    // Get File List Request
    nodecg.listenFor('getFileList', async => {
        getFileList();
    });
    
    function getFileList()
    {
        fs.readdir(path, function(err, items){
            if(null != err)
            {
                nodecg.log.error(err);
            }
            saveListReplicant.value = items;
        });
    }

    //Save File Request
    nodecg.listenFor('saveFile', (messageData, ack) => {
        nodecg.log.warn('filename: ' + messageData.filename);
        saveFile(messageData.filename, messageData.data);
        if(ack && !ack.handled) 
        {
            ack(null);
        }
    });

    // save a file, to the path, with the data provided from the dashboard.
    function saveFile(filename, data)
    {
        var stringData = JSON.stringify(data);
        nodecg.log.warn(data);
        // open the file for writing
        fs.writeFile(path+'/'+filename, stringData, function(err) {
            if(err)
            {
                nodecg.log.error(err);
            }
        });
    }

    nodecg.listenFor('openFile', (filename) => {
        openFile(filename);
    });

    function openFile(filename)
    {
        var fullName = path + '/' + filename;
        fs.readFile(fullName, (err, data) => {
            if(err)
            {
                nodecg.log.error(err);
                return;
            }
            currentParsedData.value = JSON.parse(data);
        });
    }
};