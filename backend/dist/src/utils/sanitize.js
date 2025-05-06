"use strict";
// import * as fs from 'fs';
// import HttpError from '../middlewares/HttpError';
// import * as path from 'path';
// import { SANA_MODELS, modelConfigs, modelOptionsSchemas, SanaModelType, SanaOptions } from '../config/modelOptions';
// import { z } from 'zod'; // Assuming zod is used for schema validation
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitize = void 0;
const zod_1 = require("zod");
const modelOptions_1 = require("../config/modelOptions");
const HttpError_1 = __importDefault(require("../middlewares/HttpError"));
// /**
//  * Sanitizes the options provided in the request based on the SANA version
//  * @param requestOption - The options from the request, either as a string or object
//  * @param requestSanaVersion - The SANA version to use for validation
//  * @returns Sanitized options object
//  */
// const sanitize = async (
//     requestOption: string | Record<string, unknown>,
//     requestSanaVersion: SanaModelType,
// ): Promise<SanaOptions> => {
//     const options = typeof requestOption === 'string' ? JSON.parse(requestOption) : requestOption;
//     if (!SANA_MODELS.has(requestSanaVersion)) {
//         throw new HttpError('Invalid sana version specified in request');
//     }
//     const optionsSchema = modelOptionsSchemas[requestSanaVersion];
//     if (!optionsSchema) {
//         throw new HttpError(`No configuration schema found for version ${requestSanaVersion}`);
//     }
//     // console.log('options:', options);//TESTING
//     // console.log('optionsSchema:', optionsSchema);//TESTING
//     const sanitizedOptions = optionsSchema.parse(options);
//     // The following commented out code was present in the original file
//     // and has been preserved in the TypeScript version
//     /*
//   const getConfigPath = (sanaVersion: SanaVersions): string => {
//     const validVersions = new Set(["SANA1", "SANA1_1", "SANA2"]);
//     if (validVersions.has(sanaVersion)) {
//       return path.join(__dirname, "../config", `${sanaVersion}.json`);
//     } else {
//       throw new HttpError("Invalid sana version specified in request");
//     }
//   };
//   const configPath = getConfigPath(requestSanaVersion);
//   if (!fs.existsSync(configPath)) {
//     throw new HttpError("Config file not found.", 404);
//   }
//   const defaultOptionsInfo = JSON.parse(fs.readFileSync(configPath, "utf8"));
//   const defaultOptionsArray = [
//     ...defaultOptionsInfo.standard,
//     ...defaultOptionsInfo.advanced,
//   ];
//   const sanitizedOptions: Record<string, any> = {};
//   defaultOptionsArray.forEach(([key, type, defaultValue]: [string, string, any]) => {
//     if (!options[key]) {
//       sanitizedOptions[key] = type !== "checkbox" ? defaultValue : 0;
//     } else {
//       sanitizedOptions[key] = options[key];
//     }
//   });
//   for (const [key, value] of Object.entries(sanitizedOptions)) {
//     if (isNaN(value)) {
//       throw new HttpError(
//         "One or more of the selected options was invalid. Please try again.",
//         400
//       );
//     }
//     if (key === "t") {
//       if (value < 1 || value > 20) {
//         throw new HttpError(
//           "Running time must be an integer between 1 and 20, inclusive. Please try again.",
//           400
//         );
//       }
//     }
//   }
//   */
//     return sanitizedOptions;
// };
// export { sanitize };
/**
 * Sanitizes and validates options based on the SANA model version
 * @param options The options to sanitize
 * @param version The SANA model version
 * @returns Sanitized options
 */
const sanitize = async (options, version) => {
    try {
        // Get the appropriate schema for the model version
        const schema = modelOptions_1.modelOptionsSchemas[version];
        if (!schema) {
            throw new Error(`No schema found for version: ${version}`);
        }
        // Parse and validate the options using zod
        const validatedOptions = schema.parse(options);
        return validatedOptions;
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            // Format Zod validation errors for better readability
            const formattedErrors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
            throw new HttpError_1.default(`Invalid options: ${formattedErrors}`, { status: 400 });
        }
        throw error;
    }
};
exports.sanitize = sanitize;
//# sourceMappingURL=sanitize.js.map