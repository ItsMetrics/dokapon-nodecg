'use strict';



// Uses dmx to control lights
module.exports = function(nodecg) {
    const DMX = require('dmx');
    const dmx = new DMX();

    const universe = dmx.addUniverse('testing', null);

    // channels are defined as {index:value}
    class DMXFixture {
        constructor(name = "default", address = 1, channels = [])
        {
            // Name of this fixture
            this.name = name;

            // What is the starting address of this fixture
            this.address = address;

            // an array of the channel descriptions and values
            this.channels = channels;


            getChannels()
            {
                var chan = []
                for(i = 0; i < channels.length; ++i)
                {
                    var chanID = address + i;
                    var item = { [chanID]: channels[i].value};
                    chan.push(item);
                }
            }
        }


    }
    function init()
    {
        
    }


};