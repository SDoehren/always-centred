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
        name: "max zoom level?",
        scope: "client",
        config: true,
        default: 1,
        type: Number
    });

});

