export const requestLogger = (req, res, next) => {
  const start = Date.now();
  const originalEnd = res.end;

  res.end = function (...args) {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const method = req.method;
    const url = req.originalUrl || req.url;

    // Filter out internal noisy health pings if desired
    if (!url.includes('/health')) {
      const statusColor = statusCode >= 500 ? '🔴' : statusCode >= 400 ? '🟡' : '🟢';
      console.log(
        `[HUD-TELEMETRY] ${statusColor} [${method}] ${url} -> ${statusCode} (${duration}ms)`
      );
    }

    return originalEnd.apply(this, args);
  };

  next();
};
