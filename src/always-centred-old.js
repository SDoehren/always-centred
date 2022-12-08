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


function DMControl(data){
    console.log(data);

    if ('infonote' in data){
       ui.notifications.info(data.infonote);
    }

    if ('boundingbox' in data){
        let allchars = canvas.tokens.placeables.filter(c => c.actor !== null);

        let visids;
        if (!(game.settings.get("always-centred", 'includeinvisible',))){
            let vischars = allchars.filter(x=>x.worldVisible);
            visids = vischars.map(c => c.id);
        } else {
            visids = allchars.map(c => c.id);
        }


        if (visids.includes(data.token.id)) {
            panandzoom(data.boundingbox, data.panspeed, data.zoom)
        } else {
            runmainprocess(data.token,true)
        }
    }

}

Hooks.once('init', async () => {
    console.log('always-centred | Initializing always-centred');
    registerSettings();
    registerLayer();


    if (game.modules.get("keybind-lib") !== undefined) {
        if (game.modules.get("keybind-lib").active === true) {

            KeybindLib.register("always-centred", "Keybind-GMControl", {
                name: "Toggle GM Control",
                default: "Ctrl + KeyD",
                onKeyDown: () => DMGlobalControlSwitch()
            });


            KeybindLib.register("always-centred", "Keybind-Mode", {
                name: "Toggle",
                default: "Ctrl + KeyF",
                onKeyDown: () => SettingsChange("Rotate")
            });
        }
    }
});

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




function SettingsChange(mode) {
    let modetext = {
        disabled:"disabled",
        pcs:"Party View",
        selectedtoken:"Selected Token"
    };

    let moderotate = {
        disabled:"pcs",
        pcs:"selectedtoken",
        selectedtoken:"disabled"
    };

    if (mode==="Rotate"){
        mode = moderotate[game.settings.get("always-centred",'mode')];
    }

    game.settings.set("always-centred",'mode',mode);

    ui.notifications.info("Always Centred | Mode set to '"+modetext[mode]+"'.");


    if ((game.settings.get("always-centred",'DMControl')) & !(game.user.isGM)){
        ui.notifications.info("Always Centred | The DM has control of your screen centring.");
    }
}

Hooks.on("getSceneControlButtons", (controls) => {
  if (game.settings.get("always-centred",'enablecontrols')) {
      controls.push({
          name: "Always Centred Controls",
          title: "Always Centred Controls",
          icon: "far fa-object-group",
          layer: "AlwaysCentredLayer",
          visible: true,
          tools: [
              {
                  name: "always-centred-dmcontrol",
                  title: "DM Control Centring for All",
                  icon: "fas fa-globe-europe",
                  layer: "AlwaysCentredLayer",
                  onClick: () => DMGlobalControlSwitch(),
                  visible: game.user.isGM,
                  button: true,
              },
              {
                  name: "always-centred-stopcentre",
                  title: "Toggle Centring",
                  icon: "fas fa-pause",
                  onClick: () => SettingsChange("disabled"),
                  button: true,
                  visible: true,
              },
              {
                  name: "always-centred-centrePCs",
                  title: "Centre Party View",
                  icon: "far fa-object-group",
                  onClick: () => SettingsChange("pcs"),
                  button: true,
                  visible: true,
              },
              {
                  name: "always-centred-selectedtoken",
                  title: "Centre Selected Token",
                  icon: "fas fa-universal-access",
                  onClick: () => SettingsChange("selectedtoken"),
                  button: true,
                  visible: true,
              },
          ],
      });
  }
});




function checkMLT(token){
    if (game.modules.get("multilevel-tokens") === undefined){
        return false;
    }

    let tokenx = token.x+(canvas.grid.w*token.width)/2
    let tokeny = token.y+(canvas.grid.h*token.height)/2


    let dr = canvas.drawings.children[0].children;
    let MLTdr = dr.filter(d => d.data.flags["multilevel-tokens"] !== undefined);
    MLTdr = MLTdr.filter(d => d.data.flags["multilevel-tokens"].in);
    MLTdr = MLTdr.map(d => d.data)
    MLTdr = MLTdr.map(d => d.x<tokenx & d.x+d.width>tokenx & d.y<tokeny & d.y+d.height>tokeny);

    let MLTsum = MLTdr.reduce((a, b) => a + b, 0)

    return MLTsum !== 0
}

