// src/middlewares/errorHandler.js

function errorHandler(err, req, res, next) {
  // Log the full technical error details to your terminal console for debugging
  console.error("GLOBAL EXCEPTION CAUGHT:", err.message || err);

  // 1. Intercept Prisma Database specific crashes cleanly
  if (err.code && err.code.startsWith('P')) {
    return res.status(400).json({
      error: "Database Constraint Violation",
      details: "The requested database transaction could not be executed safely."
    });
  }

  // 2. Intercept JSON parsing or syntax errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: "Malformed JSON payload sent to server." });
  }

  // 3. Fallback generic server response for any unhandled exceptions
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.name || "InternalServerError",
    message: err.message || "An unexpected system anomaly occurred on our backend server."
  });
}

function errorHandler(err, req, res, next) {
  // Always log the full technical details to private terminal console
  console.error(err);

  if (process.env.NODE_ENV === 'production') {
    // Safe public message for real users
    res.status(500).json({ error: "InternalServerError", message: "Something went wrong on our end." });
  } else {
    // Full raw developer error data for local testing
    res.status(500).json({ error: err.message, stack: err.stack });
  }
}


module.exports = errorHandler;
