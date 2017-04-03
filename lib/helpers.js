/* eslint-disable */

const { whitelistRoutes } = require('../config/main');

/* req.path is undefined if request does not originate from express app,
therefore external source route is never matched against given array */
const excludesRequestRoute = routes => req => !routes.some(route => req.path && req.path === route)

const intercept = (predicate, middleware) =>
  (req, res, next) => {
    return predicate(req) ?
      middleware(req, res, next)
      :
      next()
    }

const isNotWhitelisted = excludesRequestRoute(whitelistRoutes)
const skipWhitelistedRoutes = (middleware) => intercept(isNotWhitelisted, middleware)

const getEmailFromSession = req => req.session.user && req.session.user.email || undefined

module.exports = { excludesRequestRoute, skipWhitelistedRoutes, intercept, getEmailFromSession }
