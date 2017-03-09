const skipRoutes = (routes, middleware) =>
  (req, res, next) => routes.some(route => route === req.originalUrl) ?
    next()
    :
    middleware(req, res, next)

const getEmailFromSession = req => req.session.user && req.session.user.email || undefined;

module.exports = { skipRoutes, getEmailFromSession }
