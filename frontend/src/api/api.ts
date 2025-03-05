import { z } from 'zod';
import { 
    SubmitJobResponse, ContactResponse, ProcessJobResponse,
    GetJobResultResponse,
    ApiOptions, ContactFormData, ErrorResponseSchema,
    ContactResponseSchema,
    ProcessJobResponseSchema,
    SubmitJobResponseSchema,
    GetJobResultResponseSchema
  } from './apiValidation';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
console.log(API_URL);


// type ApiOptions = {
//     headers?: Record<string, string>;
//     method?: string;
//     body?: string | FormData;
// };
// type ErrorResponse = {
//     success: false;
//     message: string;
// };

// type ErrorMessageResponse = {
//     success: false;
//     status: 'error';
//     message: string;
// };

// // Contact related types
// type ContactFormData = {
//     name: string;
//     email: string;
//     subject: string | null;
//     message: string;
// };

// type ContactResponse = {
//     success: boolean;
//     message: string;
// };

// // // Job related types
// // type JobOptions = {
// //     runtimeInMinutes: number;
// //     s3Weight: number;
// //     ecWeight: number;
// // };

// type SubmitJobResponse = {
//     redirect: string; // Format: `/submit-job/${jobId}`
// }

// type ProcessedJobResponse = {
//     success: true;
//     status: 'completed';
//     result: {
//         [key: string]: string; // might change
//     };
// };

// type FailedJobResponse = {
//     success: false;
//     status: 'failed';
//     error: string;
// };

// // type guards
// function isErrorResponse(response: SubmitJobResponse | ErrorResponse): response is ErrorResponse {
//     return 'message' in response;
// }

// // const apiRequest = async<T extends object | ErrorResponse>(
// //     endpoint: string, 
// //     options: ApiOptions = {}, 
// //     hasMultipart:boolean = false
// // ): Promise<T> => {
// //     console.log('endpoint:', `${API_URL}/api${endpoint}`);//TESTING
// //     const headers = {
// //         ...options.headers,
// //     };
// //     if (!hasMultipart) {
// //         headers["Content-Type"] = "application/json";
// //     }
// //     try {
// //         const response = await fetch(`${API_URL}/api${endpoint}`, {
// //             headers,
// //             ...options,
// //         });
        
// //         if (!response.ok) {
// //             console.error(`HTTP error! status: ${response.status}`);
// //             const errorData = await response.json();
// //             return errorData as T;
// //             // return await response.json();
// //             // throw new Error(`HTTP error! status: ${response.status}`);
// //         }
// //         return await response.json() as T;
// //     } catch (error) {
// //         console.error("API request failed:", error);
// //         throw error;
// //     }
// // };

// const apiRequest = async <T extends object>(
//     endpoint: string,
//     options: ApiOptions = {},
//     hasMultipart: boolean = false
// ): Promise<T> => {
//     console.log("endpoint:", `${API_URL}/api${endpoint}`); //TESTING
//     const headers = {
//         ...options.headers,
//     };
//     if (!hasMultipart) {
//         headers["Content-Type"] = "application/json";
//     }
//     try {
//         const response = await fetch(`${API_URL}/api${endpoint}`, {
//             headers,
//             ...options,
//         });

//         if (!response.ok) {
//             console.error(`HTTP error! status: ${response.status}`);
//             const errorData = await response.json();
//             return errorData as T;
//             // return await response.json();
//             // throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         return (await response.json()) as T;
//     } catch (error) {
//         console.error("API request failed:", error);
//         throw error;
//     }
// };

// interface Api {
//     contactUs: (formData: ContactFormData) => Promise<ContactResponse>;
//     upload: (formData: FormData) => Promise<SubmitJobResponse | ErrorResponse>;
//     process: (jobId: string) => Promise<ProcessedJobResponse | ErrorResponse>;
//     getJobResult: (jobId: string) => Promise<ProcessedJobResponse | ErrorMessageResponse | FailedJobResponse | ErrorResponse>;
//     downloadJobZip: (jobId: string) => Promise<Blob>;
// }

// const api: Api = {
//     contactUs: async (formData) => {
//         // console.log('Sending to:', `${API_URL}/contact`);
//         // console.log('Data:', formData);
//         return await apiRequest("/contact", {
//             method: "POST",
//             body: JSON.stringify(formData),
//         });
//     },

