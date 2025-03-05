import path from 'path';
import fs from 'fs';
import { FailedJobInfoFile, JobInfoFile, SuccessJobInfoFile } from '../../types/types';
import HttpError from '../middlewares/HttpError';

export function readInfoFile(jobDir: string): JobInfoFile | SuccessJobInfoFile | FailedJobInfoFile {
    const infoFilePath = path.join(jobDir, 'info.json');
    try {
        return JSON.parse(fs.readFileSync(infoFilePath, 'utf8'));
    } catch (err) {
        throw new HttpError('Could not read info.json', { status: 500 });
    }
}

export function writeInfoFile(jobDir: string, info: JobInfoFile | SuccessJobInfoFile | FailedJobInfoFile): void {
    const infoFilePath = path.join(jobDir, 'info.json');
    try {
        fs.writeFileSync(infoFilePath, JSON.stringify(info, null, 2));
    } catch (err) {
        throw new HttpError('Could not write to info.json', { status: 500 });
    }
}

export function isPreprocessingJob(info: any): info is JobInfoFile {
    return info.status === 'preprocessing';
}

export function isProcessingJob(info: any): info is JobInfoFile {
    return info.status === 'processing';
}

export function isProcessedJob(info: any): info is SuccessJobInfoFile {
    return info.status === 'processed' && 'zipName' in info;
}

export function isFailedJob(info: any): info is FailedJobInfoFile {
    return info.status === 'failed' && 'log' in info;
}
