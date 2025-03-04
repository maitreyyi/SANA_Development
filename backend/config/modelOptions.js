const { z } = require("zod");

const SANA_MODELS = Object.freeze({
    SANA1: 'SANA1',
    SANA1_1: 'SANA1_1',
    SANA2: 'SANA2'
});


const SANA_LOCATIONS = Object.freeze({
    [SANA_MODELS.SANA1]: process.env.SANA_LOCATION_1_0,
    [SANA_MODELS.SANA1_1]: process.env.SANA_LOCATION_1_1,
    [SANA_MODELS.SANA2]: process.env.SANA_LOCATION_2_0
});

Object.entries(SANA_LOCATIONS).forEach(([model, location]) => {
    if (typeof location === 'undefined') {
        throw new Error(`SANA location for ${model} is not defined`);
    }
});

const VALID_MODELS = new Set(Object.values(SANA_MODELS));

const validateSanaVersion = (modelVersion) => {
    if (!VALID_MODELS.has(modelVersion)) {
        throw new Error(`Invalid SANA version: ${modelVersion}. Must be one of: ${[...VALID_MODELS].join(', ')}`);
    }
    return true;
};

const sana1OptionsSchema = z.object({
    standard: z.object({
        t: z.number().min(1).max(60),
        s3: z.number(),
        ec: z.number(),
    }),
    // advanced: z.object({}),
});

const sana1_1OptionsSchema = z.object({
    standard: z.object({
        s3: z.number(),
        ec: z.number(),
        t: z.number().min(1).max(60),
    }),
    // advanced: z.object({}),
});

const sana2OptionsSchema = z.object({
    standard: z.object({
        s3: z.number().optional(),
        ec: z.number().optional(),
        ics: z.number().optional(),
        tolerance: z.number().optional(),
    }),
    advanced: z.object({
        esim: z.array(z.number()).optional(),
    }),
});

const modelOptionsSchemas = {
    SANA1: sana1OptionsSchema, 
    SANA1_1: sana1_1OptionsSchema,
    SANA2: sana2OptionsSchema
};

const modelConfigs = {
    SANA1: {
        version: "1.0",
        options: {
            standard: [
                [
                    "t",
                    "text",
                    3,
                    "Runtime in minutes",
                    "The number of minutes to run SANA. Must be an integer between 1 and 60, inclusive.",
                ],
                [
                    "s3",
                    "text",
                    0,
                    "S3 weight",
                    "The weight of the Symmetric Substructer Score in the objective function.",
                ],
                [
                    "ec",
                    "text",
                    1,
                    "EC weight",
                    "The weight of the Edge Coverage in the objective function.",
                ],
            ],
            advanced: [],
        },
    },
    SANA1_1: {
        version: "1.1",
        options: {
            standard: [
                [
                    "s3",
                    "text",
                    0,
                    "S3 weight",
                    "The weight of the Symmetric Substructer Score in the objective function.",
                ],
                [
                    "ec",
                    "text",
                    1,
                    "EC weight",
                    "The weight of the Edge Coverage in the objective function.",
                ],
                [
                    "t",
                    "text",
                    3,
                    "Runtime in minutes",
                    "The number of minutes to run SANA. Must be an integer between 1 and 60, inclusive.",
                ],
            ],
            advanced: [],
        },
    },
    SANA2: {
        version: "2.0",
        options: {
            standard: [
                [
                    "s3",
                    "text",
                    0,
                    "S3 weight",
                    "The weight of the Symmetric Substructer Score in the objective function.",
                ],
                [
                    "ec",
                    "text",
                    1,
                    "EC weight",
                    "The weight of the Edge Coverage in the objective function.",
                ],
                [
                    "ics",
                    "double",
                    0,
                    "Weight of ICS",
                    "The weight of the Induced Conserved Structure in the objective function.",
                ],
                [
                    "tolerance",
                    "double",
                    0.1,
                    "Target tolerance for optimal objective",
                    "Attempt to optimize the final value of the objective to within this tolerance of the optimal solution.",
                ],
            ],
            advanced: [
                [
                    "esim",
                    "dbl_vec",
                    0,
                    "External Similarity Weights",
                    "An integer followed by that many weights, specifying objective function weights for external similarity files.",
                ],
                [
                    "simFile",
                    "str_vec",
                    0,
                    "External Similarity Filenames",
                    "An integer followed by that many filesnames, specifying external three-column similarities.",
                ],
            ],
        },
    },
};

const CONFIG = Object.freeze({
    MAX_ATTEMPTS: 3,
    PREPROCESSED_DIR: './preprocessed',
    CLEANUP_ON_COMPLETE: process.env.CLEANUP_ON_COMPLETE === 'true',
});

module.exports = {
    // optionsSana1Schema,
    // optionsSana1_1Schema,
    // optionsSana2Schema,
    SANA_MODELS,
    SANA_LOCATIONS,
    VALID_MODELS,
    modelOptionsSchemas,
    modelConfigs,
    CONFIG,
    validateSanaVersion
};
