'use strict';
// Handle the graphing data from NetWorth dashboard
module.exports = function(nodecg){
    const fs = require('fs');
    const path = "./bundles/dokapon-scoreboard/saves/networth";
    const filepathConstructor = "./bundles/dokapon-scoreboard/saves/networth/";

    // replicants
    const networthFiles = nodecg.Replicant('networth-files');

    function getNetWorthFiles()
    {
        fs.readdir(path, function(err, items){
            if(null != err)
            {
                nodecg.log.error(err);
            }
            networthFiles.value = items;
        });
    }
    function getFilePathWithName(filename)
    {
        return filepathConstructor + filename;
    }
    function getFileData(filename)
    {
        var filePath = getFilePathWithName(filename);

    }

    function saveFileData(filename)
    {
        var filePath = getFilePathWithName(filename);
    }



};