//     // upload: async (formData) => {
//     //     return await apiRequest(
//     //         "/jobs/preprocess",
//     //         {
//     //             method: "POST",
//     //             body: formData,
//     //         },
//     //         true
//     //     );
//     // },
//     upload: async (formData: FormData): Promise<SubmitJobResponse> => {
//         const response = await apiRequest<SubmitJobResponse | ErrorResponse>(
//             "/jobs/preprocess",
//             {
//                 method: "POST",
//                 body: formData,
//             },
//             true
//         );
    
//         if (isErrorResponse(response)) {
//             throw new Error(response.message);
//         }
    
//         return response;
//     },

//     process: async (jobId) => {
//         return await apiRequest("/jobs/process", {
//             method: "POST",
//             body: JSON.stringify({ id: jobId }),
//         });
//     },

//     getJobResult: async (jobId) => {
//         return await apiRequest(`/jobs/${jobId}`);
//     },

//     downloadJobZip: async (jobId) => {
//         const response = await fetch(`${API_URL}/api/jobs/${jobId}/zip`);
//         if (!response.ok) {
//             throw new Error("Network response was not ok");
//         }
//         return await response.blob();
//     },
// };

// export default api;


/**
 * Generic API request function with improved error handling and type validation
 */
const apiRequest = async <T extends object>(
  endpoint: string,
  schema: z.ZodType<T>,
  options: ApiOptions = {},
  hasMultipart: boolean = false
): Promise<T> => {
  const url = `${API_URL}/api${endpoint}`;
  console.log("API request to:", url);
  
  const headers = {
    ...options.headers,
  };
  
  if (!hasMultipart) {
    headers["Content-Type"] = "application/json";
  }
  
  try {
    const response = await fetch(url, {
      headers,
      ...options,
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`, data);
      
      // Validate error response
      const errorResult = ErrorResponseSchema.safeParse(data);
      if (errorResult.success) {
        throw new ApiError(errorResult.data.message, response.status, errorResult.data);
      } else {
        throw new ApiError(
          "An unexpected error occurred",
          response.status,
          { message: "Invalid error response format", data }
        );
      }
    }
    
    // Validate successful response against the provided schema
    const result = schema.safeParse(data);
    if (result.success) {
      return result.data;
    } else {
      console.error("API response validation failed:", result.error);
      throw new ApiError(
        "Invalid response format",
        response.status,
        { message: "Response validation failed", errors: result.error.format() }
      );
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error("API request failed:", error);
    throw new ApiError(
      error instanceof Error ? error.message : "Unknown error",
      500,
      { originalError: error }
    );
  }
};

/**
 * Custom API error class
 */
export class ApiError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number = 500, details: unknown = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

/**
 * API interface with strongly typed methods
 */
interface Api {
  contactUs: (formData: ContactFormData) => Promise<ContactResponse>;
  upload: (formData: FormData) => Promise<SubmitJobResponse>;
  process: (jobId: string) => Promise<ProcessJobResponse>;
  getJobResult: (
    jobId: string
  ) => Promise<GetJobResultResponse>;
  downloadJobZip: (jobId: string) => Promise<Blob>;
}

/**
 * API implementation with Zod validation
 */
const api: Api = {
  contactUs: async (formData) => {
    return await apiRequest(
      "/contact",
      ContactResponseSchema,
      {
        method: "POST",
        body: JSON.stringify(formData),
      }
    );
  },
  
  upload: async (formData: FormData): Promise<SubmitJobResponse> => {
    return await apiRequest(
      "/jobs/preprocess",
      SubmitJobResponseSchema,
      {
        method: "POST",
        body: formData,
      },
      true
    );
  },

  process: async (jobId) => {
    return await apiRequest(
      "/jobs/process",
      ProcessJobResponseSchema,
      {
        method: "POST",
        body: JSON.stringify({ id: jobId }),
      }
    );
  },
  getJobResult: async (jobId) => {
    return await apiRequest(`/jobs/${jobId}`, GetJobResultResponseSchema, { method: 'GET' });
  },

  downloadJobZip: async (jobId) => {
    const url = `${API_URL}/api/jobs/${jobId}/zip`;
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        `Failed to download job zip: ${response.statusText}`,
        response.status,
        errorData
      );
    }
    
    return await response.blob();
  },
};

export default api;
