import {registerSettings} from './settings.js';

'use strict';

/* ------------------------------------ */
/* Initialize                           */
/* ------------------------------------ */




Hooks.once('init', async () => {
    console.log('always-centred | Initializing always-centred');
    registerSettings();

});



Hooks.on("ready", () => {
  console.log('always-centred | Ready');

  console.log("always-centred | Listener")
  /*game.socket.on('module.always-centred', (data) => DMControl(data));


  if ((game.settings.get("always-centred",'DMControl')) & !(game.user.isGM)){
        ui.notifications.info("The DM has control of your screen centring.");
    }

  if ((game.settings.get("always-centred",'DMControl')) & (game.user.isGM)){
        ui.notifications.info("The DM has control of the player screen centring.");
    }
    */

    if (game.user.isGM){game.settings.set("always-centred",'DMControl',false);}
});


function DMGlobalControl() {
    let els = document.querySelectorAll("[data-tool='always-centred-dmcontrol']");
    let elactive = !(els[0].className.includes("active"));
    game.settings.set("always-centred",'DMControl',elactive);

    /*
    if (elactive){
        game.socket.emit('module.always-centred', {infonote:"The DM has taken control of your screen centring."});
        ui.notifications.info("The DM has control");
    }*/
}

function SettingsChange(mode) {
    game.settings.set("always-centred",'mode',mode);

    let modetext = {
        disabled:"disabled",
        pcs:"Party View",
        selectedtoken:"Selected Token"
    };

    ui.notifications.info("Always Centred | Mode set to '"+modetext[mode]+"'.");

    /*
    if ((game.settings.get("always-centred",'DMControl')) & !(game.user.isGM)){
        ui.notifications.info("The DM has control of your screen centring.");
    }*/
}

/*
Hooks.on("getSceneControlButtons", (controls) => {
  const bar = controls.find((c) => c.name === "token");
  bar.tools.push({
    name: "always-centred-dmcontrol",
    title: "DM Control Centring for All",
    icon: "fas fa-globe-europe",
      onClick: () => DMGlobalControl(),
    toggle: true,
      visible: game.user.isGM,
  });

  bar.tools.push({
    name: "always-centred-stopcentre",
    title: "Stop Centring",
    icon: "fas fa-pause",
    onClick: () => SettingsChange("disabled"),
    button: true,
  });
  bar.tools.push({
    name: "always-centred-centrePCs",
    title: "Centre Party View",
    icon: "far fa-object-group",
      onClick: () => SettingsChange("pcs"),
    button: true,
  });
  bar.tools.push({
    name: "always-centred-selectedtoken",
    title: "Centre Selected Token",
    icon: "fas fa-universal-access",
      onClick: () => SettingsChange("selectedtoken"),
    button: true,
  });
});
*/


function selectedtokenbox(token) {
    let topleft = {x:token.x,y:token.y};
    let bottomright = {x:token.x+token.width*canvas.grid.w,y:token.y+token.height*canvas.grid.h};

    let boundingbox = {
      topleft: topleft,
      bottomright: bottomright,
    };

    return boundingbox
};

function PCsbox(token) {
    //let PCs = canvas.tokens.ownedTokens;
    let allchars = canvas.tokens.placeables;
    let PCs = allchars.filter(c => c.actor.hasPlayerOwner);

    /*
    get list of tokens that did not move
    has to be done this way as the canvas.tokens.placeables will return the old postion of the token, token returns the target position
     */
    let nonmovers = PCs.filter(PC => PC.id != token._id);
    //console.log(PCs);
    //get list of Left and right x coordinates of the tokens and add the new location of the move token
    let LeftXs = nonmovers.map(PC => PC.x);
    LeftXs.push(token.x);

    let gridwidth = canvas.grid.w;
    let RightXs = nonmovers.map(PC => PC.x+PC.w)
    RightXs.push(token.x+token.width*gridwidth);

    //get list of top and bottom y coordinates of the tokens and add the new location of the move token
    let TopYs = nonmovers.map(PC => PC.y);
    TopYs.push(token.y);

    let gridheight = canvas.grid.h;
    let BottomYs = nonmovers.map(PC => PC.y+PC.h);
    BottomYs.push(token.y+token.height*gridheight);

    let minX = Math.min.apply(Math, LeftXs );
    let maxX = Math.max.apply(Math, RightXs );
    let minY = Math.min.apply(Math, TopYs );
    let maxY = Math.max.apply(Math, BottomYs );

    return {topleft: {x:minX,y:minY},bottomright: {x:maxX,y:maxY}};
}


function DMControl(data){

  if ('infonote' in data){
       ui.notifications.info(data.infonote);
  }
}


