let app;
try {
    const appModule = require('../server/app');
    app = appModule.default || appModule;
} catch (error) {
    console.error("FATAL ERROR DURING STARTUP:", error);
    // Provide a fallback app that returns the error to the client
    app = require('express')();
    app.all('(.*)', (req, res) => {
        res.status(500).json({
            error: "FUNCTION_INVOCATION_FAILED details",
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        });
    });
}

export default app;
