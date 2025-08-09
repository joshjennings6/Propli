const jwt = require('jsonwebtoken');

/**
 * Middleware to authenticate requests using a JWT token.
 * Requires the Authorization header in the form 'Bearer <token>'.
 * If valid, attaches decoded payload to req.user.
 */
module.exports = function(req, res, next) {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json({ error: 'Missing authorization header' });
  }
  const token = header.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
