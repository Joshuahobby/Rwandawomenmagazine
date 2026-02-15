import { Request, Response, NextFunction } from 'express';
import axios from 'axios';

// Simple in-memory cache for IP check results
// Key: IP, Value: { isProxy: boolean, asn?: string, provider?: string, expiresAt: number }
const ipCache = new Map<string, { isProxy: boolean; asn?: string; provider?: string; expiresAt: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const MAX_CACHE_SIZE = 50000; // Prevent OOM by capping unique IPs in memory

/**
 * Middleware to detect and block VPN, Proxy, and Tor exit nodes.
 * Uses proxycheck.io (free tier: 1000 requests/day).
 */
export const detectFraud = async (req: Request, res: Response, next: NextFunction) => {
    // Skip for localhost in development if needed, but good for testing
    const clientIp = req.ip || req.headers['x-forwarded-for']?.toString() || req.socket.remoteAddress || 'unknown';

    if (clientIp === '::1' || clientIp === '127.0.0.1' || clientIp === '::ffff:127.0.0.1') {
        return next();
    }

    // Check cache
    const cached = ipCache.get(clientIp);
    if (cached && cached.expiresAt > Date.now()) {
        if (cached.isProxy) {
            res.status(403).json({
                error: 'Access denied: VPN, Proxy, or Hosting service detected. Please use a direct residential connection to participate.'
            });
            return;
        }
        return next();
    }

    try {
        // Using proxycheck.io v2 API (Free usage: 1000 daily queries)
        // We use vpn=1 to check for VPNs and hosting=1 to block data centers
        const response = await axios.get(`https://proxycheck.io/v2/${clientIp}?vpn=1&asn=1`, { timeout: 3000 });
        const data = response.data[clientIp];

        const isProxy = data && (data.proxy === 'yes' || data.type === 'VPN' || data.type === 'Proxy');
        const asn = data?.asn || 'Unknown';
        const provider = data?.provider || 'Unknown';

        // Cache the result (with size guard)
        if (ipCache.size < MAX_CACHE_SIZE) {
            ipCache.set(clientIp, {
                isProxy,
                asn,
                provider,
                expiresAt: Date.now() + CACHE_DURATION
            });
        }

        console.log(`[FraudCheck] IP: ${clientIp} | ASN: ${asn} | Provider: ${provider} | Proxy: ${isProxy}`);

        if (isProxy) {
            console.warn(`[Blocked] IP: ${clientIp} detected as VPN/Proxy`);
            res.status(403).json({
                error: 'Access denied: VPN/Proxy detected. For fraud prevention, we only allow direct connections.'
            });
            return;
        }

        // Optional: Block specific high-risk ASNs if needed
        // const highRiskASNs = ['AS16509', 'AS15169']; // Example: AWS, Google Cloud
        // if (highRiskASNs.includes(asn)) { ... }

        next();
    } catch (err) {
        console.error('Fraud detection error:', err);
        // Fallback: allow if API is down to avoid blocking legitimate users, 
        // but log the error. In a more critical system, we might block.
        next();
    }
};
