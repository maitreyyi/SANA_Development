import { Request } from 'express';
import { SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';
import { SanaModelType, SanaOptions } from '../src/config/modelOptions';

declare global {
    namespace Express {
        interface Request {
            supabase?: SupabaseClient;
            user?: SupabaseUser;
            userProfile?: UserRecord; 
        }
    }
}
// request types
export type MulterFile = Express.Multer.File;

export interface UploadedFiles {
    files: MulterFile[];
    similarityFiles?: MulterFile[];
}


export interface SubmitJobRequest extends Request{
    body: {
        options: string | SanaOptions; 
        version: SanaModelType;
    };
}

export interface ProcessJobRequest extends Request{
    body: {
        id?: string;
    };
}

export interface DownloadZipRequest extends ProcessJobRequest{};
export interface GetJobResultsRequest extends ProcessJobRequest{};

// // response types

export interface ErrorDetails<T = undefined> {
    message: string;
    errorLog?: string;
    stackTrace?: string;
    data?: T;
}

export interface UnifiedResponse<T = undefined, E = undefined> {
    status: 'success' | 'error' | 'redirect';
    message: string;
    data?: T;
    error?: ErrorDetails<E>;
    redirect?: string;
}

export type JobStatus = 'preprocessing' | 'processing' | 'processed' | 'failed';
// type JobStatus = 'pending' | 'preprocessed' | 'processing' | 'completed' | 'failed';

export type JobData = {
    // identifiers
    id: string;
    status: JobStatus;
    modelVersion: string;
    // file info
    network1Name: string;
    network2Name: string;
    extension: string;
    jobLocation: string;
    // processing details
    attempts: number;
    result?: any;
    error?: string;
    // timestamps
    createdAt: Date;
    updatedAt: Date;
};

// export interface JobResponse extends SuccessResponse<JobData> {}
// export interface ProcessSuccessResponse extends SuccessResponse<never>{}


// interface ProcessResponse {
//     success: boolean;
//     status: string;
//     redirect?: string;
//     execLogFileOutput?: string;
// }


// interface ProcessedJobResponse {
//     message: string;
//     jobId: string;
//     note: string;
//     zipDownloadUrl: string;
//     execLogFileOutput: string;
// }

// // Process response type
// export interface ProcessResponse extends ResponseBase {
//     success: boolean;
//     status: string;
//     redirect?: string;
//     execLogFileOutput?: string;
//   }
  
//   // Fully processed job response
//   export interface ProcessedJobResponse extends SuccessResponse<{
//     jobId: string;
//     note: string;
//     zipDownloadUrl: string;
//     execLogFileOutput: string;
//   }> {}

// Process response types


export interface JobInfoFile {
    status: JobStatus; 
    data: JobData; 
    options: SanaOptions; 
    version: SanaModelType;
};

export interface SuccessJobInfoFile{
    status: 'processed';
    zipName: string;
    command: string;
};

export interface FailedJobInfoFile {
    status: 'failed';
    log: string;
    command: string;
};


export interface ProcessJobData {
    success: boolean;
    status: string;
    jobId: string;
    execLogFileOutput?: string;
    redirect?: string;

    // maybe
    note?: string;
    zipDownloadUrl?: string;
}

export interface ProcessedJobResponse {
    jobId: string;
    note: string;
    zipDownloadUrl: string;
    execLogFileOutput?: string;
};

// AUTH TYPES
// export interface User {
//     id: number;
//     google_id: string | null;
//     email: string;
//     first_name: string | null;
//     last_name: string | null;
//     hashed_password: string | null;
//     api_key: string;
// }

export interface UserRecord {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    api_key: string;
    created_at: string;
}

export interface InsertUser {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
}

export interface DbInsertUser extends InsertUser {
    api_key: string;
};

export type PublicUser = Omit<UserRecord, 'api_key' | 'created_at'>;


// API key response type (for secure routes)
export interface ApiKeyResponse {
    api_key: string;
}

// Update payload type
export interface UserUpdateBody {
    first_name?: string;
    last_name?: string;
    email?: string;
}

// Response types
export interface AuthResponse {
    status: 'success' | 'error';
    data?: {
        user: PublicUser;
    };
    error?: {
        message: string;
    };
}

export interface ApiKeyAuthResponse {
    status: 'success' | 'error';
    data?: {
        api_key: string;
    };
    error?: {
        message: string;
    };
}
