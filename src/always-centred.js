/* ------------------------------------ */
/* Initialize module                    */
/* ------------------------------------ */
Hooks.once('init', async () => {
    console.log('always-centred | Initializing always-centred');
    game.settings.register("always-centred", "alwayscenter", {
        name: "Centre View Continuously?",
        scope: "client",
        config: true,
        default: false,
        type: Boolean
    });

    game.settings.register("always-centred", "maxzoom", {
        name: "Max zoom level",
        scope: "client",
        config: true,
        default: 1,
        type: Number
    });

    game.settings.register("always-centred", "updatespeed", {
        name: "Camera animation speed",
        scope: "client",
        config: true,
        default: 500,
        type: Number
    });

});


Hooks.on("ready", function() {
  console.log('always-centred | Ready');
});


Hooks.on('updateToken', async (scene, token, delta, diff, userId) => {
    console.log(token);

    //check setting is on
    if (!(game.settings.get("always-centred",'alwayscenter',))){return;};

    /*
    get list of tokens
    check if owned by player
    get token ids
     */
    let allchars = canvas.tokens.placeables;
    let PCs = allchars.filter(c => c.actor.hasPlayerOwner);
    let PCids = PCs.map(c => c.actor.id);

    //if not owned by player exit early
    if (!(PCids.includes(token.actorId))){return;};

    /*
    get list of tokens that did not move
    has to be done this way as the canvas.tokens.placeables will return the old postion of the token, token returns the target position
     */
    PCs = PCs.filter(PC => PC.id != token._id);

    //get list of x coordinates of left hand side of the tokens and add the new location of the move token
    let Xs = PCs.map(PC => PC.x)
    Xs.push(token.x);

    //get list of y coordinates of left hand side of the tokens and add the new location of the move token
    let Ys = PCs.map(PC => PC.y)
    Ys.push(token.y);

    //get min,max and average x of tokens, canvas.grid.w assumes tokens are one grid space wide
    let minXs = Math.min.apply(Math, Xs )
    let maxXs = Math.max.apply(Math, Xs )
    let Xmid = (minXs+maxXs+canvas.grid.w)/2;

    //get the view port width minus 298 to account for the sidebar
    let visW = window.innerWidth-298

    //calculate the zoom required to see all play controlled tokens
    let zoomW = visW /(maxXs-minXs+canvas.grid.w)

    //as above but for y
    let minYs = Math.min.apply(Math, Ys )
    let maxYs = Math.max.apply(Math, Ys )
    let Ymid = (minYs+maxYs+canvas.grid.h)/2;
    let visH = window.innerHeight
    let zoomH = visH /(maxYs-minYs+canvas.grid.h)

    //find the smaller (farthest away) of the 2 zooms
    let zoom=1
    if (zoomH<=zoomW){
        zoom = zoomH
    } else {
        zoom = zoomW
    };

    //move the camera back a third
    zoom = zoom*0.66

    //if the zoom is closer than the minimum, set to minimum
    if (zoom>game.settings.get("always-centred",'maxzoom',)){
        zoom = game.settings.get("always-centred",'maxzoom',)
    };


    //move camera
    canvas.animatePan({x:Xmid,y:Ymid,scale:zoom, duration: game.settings.get("always-centred",'updatespeed',)});

    //message the console
    console.debug('always-centred | x:'+Xmid+'|y:'+Ymid+'zoom:'+zoom);

    //Pings module for debug only (https://gitlab.com/foundry-azzurite/pings/-/blob/master/README.md)
    //window.Azzu.Pings.perform({x:Xmid ,y:Ymid})
});