import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
import { z } from "zod";

export const SANA_MODEL_NAMES = ['SANA1', 'SANA1_1', 'SANA2'] as const;
export type SanaModelType = typeof SANA_MODEL_NAMES[number];
export const SANA_MODELS: Set<SanaModelType> = new Set(SANA_MODEL_NAMES);

export function isSanaModelType(value: string): value is SanaModelType {
    return SANA_MODELS.has(value as SanaModelType);
}

export function isSana2Options(modelVersion: string, options: SanaOptions): options is Sana2Options {
    return modelVersion === 'SANA2';
}

export const SANA_LOCATIONS: Record<SanaModelType, string> = Object.freeze({
    SANA1: process.env.SANA_LOCATION_1_0 as string,
    SANA1_1: process.env.SANA_LOCATION_1_1 as string, 
    SANA2: process.env.SANA_LOCATION_2_0 as string
});

Object.entries(SANA_LOCATIONS).forEach(([model, location]) => {
    if (typeof location === 'undefined') {
        throw new Error(`SANA location for ${model} is not defined`);
    }
});

export const validateSanaVersion = (modelVersion: string): boolean => {
    if (!SANA_MODELS.has(modelVersion as SanaModelType)) {
        throw new Error(`Invalid SANA version: ${modelVersion}. Must be one of: ${SANA_MODEL_NAMES.join(', ')}`);
    }
    return true;
};

const sana1OptionsSchema = z.object({
    // model: z.literal('SANA1'),
    standard: z.object({
        t: z.number().min(1).max(60),
        s3: z.number(),
        ec: z.number(),
    }),
    // advanced: z.object({}),
});

const sana1_1OptionsSchema = z.object({
    // model: z.literal('SANA1_1'),
    standard: z.object({
        s3: z.number(),
        ec: z.number(),
        t: z.number().min(1).max(60),
    }),
    // advanced: z.object({}),
});

const sana2OptionsSchema = z.object({
    // model: z.literal('SANA2'),
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

// Infer types from schemas
export type Sana1Options = z.infer<typeof sana1OptionsSchema>;
export type Sana1_1Options = z.infer<typeof sana1_1OptionsSchema>;
export type Sana2Options = z.infer<typeof sana2OptionsSchema>;

export const modelOptionsSchemas = {
    SANA1: sana1OptionsSchema,
    SANA1_1: sana1_1OptionsSchema,
    SANA2: sana2OptionsSchema
} as const;

export type SanaOptions = Sana1Options | Sana1_1Options | Sana2Options;

// Define types for configuration options
type OptionType = 'text' | 'double' | 'dbl_vec' | 'str_vec';
type OptionValue = number | string | number[] | string[];
type OptionConfig = [string, OptionType, OptionValue, string, string];

interface ModelConfig {
    version: string;
    options: {
        standard: OptionConfig[];
        advanced: OptionConfig[];
    };
}

export const modelConfigs: Record<SanaModelType, ModelConfig> = {
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

interface ConfigType {
    MAX_ATTEMPTS: number;
    PREPROCESSED_DIR: string;
    CLEANUP_ON_COMPLETE: boolean;
}

export const CONFIG: Readonly<ConfigType> = Object.freeze({
    MAX_ATTEMPTS: 3,
    PREPROCESSED_DIR: './preprocessed',
    CLEANUP_ON_COMPLETE: process.env.CLEANUP_ON_COMPLETE === 'true',
});