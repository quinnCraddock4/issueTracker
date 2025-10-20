import Joi from 'joi';

// Common validation schemas
export const objectIdSchema = Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required();

// User validation schemas
export const registerUserSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    givenName: Joi.string().required(),
    familyName: Joi.string().required(),
    role: Joi.string().valid('admin', 'user', 'developer', 'manager', 'tester').required()
});

export const loginUserSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

export const updateUserSchema = Joi.object({
    password: Joi.string().min(6).optional(),
    fullName: Joi.string().optional(),
    givenName: Joi.string().optional(),
    familyName: Joi.string().optional(),
    role: Joi.string().valid('admin', 'user', 'developer', 'manager', 'tester').optional()
}).min(1);

// Bug validation schemas
export const createBugSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    stepsToReproduce: Joi.string().required()
});

export const updateBugSchema = Joi.object({
    title: Joi.string().optional(),
    description: Joi.string().optional(),
    stepsToReproduce: Joi.string().optional()
}).min(1);

export const classifyBugSchema = Joi.object({
    classification: Joi.string().valid('unclassified', 'bug', 'feature', 'enhancement', 'documentation').required()
});

export const assignBugSchema = Joi.object({
    assignedToUserId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
    assignedToUserName: Joi.string().required()
});

export const closeBugSchema = Joi.object({
    closed: Joi.boolean().required()
});

// Comment validation schemas
export const createCommentSchema = Joi.object({
    author: Joi.string().required(),
    content: Joi.string().required()
});

// Test case validation schemas
export const createTestSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    expectedResult: Joi.string().required()
});

export const updateTestSchema = Joi.object({
    status: Joi.string().valid('passed', 'failed').required()
});
