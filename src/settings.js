



export const registerSettings = function () {

    game.settings.register("always-centred", "mode", {
        name: "Mode:",
        hint:"Disabled: Module off (default) | Party View: all player owned tokens | Selected Token: only the selected token.",
        scope: "client",
        config: true,
        default: "disabled",
        type: String,
        choices: {disabled: "Disabled", pcs: "Party View", selectedtoken: "Selected Token"},
    });

    game.settings.register("always-centred", "autozoom", {
        name: "Auto Zoom",
        hint:"Adjust zoom as well as position. Highly Recommended.",
        scope: "client",
        config: true,
        default: true,
        type: Boolean
    });

    game.settings.register("always-centred", "mitigatebounce", {
        name: "Mitigate Bouncing Issue",
        hint:"Only relevant when Auto Zoom is set to off and Mode is Party View. Forces Auto Zoom when required.",
        scope: "world",
        config: true,
        default: true,
        type: Boolean
    });

    game.settings.register("always-centred", "paddingsq", {
        name: "Padding (squares)",
        hint:"Padding added to view area in all directions. Highly Recommended to be set to >2 and will have no effect <1.",
        scope: "client",
        config: true,
        default: 12,
        type: Number
    });

    game.settings.register("always-centred", "paddingper", {
        name: "Padding (%)",
        hint:"Percentage increase of view area",
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

    game.settings.register("always-centred", "includeinvisible", {
        name: "Include Invisible",
        hint: "Whether to account for tokens that can't be seen by the user in the party view calculations.",
        scope: "world",
        config: true,
        default: false,
        type: Boolean
    });

    game.settings.register("always-centred", "Debug", {
        name: "Debug",
        hint:"",
        scope: "client",
        config: true,
        default: true,
        type: Boolean
    });


    game.settings.register("always-centred", "DMControl", {
        name: "DM Control all?",
        hint:"Allows the DM to control player centring",
        scope: "world",
        config: true,
        default: false,
        type: Boolean
    });


};