

export function selectedtokenbox(token) {
    let topleft = {x:token.data.x,y:token.data.y};
    let bottomright = {x:token.data.x+token.data.width*canvas.grid.w,y:token.data.y+token.data.height*canvas.grid.h};

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
    let nonmovers = PCs.filter(PC => PC.id != token.id);

    //console.log(PCs);
    //get list of Left and right x coordinates of the tokens and add the new location of the move token
    let LeftXs = nonmovers.map(PC => PC.data.x);


    let gridwidth = canvas.grid.w;
    let RightXs = nonmovers.map(PC => PC.data.x+PC.data.width*gridwidth)


    //get list of top and bottom y coordinates of the tokens and add the new location of the move token
    let TopYs = nonmovers.map(PC => PC.data.y);


    let gridheight = canvas.grid.h;
    let BottomYs = nonmovers.map(PC => PC.data.y+PC.data.height*gridheight);


    if (PCs.map(c => c.id).includes(token.id)) {
        LeftXs.push(token.data.x);
        RightXs.push(token.data.x+token.data.width*gridwidth);
        TopYs.push(token.data.y);
        BottomYs.push(token.data.y+token.data.height*gridheight);
    }

    console.log(nonmovers);
    console.log(LeftXs);
    console.log(RightXs);
    console.log(TopYs);
    console.log(BottomYs);

    let minX = Math.min.apply(Math, LeftXs );
    let maxX = Math.max.apply(Math, RightXs );
    let minY = Math.min.apply(Math, TopYs );
    let maxY = Math.max.apply(Math, BottomYs );

    return {topleft: {x:minX,y:minY},bottomright: {x:maxX,y:maxY}};
}
