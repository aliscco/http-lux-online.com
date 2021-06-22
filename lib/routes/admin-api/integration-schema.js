'use strict';

const joi = require('@hapi/joi');

const strategySchema = joi.object().keys({
    provider: joi.string().required(),
    description: joi
        .string()
        .allow(null)
        .allow('')
        .optional(),
    parameters: joi
        .array()
        .optional()
        .items(
            joi.object().keys({
                name: joi.string().required(),
                value: joi.string().required(),
            }),
        ),
});

module.exports = strategySchema;
