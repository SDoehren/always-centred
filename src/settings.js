



export const registerSettings = function () {

    game.settings.register("always-centred", "alwayscenter", {
            name: "Centre View Continuously?",
            scope: "client",
            config: true,
            default: false,
            type: Boolean
        });

    game.settings.register("always-centred", "mode", {
        name: "Only Centre on Selected Token",
        scope: "client",
        config: true,
        default: "disabled",
        type: String,
        choices: {disabled: "Disabled", pcs: "PCs", selectedtoken: "Selected Token"},
    });

    game.settings.register("always-centred", "onlyselected", {
        name: "Only Centre on Selected Token",
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

    game.settings.register("always-centred", "cleandisplay", {
        name: "Remove Display Unneeded Elements",
        scope: "client",
        config: true,
        default: false,
        type: Boolean
    });
};