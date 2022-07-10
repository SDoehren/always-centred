import {registerSettings} from './settings.js';
import {DMGlobalControlSwitch} from './dmcontrols.js';
import {selectedtokenbox, PCsbox} from './boxfinder.js';
import {AlwaysCentredLayer} from './always-centredLayer.js';

'use strict';


function registerLayer() {
    const layers = {
            AlwaysCentredLayer: {
                layerClass: AlwaysCentredLayer,
                group: "effects"
            }
    }

    CONFIG.Canvas.layers = mergeObject(Canvas.layers,layers);

    if (!Object.is(Canvas.layers, CONFIG.Canvas.layers)) {
        const layers = Canvas.layers;
        Object.defineProperty(Canvas, 'layers', {
            get: function () {
                return foundry.utils.mergeObject(layers, CONFIG.Canvas.layers)
            }
        })
    }
}

Hooks.once('init', async () => {
    console.log('always-centred | Initializing always-centred');
    registerSettings();
    registerLayer();
});

function DMControl(data){
    console.log(data);

    if ('infonote' in data){
       ui.notifications.info(data.infonote);
    }

    if ('boundingbox' in data) {
        panandzoom(data.boundingbox, data.panspeed, data.zoom)
    }
}


Hooks.on("ready", () => {
    console.log('always-centred | Ready');

    console.log("always-centred | Listener")
    game.socket.on('module.always-centred', (data) => DMControl(data));


    if ((game.settings.get("always-centred",'DMControl')) & !(game.user.isGM)){
        ui.notifications.info("Always Centred | The DM has control of your screen centring.");
    }

    if ((game.settings.get("always-centred",'DMControl')) & (game.user.isGM)){
        ui.notifications.info("Always Centred | The DM has control of the player screen centring.");
    }
});