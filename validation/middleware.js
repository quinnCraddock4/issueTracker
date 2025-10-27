import debug from 'debug';

const debugValidation = debug('app:Validation');

export const validate = (schema, source = 'body') => {
    return (req, res, next) => {
        const dataToValidate = req[source];
        const { error, value } = schema.validate(dataToValidate, { abortEarly: false });

        if (error) {
            debugValidation(`Validation error for ${source}:`, error.details);
            return res.status(400).json({ error });
        }

        req[source] = value;
        next();
    };
};

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