function checkMLT(token){
    if (game.modules.get("multilevel-tokens") === undefined){
        return false
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


Hooks.on('updateToken', async (scene, token, delta, diff) => {
    //check setting is on
    if (game.settings.get("always-centred", 'mode',) === "disabled") {
        return;
    }

    let mover = canvas.tokens.placeables.filter(PC => PC.id == token._id)[0];
    let movervel = mover._velocity
    let oldposition = {x:token.x-movervel.dx,y:token.y-movervel.dy,width:token.width,height:token.height}

    if (checkMLT(token) & (checkMLT(oldposition))) {
        return;
    }

    //check for collision with multilevel token

    let boundingbox;

    if (!(game.user.isGM) & game.settings.get("always-centred",'DMControl')) {
        //socket message will come.
        return;

    } else if (game.settings.get("always-centred", 'mode',) === "selectedtoken") {
        /*
        get list of tokens
        check if selected by current player
        get token ids
        */
        let controlled = canvas.tokens.controlled;
        let controlledids = controlled.map(c => c.id);

        //if not selected by player exit early
        if (!(controlledids.includes(token._id))) {
            return;
        }

        //otherwise get the box around the token
        boundingbox = selectedtokenbox(token);

    } else if (game.settings.get("always-centred", 'mode',) === "pcs") {

        //if not owned by player exit early
        let allchars = canvas.tokens.placeables;
        let PCs = allchars.filter(c => c.actor.hasPlayerOwner);
        let PCids = PCs.map(c => c.actor.id);
        if (!(PCids.includes(token.actorId))) {
            return;
        }

        boundingbox = PCsbox(token);
    }

    if (game.user.isGM & game.settings.get("always-centred",'DMControl')) {

        console.log("always-centred | boundingbox emitted");
        game.socket.emit('module.always-centred', {boundingbox:boundingbox});
    }

    //check collision with MLT
    if (checkMLT(token) & !(checkMLT(oldposition))) {
        panandzoom(boundingbox,0)
    } else {
        panandzoom(boundingbox)
    }
})

async function panandzoom(boundingbox, panspeed){

    console.log('always-centred | boundingbox');
    console.log(boundingbox);
    console.log(panspeed);

    //get the view port; minus 298 to account for the sidebar
    let sidebar = document.getElementById('sidebar');
    let sidebarwidth = sidebar.offsetWidth;
    let visW = window.innerWidth-sidebarwidth;
    let visH = window.innerHeight;

    //calculate centre of the bounding box
    //calculate the zoom required to see all play controlled tokens
    let Xmid = (boundingbox.topleft.x+boundingbox.bottomright.x)/2;
    let Ymid = (boundingbox.topleft.y+boundingbox.bottomright.y)/2;

    // set default zoom to the current zoom level
    let zoom = canvas.stage.scale.x;

    if (game.settings.get("always-centred",'autozoom',)) {
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
        let boxheightpadded = (boxheight+canvas.grid.w*game.settings.get("always-centred",'paddingsq',));
        let zoomHperpadded = visH /boxheightperpadded;
        let zoomHpadded = visH /boxheightpadded;

        //find the smallest (farthest away) of the zooms
        //if all the zooms are closer than the minimum, set to minimum
        let zoomopts = [zoomWperpadded, zoomWpadded, zoomHperpadded, zoomHpadded, game.settings.get("always-centred", 'maxzoom',)];
        zoom = Math.min.apply(Math, zoomopts);
    };

    //the maths assumes the sidebar is half on the left and half on the right, this corrects for that.
    let Xmidsidebaradjust = Xmid+(sidebarwidth/zoom)/2
    //move camera

    if (panspeed===undefined) {
        canvas.animatePan({
            x: Xmidsidebaradjust,
            y: Ymid,
            scale: zoom,
            duration: game.settings.get("always-centred", 'updatespeed',)
        });
        console.debug('always-centred | x:' + Xmidsidebaradjust + '|y:' + Ymid + '| zoom:' + zoom + ' | speed:'+game.settings.get("always-centred", 'updatespeed',));


    } else {
        canvas.animatePan({
            x: Xmidsidebaradjust,
            y: Ymid,
            scale: zoom,
            duration: panspeed
        });
        console.debug('always-centred | x:' + Xmidsidebaradjust + ' | y:' + Ymid + '| zoom:' + zoom + ' | speed:'+panspeed);
    }

    //Pings src for debug only (https://gitlab.com/foundry-azzurite/pings/-/blob/master/README.md)
    //window.Azzu.Pings.perform({x:Xmid ,y:Ymid})
}