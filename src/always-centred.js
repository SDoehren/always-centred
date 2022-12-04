import {registerSettings} from './settings.js';
import {DMGlobalControlSwitch} from './dmcontrols.js';
import {selectedtokenbox, PCsbox} from './boxfinder.js';

'use strict';


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

    if (game.settings.get("always-centred", "LatestVersion")!==game.modules.get("always-centred").data.version && game.user.isGM){
        let message = "Hi,<br>Thanks for installing/updating Always Centred" +
            "<br>This V10 version of Always Centred has fundamental changes in the calculations, this may lead to unexpected behaviour.<br>" +
            "<br>Scene controls are no longer supported by Always Centred and have instead been replaced by macros performing the same behaviours.<br>" +
            "<br>This message will not be shown again until the next update.<br><br>" +
            "All the best,<br>SDoehren<br>Discord Server: https://discord.gg/QNQZwGGxuN"
        ChatMessage.create({whisper:ChatMessage.getWhisperRecipients("GM"),content: message,speaker:ChatMessage.getSpeaker({alias: "Tension Pool"})}, {});
        game.settings.set("always-centred", "LatestVersion",game.modules.get("always-centred").data.version)
    }

});

function getboundingbox(token){
    let boundingbox;
    let tokens;
    if (game.settings.get("always-centred", 'mode',) === "selectedtoken") {
        //get list of controlled tokens ids; if not selected by player exit early
        let controlledids = canvas.tokens.controlled.map(c => c.id);
        if (!(controlledids.includes(token.id))) {return;}

        tokens = canvas.tokens.controlled

        boundingbox = {
          topleft: topleft,
          bottomright: bottomright,
        };

    } else if (game.settings.get("always-centred", 'mode',) === "pcs") {

        //if token not owned by player exit early
        let allchars = canvas.tokens.placeables.filter(c => c.actor !== null);
        let PCs = allchars.filter(c => c.actor.hasPlayerOwner);
        let PCids = PCs.map(c => c.actor.id);


        if (!(PCids.includes(token._actor.id))) {return;}

        tokens = canvas.tokens.placeables.filter(c => c.actor !== null);
        if (!(game.settings.get("always-centred", 'includeinvisible',))){
            tokens = tokens.filter(x=>x.worldVisible);
        }
        tokens = tokens.filter(c => c.actor.hasPlayerOwner);

        console.log(boundingbox)
    }

    let leftbox = tokens.map(c => c.bounds.left)
    leftbox = Math.min(...leftbox)

    let topbox = tokens.map(c => c.bounds.top)
    topbox = Math.min(...topbox)

    let rightbox = tokens.map(c => c.bounds.right)
    rightbox = Math.max(...rightbox)

    let bottombox = tokens.map(c => c.bounds.bottom)
    bottombox = Math.max(...bottombox)

    let topleft = {x:leftbox,y:topbox};
    let bottomright = {x:rightbox,y:bottombox};

    boundingbox = {
      topleft: topleft,
      bottomright: bottomright,
    };

    return boundingbox
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

async function runmainprocess(token){
    if (game.settings.get("always-centred", 'mode',) === "disabled") {return false;}

    let boundingbox = getboundingbox(token);

    if (boundingbox === undefined) {
        return;
    }

    let zoom = calculatezoom(boundingbox);

    let panspeed;

    await panandzoom(boundingbox, panspeed,zoom)

}

Hooks.on('updateToken', async (token, delta, diff) => {
    await runmainprocess(token)
})