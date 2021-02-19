

export function selectedtokenbox(token) {
    let topleft = {x:token.x,y:token.y};
    let bottomright = {x:token.x+token.width*canvas.grid.w,y:token.y+token.height*canvas.grid.h};

    let boundingbox = {
      topleft: topleft,
      bottomright: bottomright,
    };

    return boundingbox
};

export function PCsbox(token) {

    //let PCs = canvas.tokens.ownedTokens;
    let allchars = canvas.tokens.placeables.filter(c => c.actor !== null);

    if (!(game.settings.get("always-centred", 'includeinvisible',))){
        allchars = allchars.filter(x=>x.worldVisible);
    }

    let PCs = allchars.filter(c => c.actor.hasPlayerOwner);

    /*
    get list of tokens that did not move
    has to be done this way as the canvas.tokens.placeables will return the old postion of the token, token returns the target position
     */
    let nonmovers = PCs.filter(PC => PC.id != token._id);
    //console.log(PCs);
    //get list of Left and right x coordinates of the tokens and add the new location of the move token
    let LeftXs = nonmovers.map(PC => PC.x);


    let gridwidth = canvas.grid.w;
    let RightXs = nonmovers.map(PC => PC.x+PC.w)


    //get list of top and bottom y coordinates of the tokens and add the new location of the move token
    let TopYs = nonmovers.map(PC => PC.y);


    let gridheight = canvas.grid.h;
    let BottomYs = nonmovers.map(PC => PC.y+PC.h);


    if (PCs.map(c => c.id).includes(token._id)) {
        LeftXs.push(token.x);
        RightXs.push(token.x+token.width*gridwidth);
        TopYs.push(token.y);
        BottomYs.push(token.y+token.height*gridheight);
    }


    let minX = Math.min.apply(Math, LeftXs );
    let maxX = Math.max.apply(Math, RightXs );
    let minY = Math.min.apply(Math, TopYs );
    let maxY = Math.max.apply(Math, BottomYs );

    return {topleft: {x:minX,y:minY},bottomright: {x:maxX,y:maxY}};
}