function getboundingbox(token){
    let boundingbox;
    if (game.settings.get("always-centred", 'mode',) === "selectedtoken") {
        //get list of controlled tokens ids; if not selected by player exit early
        let controlledids = canvas.tokens.controlled.map(c => c.id);
        if (!(controlledids.includes(token.id))) {return;}

        //otherwise get the box around the token
        boundingbox = selectedtokenbox(token);

    } else if (game.settings.get("always-centred", 'mode',) === "pcs") {

        //if token not owned by player exit early
        let allchars = canvas.tokens.placeables.filter(c => c.actor !== null);
        let PCs = allchars.filter(c => c.actor.hasPlayerOwner);
        let PCids = PCs.map(c => c.actor.id);


        if (!(PCids.includes(token._actor.id))) {return;}

        boundingbox = PCsbox(token);
    }
    console.log(boundingbox);

    return boundingbox;
}

async function performrunchecks(token,skipdmcheck){
    //check setting is on
    if (game.settings.get("always-centred", 'mode',) === "disabled") {return false;}



    let mover = canvas.tokens.placeables.filter(c => c.actor !== null);
    mover = mover.filter(PC => PC.id === token.id)[0];
    let movervel = mover._velocity
    let oldposition = {x:token.data.x-movervel.dx,y:token.data.y-movervel.dy,width:token.data.width,height:token.data.height}

    if (checkMLT(token) & (checkMLT(oldposition))) {return false;}

    if (!(skipdmcheck)) {
        if (!(game.user.isGM) & game.settings.get("always-centred", 'DMControl')) {
            //socket message will come.
            return false;
        }
    }

    return true;
}

function runmainprocess(token,skipdmcheck) {
    let mover = canvas.tokens.placeables.filter(c => c.actor !== null);
    mover = mover.filter(PC => PC.id === token.id)[0];
    let movervel = mover._velocity
    let oldposition = {x:token.data.x-movervel.dx,y:token.data.y-movervel.dy,width:token.data.width,height:token.data.height}

    let boundingbox = getboundingbox(token);
    console.log(boundingbox);


    if (boundingbox === undefined) {
        return;
    }

    let zoom = calculatezoom(boundingbox);

    let panspeed;
    //check collision with MLT
    if (checkMLT(token) & !(checkMLT(oldposition))) {
        panspeed = 0
    }

    if (!(skipdmcheck)) {
        if (game.user.isGM & game.settings.get("always-centred", 'DMControl')) {
            console.log("always-centred | boundingbox emitted");
            game.socket.emit('module.always-centred', {
                boundingbox: boundingbox,
                zoom: zoom,
                panspeed: panspeed,
                mode: game.settings.get("always-centred", 'mode'),
                token: token
            });
        }
    }
    panandzoom(boundingbox, panspeed, zoom)
}


