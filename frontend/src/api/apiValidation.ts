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


export const RedirectResponseSchema = z.object({
    status: z.literal('redirect'), 
    message: z.string(),
    redirect: z.string(), 
});

export type RedirectResponse = z.infer<typeof RedirectResponseSchema>;

export const isRedirectResponse = (data: unknown): data is RedirectResponse => {
    return RedirectResponseSchema.safeParse(data).success;
};

// START of processing jobs 
// ProcessJobData
export const ProcessJobDataSchema = z.object({
    success: z.boolean(),
    status: z.string(),
    jobId: z.string(),
    execLogFileOutput: z.string().optional(),
    redirect: z.string().optional(),
    note: z.string().optional(),
    zipDownloadUrl: z.string().optional(),
});
export const ProcessSuccessResponseSchema = z.object({
    status: z.literal('success'), 
    message: z.string(),
    data: ProcessJobDataSchema, // Use the nested schema here
    // redirect here maybe include? // redirect: z.string().optional(),
});
// UnifiedResponse<ProcessJobData> 
export const ProcessResponseSchema = z.discriminatedUnion("status", [
    ProcessSuccessResponseSchema, 
    RedirectResponseSchema, 
]);
export type ProcessJobData = z.infer<typeof ProcessJobDataSchema>;
export type ProcessSuccessResponse = z.infer<typeof ProcessSuccessResponseSchema>;
export type ProcessJobResponse = z.infer<typeof ProcessResponseSchema>;

// Type guards for processing jobs
export const isProcessJobData = (data: unknown): data is ProcessJobData => {
    return ProcessJobDataSchema.safeParse(data).success;
};

export const isProcessSuccessResponse = (data: unknown): data is ProcessSuccessResponse => {
    return ProcessSuccessResponseSchema.safeParse(data).success;
};

export const isProcessResponse = (data: unknown): data is ProcessJobResponse => {
    return ProcessResponseSchema.safeParse(data).success;
};
// END of processing jobs


// START of getting jobs
export const ProcessedJobsDataSchema = z.object({
    jobId: z.string(),
    note: z.string(),
    zipDownloadUrl: z.string(),
    execLogFileOutput: z.string(),
});
export const GetJobResultSuccessResponseSchema = z.object({
    status: z.literal('success'), 
    message: z.string(),
    data: ProcessedJobsDataSchema, 
    // redirect here maybe include? //x redirect: z.string().optional(),
});
// UnifiedResponse<ProcessedJobData> 
export const GetJobResultSchema = z.discriminatedUnion('status', [
    GetJobResultSuccessResponseSchema,
    RedirectResponseSchema,
]);

export type ProcessedJobsData = z.infer<typeof ProcessedJobsDataSchema>;
export type GetJobResultSuccessResponse = z.infer<typeof GetJobResultSuccessResponseSchema>;
export type GetJobResultResponse = z.infer<typeof GetJobResultSchema>;

// Type guards for getting jobs
export const isProcessedJobsData = (data: unknown): data is ProcessedJobsData => {
    return ProcessedJobsDataSchema.safeParse(data).success;
};

export const isGetJobResultSuccessResponse = (data: unknown): data is GetJobResultSuccessResponse => {
    return GetJobResultSuccessResponseSchema.safeParse(data).success;
};

export const isGetJobResultResponse = (data: unknown): data is GetJobResultResponse => {
    return GetJobResultSchema.safeParse(data).success;
};
// END of getting jobs


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
export type ErrorMessageResponse = z.infer<typeof ErrorMessageResponseSchema>; // delete later
export type FailedJobResponse = z.infer<typeof FailedJobResponseSchema>; // delete later
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
