'use strict';



// Uses dmx to control lights
module.exports = function(nodecg) {
    const DMX = require('dmx');
    const dmx = new DMX();

    const universe = dmx.addUniverse('testing','socketio', null, {port: 17809, debug: true});
    //#region Old Testing Code
    // var fixtures = [];
    // var scenes = [];
    
    // // channels are defined as {index:value}
    // class DMXFixture {
    //     constructor(name = "default", address = 1, channels = [])
    //     {
    //         // Name of this fixture
    //         this._name = name;

    //         // What is the starting address of this fixture
    //         this._address = address;

    //         // an array of the channel descriptions and values
    //         this._channels = channels;
    //     }

    //     getChannels()
    //     {
    //         var chanArr = []
    //         for(var i = 0; i < _channels.length; ++i)
    //         {
    //             var chanID = _address + i;
    //             var item = { [chanID]: _channels[i].value}; // eg {1:255}
    //             chanArr.push(item);
    //         }
    //         return chanArr;
    //     }
        
    //     // Gets an array of the IDs assigned to this fixture.
    //     // can be used to error check our setups
    //     getChannelIDs()
    //     {
    //         var idArr = []
    //         for(var i = 0; i < this._channels.length; ++i)
    //         {
    //             idArr.push(_address + i);
    //         }
    //         return idArr;
    //     }
    //     // Check if this id is contained in our fixture
    //     containsId(id)
    //     {
    //         if(id >= this._address && id < this._address + this._channels.length)
    //         {
    //             return true;
    //         }
    //         return false;
    //     }
    //     containsIdInRange(ids)
    //     {
    //         ids.array.forEach(element => {
    //             if(this.containsId(element))
    //             {
    //                 return true;
    //             }
    //         });
    //         return false;
    //     }
    // }
  
    // class Scene
    // {
    //     constructor(name = "default", fixtureSettings = [])
    //     {
    //         this._name = name;
    //         this._fixtureSettings = fixtureSettings;
    //     }

    //     get name()
    //     {
    //         return this._name;
    //     }
    //     set name(name)
    //     {
    //         this._name = name;
    //     }
    //     getUpdateData()
    //     {
    //         var updateData = []
    //         fixtureSettings.array.forEach(element => {
    //             updateData.concat(element.getChannels());
    //         });
    //         return updateData;
    //     }

    //     addFixture(fixture)
    //     {
    //         // check if the fixture collides with an existing one
    //         var newIds = fixture.getChannelIDs();
    //         this._fixtureSettings.array.forEach(element => {
    //             if(element.containsIdInRange(newIds))
    //             {
    //                 // One of these fixtures has a collision with our ID ranges, dont add it
    //                 nodecg.log.error("Conflict adding fixture to scene: ID collision");
    //                 return null;   
    //             }
    //         });
    //         // not found by ids
    //         this._fixtureSettings.push(fixture);           
    //     }

    //     removeFixtureByName(name)
    //     {
    //         var index = this._fixtureSettings.findIndex(element => element.name == name);
    //         if(index >= 0 )
    //         {
    //             this._fixtureSettings.splice(index, 1);
    //         }
    //     }
        
    // }
    //#endregion


    nodecg.listenFor('updateLights', (lights) => {
        nodecg.log.warn('Here');
        universe.update(lights); 
    })

};