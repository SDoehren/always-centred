


export function DMGlobalControl() {
    let els = document.querySelectorAll("[data-tool='always-centred-dmcontrol']");
    let elactive = !(els[0].className.includes("active"));
    game.settings.set("always-centred",'DMControl',elactive);


    if (elactive){
        game.socket.emit('module.always-centred', {infonote:"Always Centred | The DM has taken control of your screen centring."});
        ui.notifications.info("Always Centred | The GM has control");
    } else {
        game.socket.emit('module.always-centred', {infonote:"Always Centred | The DM has released control of your screen centring."});
        ui.notifications.info("Always Centred | The GM has released control");
    }
}


export function DMGlobalControlSwitch() {
    let elactive = !(game.settings.get("always-centred",'DMControl'));
    game.settings.set("always-centred",'DMControl',elactive);


    if (elactive){
        game.socket.emit('module.always-centred', {infonote:"The DM has taken control of your screen centring."});
        ui.notifications.info("Always Centred | The GM has control");
    } else {
        game.socket.emit('module.always-centred', {infonote:"The DM has released control of your screen centring."});
        ui.notifications.info("Always Centred | The GM has released control");
    }
}


