import { v4 as uuidv4 } from 'uuid';
import File, { IFile } from '../models/File';

export interface CreateFileData {
    messageId: string;
    originalName: string;
    uniqueName: string;
}

class FileService {

    /**
     * Create a new file record
     */
    async createFile(fileData: CreateFileData): Promise<IFile> {
        try {
            const uniqueName = fileData.uniqueName;

            const file = await File.create({
                messageId: fileData.messageId,
                originalName: fileData.originalName,
                uniqueName
            });

            return file.toJSON() as IFile;
        } catch (error) {
            throw new Error(`Failed to create file: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get all files for a specific message
     */
    async getFilesByMessageId(messageId: string): Promise<IFile[]> {
        try {
            const files = await File.findAll({
                where: { messageId },
                order: [['createdAt', 'ASC']]
            });

            return files.map(file => file.toJSON() as IFile);
        } catch (error) {
            throw new Error(`Failed to get files by message ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Bulk create files for a message
     */
    async bulkCreateFiles(filesData: CreateFileData[], messageId: string): Promise<IFile[]> {
        try {
            const filesToCreate = filesData.map(fileData => ({
                messageId,
                originalName: fileData.originalName,
                uniqueName: fileData.uniqueName
            }));

            const files = await File.bulkCreate(filesToCreate, {
                returning: true
            });

            return files.map(file => file.toJSON() as IFile);
        } catch (error) {
            throw new Error(`Failed to bulk create files: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}

export default new FileService();