function calculatezoom(boundingbox){
    //get the view port; minus 298 to account for the sidebar

    let sidebar = document.getElementById('sidebar');
    let sidebarwidth = sidebar.offsetWidth;
    let visW = window.innerWidth-sidebarwidth;
    let visH = window.innerHeight;

    // set default zoom to the current zoom level
    let zoom = canvas.stage.scale.x;

    let nonfit = false;

    if (!(game.settings.get("always-centred",'autozoom',))  & game.settings.get("always-centred",'mitigatebounce',)) {
        let bareminimumx = (window.innerWidth - document.getElementById('sidebar').offsetWidth) / ((boundingbox.bottomright.x - boundingbox.topleft.x) + canvas.grid.w*2.5);
        let bareminimumy = window.innerHeight / ((boundingbox.bottomright.y - boundingbox.topleft.y) + canvas.grid.h*2.5);
        if ((canvas.stage.scale.x > bareminimumx) || (canvas.stage.scale.x > bareminimumy)) {
            ui.notifications.info("Always Centred | Tokens do not fit - auto zooming");
            nonfit = true;
        }
    }


    if (game.settings.get("always-centred",'autozoom',) || (nonfit & game.settings.get("always-centred",'mitigatebounce',))) {
        //get box width
        let boxwidth = (boundingbox.bottomright.x-boundingbox.topleft.x);
        //add square padding to box width
        let boxwidthperpadded = boxwidth*(1+game.settings.get("always-centred",'paddingper',)/100);
        //add percentage padding to box width
        let boxwidthpadded = (boxwidth+canvas.grid.w*game.settings.get("always-centred",'paddingsq',)*2);
        //calculate the zoom based on the box+padding widths and the view port area
        let zoomWperpadded = visW /boxwidthperpadded;
        let zoomWpadded = visW /boxwidthpadded;

        //repeat the above but for the height
        let boxheight = (boundingbox.bottomright.y-boundingbox.topleft.y);
        let boxheightperpadded = boxheight*(1+game.settings.get("always-centred",'paddingper',)/100);
        let boxheightpadded = (boxheight+canvas.grid.w*game.settings.get("always-centred",'paddingsq',)*2);
        let zoomHperpadded = visH /boxheightperpadded;
        let zoomHpadded = visH /boxheightpadded;

        //this pad prevents nudging of the screen
        let boxwidthforcedpadded = (boxwidth+canvas.grid.w*2+150/zoom);
        let boxheightforcedpadded = (boxheight+canvas.grid.h*2+150/zoom);

        if (nonfit & game.settings.get("always-centred",'mitigatebounce',)){
            boxwidthforcedpadded = (boxwidth+canvas.grid.w*5);
            boxheightforcedpadded = (boxheight+canvas.grid.h*5);
        }


        let zoomWforcedpadded = visW /boxwidthforcedpadded;
        let zoomHforcedpadded = visH /boxheightforcedpadded;

        //find the smallest (farthest away) of the zooms
        //if all the zooms are closer than the minimum, set to minimum
        let mzoom = game.settings.get("always-centred", 'maxzoom',);
        if (mzoom <0.1){
            mzoom = 0.1
        }
        let zoomopts = [zoomWforcedpadded,zoomHforcedpadded,zoomWperpadded, zoomWpadded, zoomHperpadded, zoomHpadded, mzoom];
        zoom = Math.min.apply(Math, zoomopts);
    }

    return zoom
}

async function panandzoom(boundingbox, panspeed,zoom){

    if (game.settings.get("always-centred",'Debug',)){console.log('always-centred | boundingbox');};
    if (game.settings.get("always-centred",'Debug',)){console.log(boundingbox);};

    //get the view port; minus 298 to account for the sidebar
    let sidebar = document.getElementById('sidebar');
    let sidebarwidth = sidebar.offsetWidth;

    //calculate centre of the bounding box
    //calculate the zoom required to see all play controlled tokens
    let Xmid = (boundingbox.topleft.x+boundingbox.bottomright.x)/2;
    let Ymid = (boundingbox.topleft.y+boundingbox.bottomright.y)/2;


    //the maths assumes the sidebar is half on the left and half on the right, this corrects for that.
    let Xmidsidebaradjust = Xmid+(sidebarwidth/zoom)/2

    //move camera

    if (zoom===undefined) {
        // set default zoom to the current zoom level
        zoom = canvas.stage.scale.x;
    }

    if (panspeed===undefined) {
        canvas.animatePan({
            x: Xmidsidebaradjust,
            y: Ymid,
            scale: zoom,
            duration: game.settings.get("always-centred", 'updatespeed',)
        });
        if (game.settings.get("always-centred",'Debug',)){
        console.log('always-centred | panspeed===undefined x:' + Xmidsidebaradjust + '|y:' + Ymid + '| zoom:' + zoom + ' | speed:'+game.settings.get("always-centred", 'updatespeed',));
        };

    } else {
        canvas.animatePan({
            x: Xmidsidebaradjust,
            y: Ymid,
            scale: zoom,
            duration: panspeed
        });
        if (game.settings.get("always-centred",'Debug',)){
        console.log('always-centred | panspeed!==undefined x:' + Xmidsidebaradjust + ' | y:' + Ymid + '| zoom:' + zoom + ' | speed:'+panspeed);
        };

    }

    //Pings src for debug only (https://gitlab.com/foundry-azzurite/pings/-/blob/master/README.md)
    //window.Azzu.Pings.perform({x:Xmid ,y:Ymid})
}

Hooks.on('updateToken', async (token, delta, diff) => {
    let proceed = await performrunchecks(token)
    if (proceed) {
        runmainprocess(token)
    }
})

