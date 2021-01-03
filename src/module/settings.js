/* global game */

export default () => {
  game.settings.register("always-centred", "alwayscenter", {
        name: "Centre View Continuously?",
        scope: "client",
        config: true,
        default: false,
        type: Boolean
    });

    game.settings.register("always-centred", "maxzoom", {
        name: "max zoom level?",
        scope: "client",
        config: true,
        default: 1,
        type: Number
    });

    game.settings.register("always-centred", "updatespeed", {
        name: "update speed",
        scope: "client",
        config: true,
        default: 500,
        type: Number
    });
};