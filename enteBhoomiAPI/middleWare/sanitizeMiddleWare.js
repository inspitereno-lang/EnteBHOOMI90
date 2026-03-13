/**
 * Custom middleware to sanitize Mongoose/MongoDB query objects.
 * Prevents NoSQL Injection by removing keys starting with '$' or containing '.'
 * Compatible with Express 5 (doesn't reassign req properties).
 */
const sanitizeObject = (obj) => {
    if (obj instanceof Object) {
        for (const key in obj) {
            if (key.startsWith('$') || key.includes('.')) {
                delete obj[key];
            } else if (obj[key] instanceof Object) {
                sanitizeObject(obj[key]);
            }
        }
    }
};

const mongoSanitize = (req, res, next) => {
    if (!req) return next();
    if (req.body) sanitizeObject(req.body);
    if (req.query) sanitizeObject(req.query);
    if (req.params) sanitizeObject(req.params);
    next();
};

export default mongoSanitize;
