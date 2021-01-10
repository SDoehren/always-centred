import {registerSettings} from './settings.js';

'use strict';

/* ------------------------------------ */
/* Initialize                           */
/* ------------------------------------ */
Hooks.once('init', async () => {
    console.log('always-centred | Initializing always-centred');
    registerSettings();

});


Hooks.on("ready", function() {
    if (game.settings.get("always-centred",'cleandisplay',)){
        document.getElementById("navigation").remove();
        document.getElementById("controls").remove();
        document.getElementById("hotbar").remove();
        document.getElementById("players").remove();
        document.getElementById("chat-controls").remove();
        document.getElementById("chat-form").remove();
    };

  console.log('always-centred | Ready');
});


function selectedtokenbox(token) {
    let topleft = {x:token.x,y:token.y};
    let bottomright = {x:token.x+token.width*canvas.grid.w,y:token.y+token.height*canvas.grid.h};
    console.log(topleft,bottomright);

    let boundingbox = {
      topleft: topleft,
      bottomright: bottomright,
    };

    return boundingbox
};

function PCsbox(token) {
    let PCs = canvas.tokens.ownedTokens;

    /*
    get list of tokens that did not move
    has to be done this way as the canvas.tokens.placeables will return the old postion of the token, token returns the target position
     */
    let nonmovers = PCs.filter(PC => PC.id != token._id);
    console.log(PCs);
    //get list of Left and right x coordinates of the tokens and add the new location of the move token
    let LeftXs = nonmovers.map(PC => PC.x);
    LeftXs.push(token.x);
    console.log(LeftXs);

    let gridwidth = canvas.grid.w;
    let RightXs = nonmovers.map(PC => PC.x+PC.w)
    RightXs.push(token.x+token.width*gridwidth);
    console.log(RightXs);

    //get list of top and bottom y coordinates of the tokens and add the new location of the move token
    let TopYs = nonmovers.map(PC => PC.y);
    TopYs.push(token.y);

    let gridheight = canvas.grid.w;
    let BottomYs = nonmovers.map(PC => PC.y+PC.h);
    BottomYs.push(token.y+token.height*gridheight);

    let minX = Math.min.apply(Math, LeftXs );
    let maxX = Math.max.apply(Math, RightXs );
    let minY = Math.min.apply(Math, TopYs );
    let maxY = Math.max.apply(Math, BottomYs );

    return {topleft: {x:minX,y:minY},bottomright: {x:maxX,y:maxY}};

    return 1
};


Hooks.on('updateToken', async (scene, token, delta, diff, userId) => {
    console.log(token);
    //check setting is on
    if (game.settings.get("always-centred",'mode',)=="disabled"){return;};
    let boundingbox;

    if (game.settings.get("always-centred",'mode',)=="selectedtoken"){
        /*
        get list of tokens
        check if selected by current player
        get token ids
        */
        let controlled = canvas.tokens.controlled;
        let controlledids = controlled.map(c => c.id);

        //if not selected by player exit early
        if (!(controlledids.includes(token._id))){return;};

        //otherwise get the box around the token
        boundingbox = selectedtokenbox(token);

    };

    if (game.settings.get("always-centred",'mode',)=="pcs") {

        //if not owned by player exit early
        let PCs = canvas.tokens.ownedTokens;
        let PCids = PCs.map(c => c.actor.id);
        if (!(PCids.includes(token.actorId))) {return;};

        boundingbox = PCsbox(token);
    };

    console.log(boundingbox);

    //get the view port; minus 298 to account for the sidebar
    let box = document.getElementById('sidebar');
    let sidebarwidth = box.offsetWidth;
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
    let Xmidsidebaradjust = (sidebarwidth/zoom)/2
    //move camera
    canvas.animatePan({x:Xmidsidebaradjust,y:Ymid,scale:zoom, duration: game.settings.get("always-centred",'updatespeed',)});

    //message the console
    console.debug('always-centred | x:'+(Xmid+sidebarsize/2)+'|y:'+Ymid+'zoom:'+zoom);
    //Pings src for debug only (https://gitlab.com/foundry-azzurite/pings/-/blob/master/README.md)
    window.Azzu.Pings.perform({x:Xmid ,y:Ymid})
});