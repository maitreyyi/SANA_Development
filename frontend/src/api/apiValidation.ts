import { z } from "zod";

// Define Zod schemas for API responses
export const ErrorResponseSchema = z.object({
    message: z.string(),
    error: z.literal(true),
    errorLog: z.string(),
    data: z.any().optional(),
    stackTrace: z.string().optional(),
});

export const SubmitJobResponseSchema = z.object({
    redirect: z.string().startsWith("/submit-job/"),
});


export const ContactResponseSchema = z.object({
    success: z.boolean(),
    message: z.string(),
});

export const JobResultsResponseSchema = z.object({
    message: z.string(),
    jobId: z.string(),
    note: z.string(),
    zipDownloadUrl: z.string(),
    execLogFileOutput: z.string(),
    redirect: z.string().optional(), //TESTING
    error: z.string().optional(), //TESTING
    errorLog: z.string().optional(), //TESTING
});

export const JobRedirectResponseSchema = z.object({
    redirect: z.string(),
});

// export const ProcessJobResponseSchema = z.object({
//     success: z.boolean(),
//     status: z.string(), // Or a more specific enum if you know the possible values
//     redirect: z.string().optional(),
//     execLogFileOutput: z.string().optional(),
//     message: z.string().optional(), //TESTING
//     error: z.string().optional(), //TESTING
//     errorLog: z.string().optional(), //TESTING
// });
export const ProcessSuccessResponseSchema = z.object({
    success: z.boolean(),
    status: z.string(),
    execLogFileOutput: z.string().optional(),
    message: z.string().optional(),
});

// Create a union type for ProcessJobResponseSchema
export const ProcessJobResponseSchema = z.union([
    ProcessSuccessResponseSchema,
    JobRedirectResponseSchema,
    ErrorResponseSchema,
]);

export const ErrorMessageResponseSchema = z.object({
    id: z.string(),
    status: z.enum(["error"]),
    message: z.string(),
});

export const FailedJobResponseSchema = z.object({
    id: z.string(),
    status: z.enum(["failed"]),
    error: z.string(),
});

export const GetJobResultResponseSchema = z.union([
    JobResultsResponseSchema,
    JobRedirectResponseSchema,
    ErrorResponseSchema, 
]);

export const LookupJobSuccessSchema = z.object({
    status: z.enum(['preprocessed', 'processing', 'processed', 'failed']),
    zip_name: z.string().optional(),
    error_log: z.string().optional(),
    exec_log: z.string().optional()
});

export const LookupJobSchema = z.union([
    LookupJobSuccessSchema,
    ErrorResponseSchema,
]);

// Define TypeScript types from Zod schemas
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type SubmitJobResponse = z.infer<typeof SubmitJobResponseSchema>;
export type ContactResponse = z.infer<typeof ContactResponseSchema>;
export type JobResultsResponse = z.infer<typeof JobResultsResponseSchema>;
export type JobRedirectResponse = z.infer<typeof JobRedirectResponseSchema>;
// export type ProcessJobResponse = z.infer<typeof ProcessJobResponseSchema>;
export type ErrorMessageResponse = z.infer<typeof ErrorMessageResponseSchema>;
export type FailedJobResponse = z.infer<typeof FailedJobResponseSchema>;
export type GetJobResultResponse = z.infer<typeof GetJobResultResponseSchema>;

export type ProcessSuccessResponse = z.infer<typeof ProcessSuccessResponseSchema>;
export type ProcessJobResponse = z.infer<typeof ProcessJobResponseSchema>;


export type LookupJobSuccessResponse = z.infer<typeof LookupJobSuccessSchema>;
export type LookupJobResponse = z.infer<typeof LookupJobSchema>;




// Type guard functions
export const isErrorResponse = (data: unknown): data is ErrorResponse => {
    return ErrorResponseSchema.safeParse(data).success;
};

export const isSubmitJobResponse = (
    data: unknown
): data is SubmitJobResponse => {
    return SubmitJobResponseSchema.safeParse(data).success;
};

export const isContactResponse = (data: unknown): data is ContactResponse => {
    return ContactResponseSchema.safeParse(data).success;
};

export const isJobResultsResponse = (
    data: unknown
): data is JobResultsResponse => {
    return JobResultsResponseSchema.safeParse(data).success;
};

export const isJobRedirectResponse = (
    data: unknown
): data is JobRedirectResponse => {
    return JobRedirectResponseSchema.safeParse(data).success;
};

// export const isProcessJobResponse = (
//     data: unknown
// ): data is ProcessJobResponse => {
//     return ProcessJobResponseSchema.safeParse(data).success;
// };

export const isProcessJobResponse = (
    data: unknown
): data is ProcessJobResponse => {
    return ProcessJobResponseSchema.safeParse(data).success;
};

export const isErrorMessageResponse = (
    data: unknown
): data is ErrorMessageResponse => {
    return ErrorMessageResponseSchema.safeParse(data).success;
};

export const isFailedJobResponse = (
    data: unknown
): data is FailedJobResponse => {
    return FailedJobResponseSchema.safeParse(data).success;
};

export const isLookupJobResponse = (data: unknown): data is LookupJobResponse => {
    return LookupJobSchema.safeParse(data).success;
};

// API request options type
export interface ApiOptions extends RequestInit {
    headers?: Record<string, string>;
}

export interface ContactFormData {
    name: string;
    email: string;
    message: string;
}
