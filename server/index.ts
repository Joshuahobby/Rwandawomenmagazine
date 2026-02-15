import app from './app';
import { env } from './config/env';

// Start server
app.listen(env.PORT, () => {
    console.log(`\n🚀 Rwanda Women Magazine API running on http://localhost:${env.PORT}`);
    console.log(`   Health check: http://localhost:${env.PORT}/api/health\n`);
});
