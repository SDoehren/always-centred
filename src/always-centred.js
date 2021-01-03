// Import JavaScript modules.

import registerSettings from './module/settings';


/* ------------------------------------ */
/* Initialize module                    */
/* ------------------------------------ */
Hooks.once('init', async () => {
    console.log('always-centred | Initializing always-centred');
    registerSettings();

});

