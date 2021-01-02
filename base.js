let allchars = canvas.tokens.placeables;
let PCs = allchars.filter(c => c.actor.hasPlayerOwner);
let Xs = PCs.map(PC => PC.x)
let Ys = PCs.map(PC => PC.y)

let minXs = Math.min.apply(Math, Xs )
let maxXs = Math.max.apply(Math, Xs )

let Xmid = (minXs+maxXs+canvas.grid.w)/2;

let visW = window.innerWidth

let zoomW = visW /(maxXs-minXs+canvas.grid.w)

let minYs = Math.min.apply(Math, Ys )
let maxYs = Math.max.apply(Math, Ys )

let Ymid = (minYs+maxYs+canvas.grid.h)/2;

let visH = window.innerHeight

let zoomH = visH /(maxYs-minYs+canvas.grid.h)

let zoom=1
if (zoomH<=zoomW){
    zoom = zoomH
} else {
    zoom = zoomW
};

zoom = zoom*0.66

if (zoom>1){
    zoom = 1
};

console.log(zoom);

canvas.animatePan({x:Xmid ,y:Ymid,scale:zoom, duration: 1000});


//window.Azzu.Pings.perform({x:Xmid ,y:Ymid})