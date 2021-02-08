


export function DMGlobalControl() {
    let els = document.querySelectorAll("[data-tool='always-centred-dmcontrol']");
    let elactive = !(els[0].className.includes("active"));
    game.settings.set("always-centred",'DMControl',elactive);


    if (elactive){
        game.socket.emit('module.always-centred', {infonote:"The DM has taken control of your screen centring."});
        ui.notifications.info("The DM has control xxx");
    } else {
        game.socket.emit('module.always-centred', {infonote:"The DM has released control of your screen centring."});
        ui.notifications.info("The DM has released control xxx");
    }
}

export function DMControl(data){

    if ('infonote' in data){
       ui.notifications.info(data.infonote);
    }

    if ('boundingbox' in data){
        panandzoom(data.boundingbox,data.panspeed,data.zoom)
    }

}

