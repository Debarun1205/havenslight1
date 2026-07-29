/**
 * Wraps an async Express handler so any thrown error (including a rejected
 * promise, e.g. a Mongoose validation error) is passed to next(), reaching
 * the global error handler instead of crashing the process or hanging the
 * request. Every controller across every feature module uses this.
 */
function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
