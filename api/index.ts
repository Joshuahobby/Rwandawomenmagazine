console.log(`[${new Date().toISOString()}] API Entry: Starting up...`);
try {
    console.log(`[${new Date().toISOString()}] API Entry: Importing app...`);
    const app = require('../server/app').default;
    console.log(`[${new Date().toISOString()}] API Entry: App imported successfully`);

    module.exports = app;
} catch (error) {
    console.error(`[${new Date().toISOString()}] API Entry: FATAL ERROR DURING STARTUP`);
    console.error(error);
    throw error;
}
