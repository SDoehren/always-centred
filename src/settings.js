



export const registerSettings = function () {

    game.settings.register("always-centred", "mode", {
        name: "Mode:",
        hint:"",
        scope: "client",
        config: true,
        default: "disabled",
        type: String,
        choices: {disabled: "Disabled", pcs: "Player Characters", selectedtoken: "Selected Token"},
    });

    game.settings.register("always-centred", "autozoom", {
        name: "Auto Zoom",
        hint:"",
        scope: "client",
        config: true,
        default: true,
        type: Boolean
    });

    game.settings.register("always-centred", "paddingsq", {
        name: "Padding added in all directions",
        hint:"",
        scope: "client",
        config: true,
        default: 12,
        type: Number
    });

    game.settings.register("always-centred", "paddingper", {
        name: "paddingper",
        hint:"",
        scope: "client",
        config: true,
        default: 33,
        type: Number
    });

    game.settings.register("always-centred", "maxzoom", {
        name: "Max zoom level",
        hint:"",
        scope: "client",
        config: true,
        default: 1,
        type: Number
    });

    game.settings.register("always-centred", "updatespeed", {
        name: "Camera animation speed",
        hint:"",
        scope: "client",
        config: true,
        default: 500,
        type: Number
    });

    game.settings.register("always-centred", "cleandisplay", {
        name: "Remove Display Unneeded Elements",
        hint:"",
        scope: "client",
        config: true,
        default: false,
        type: Boolean
    });
};