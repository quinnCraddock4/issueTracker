import debug from 'debug';

const debugValidation = debug('app:Validation');

/**
 * Middleware to validate request body against a Joi schema
 * @param {Object} schema - Joi schema to validate against
 * @param {string} source - Source of data to validate ('body', 'params', 'query')
 * @returns {Function} Express middleware function
 */
export const validate = (schema, source = 'body') => {
    return (req, res, next) => {
        const dataToValidate = req[source];
        const { error, value } = schema.validate(dataToValidate, { abortEarly: false });

        if (error) {
            debugValidation(`Validation error for ${source}:`, error.details);
            return res.status(400).json({ error });
        }

        // Replace the original data with the validated and sanitized data
        req[source] = value;
        next();
    };
};

/**
 * Middleware to validate ObjectId parameters
 * @param {string} paramName - Name of the parameter to validate
 * @returns {Function} Express middleware function
 */
export const validateObjectId = (paramName) => {
    return (req, res, next) => {
        const paramValue = req.params[paramName];
        const objectIdPattern = /^[0-9a-fA-F]{24}$/;

        if (!objectIdPattern.test(paramValue)) {
            debugValidation(`Invalid ObjectId for ${paramName}: ${paramValue}`);
            return res.status(404).json({ error: `${paramName} ${paramValue} is not a valid ObjectId.` });
        }

        next();
    };
};
