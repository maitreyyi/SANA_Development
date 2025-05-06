"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONFIG = exports.modelConfigs = exports.modelOptionsSchemas = exports.validateSanaVersion = exports.SANA_LOCATIONS = exports.SANA_MODELS = exports.SANA_MODEL_NAMES = void 0;
exports.isSanaModelType = isSanaModelType;
exports.isSana2Options = isSana2Options;
const zod_1 = require("zod");
exports.SANA_MODEL_NAMES = ['SANA1', 'SANA1_1', 'SANA2'];
exports.SANA_MODELS = new Set(exports.SANA_MODEL_NAMES);
function isSanaModelType(value) {
    return exports.SANA_MODELS.has(value);
}
function isSana2Options(modelVersion, options) {
    return modelVersion === 'SANA2' && typeof options === "object";
}
exports.SANA_LOCATIONS = Object.freeze({
    SANA1: process.env.SANA_LOCATION_1_0,
    SANA1_1: process.env.SANA_LOCATION_1_1,
    SANA2: process.env.SANA_LOCATION_2_0,
});
Object.entries(exports.SANA_LOCATIONS).forEach(([model, location]) => {
    if (typeof location === 'undefined') {
        throw new Error(`SANA location for ${model} is not defined`);
    }
});
const validateSanaVersion = (modelVersion) => {
    if (!exports.SANA_MODELS.has(modelVersion)) {
        throw new Error(`Invalid SANA version: ${modelVersion}. Must be one of: ${exports.SANA_MODEL_NAMES.join(', ')}`);
    }
    return true;
};
exports.validateSanaVersion = validateSanaVersion;
const sana1OptionsSchema = zod_1.z.object({
    // model: z.literal('SANA1'),
    standard: zod_1.z.object({
        t: zod_1.z.number().min(1).max(60),
        s3: zod_1.z.number(),
        ec: zod_1.z.number(),
    }),
    // advanced: z.object({}),
});
const sana1_1OptionsSchema = zod_1.z.object({
    // model: z.literal('SANA1_1'),
    standard: zod_1.z.object({
        s3: zod_1.z.number(),
        ec: zod_1.z.number(),
        t: zod_1.z.number().min(1).max(60),
    }),
    // advanced: z.object({}),
});
const sana2OptionsSchema = zod_1.z.object({
    // model: z.literal('SANA2'),
    standard: zod_1.z.object({
        s3: zod_1.z.number().optional(),
        ec: zod_1.z.number().optional(),
        ics: zod_1.z.number().optional(),
        tolerance: zod_1.z.number().optional(),
    }),
    advanced: zod_1.z.object({
        esim: zod_1.z.array(zod_1.z.number()).optional(),
    }),
});
exports.modelOptionsSchemas = {
    SANA1: sana1OptionsSchema,
    SANA1_1: sana1_1OptionsSchema,
    SANA2: sana2OptionsSchema,
};
exports.modelConfigs = {
    SANA1: {
        version: '1.0',
        options: {
            standard: [
                [
                    't',
                    'text',
                    3,
                    'Runtime in minutes',
                    'The number of minutes to run SANA. Must be an integer between 1 and 60, inclusive.',
                ],
                [
                    's3',
                    'text',
                    0,
                    'S3 weight',
                    'The weight of the Symmetric Substructer Score in the objective function.',
                ],
                [
                    'ec',
                    'text',
                    1,
                    'EC weight',
                    'The weight of the Edge Coverage in the objective function.',
                ],
            ],
            advanced: [],
        },
    },
    SANA1_1: {
        version: '1.1',
        options: {
            standard: [
                [
                    's3',
                    'text',
                    0,
                    'S3 weight',
                    'The weight of the Symmetric Substructer Score in the objective function.',
                ],
                [
                    'ec',
                    'text',
                    1,
                    'EC weight',
                    'The weight of the Edge Coverage in the objective function.',
                ],
                [
                    't',
                    'text',
                    3,
                    'Runtime in minutes',
                    'The number of minutes to run SANA. Must be an integer between 1 and 60, inclusive.',
                ],
            ],
            advanced: [],
        },
    },
    SANA2: {
        version: '2.0',
        options: {
            standard: [
                [
                    's3',
                    'text',
                    0,
                    'S3 weight',
                    'The weight of the Symmetric Substructer Score in the objective function.',
                ],
                [
                    'ec',
                    'text',
                    1,
                    'EC weight',
                    'The weight of the Edge Coverage in the objective function.',
                ],
                [
                    'ics',
                    'double',
                    0,
                    'Weight of ICS',
                    'The weight of the Induced Conserved Structure in the objective function.',
                ],
                [
                    'tolerance',
                    'double',
                    0.1,
                    'Target tolerance for optimal objective',
                    'Attempt to optimize the final value of the objective to within this tolerance of the optimal solution.',
                ],
            ],
            advanced: [
                [
                    'esim',
                    'dbl_vec',
                    0,
                    'External Similarity Weights',
                    'An integer followed by that many weights, specifying objective function weights for external similarity files.',
                ],
                [
                    'simFile',
                    'str_vec',
                    0,
                    'External Similarity Filenames',
                    'An integer followed by that many filesnames, specifying external three-column similarities.',
                ],
            ],
        },
    },
};
exports.CONFIG = Object.freeze({
    MAX_ATTEMPTS: 3,
    PREPROCESSED_DIR: './preprocessed',
    CLEANUP_ON_COMPLETE: process.env.CLEANUP_ON_COMPLETE === 'true',
});
//# sourceMappingURL=modelOptions.js.map