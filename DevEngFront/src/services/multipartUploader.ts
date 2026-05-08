import {
    S3Client,
    CreateMultipartUploadCommand,
    UploadPartCommand,
    CompleteMultipartUploadCommand,
    AbortMultipartUploadCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client, S3_BUCKET } from "../lib/aws-config";

interface UploadProgress {
    loaded: number;
    total: number;
    percentage: number;
    partNumber?: number;
}

export default class S3MultipartUploadService {
    private client: S3Client;
    private bucket: string;
    private partSize = 5 * 1024 * 1024;
    private maxParts = 10000;
    private uploadId: string | null = null;
    private key: string | null = null;
    private isCancelled = false;
    private activeAbortControllers: AbortController[] = [];

    constructor() {
        this.client = s3Client;
        this.bucket = S3_BUCKET;
    }

    async uploadFile(
        key: string,
        file: File,
        onProgress?: (progress: UploadProgress) => void
    ): Promise<string> {
        this.isCancelled = false;
        this.key = key;
        this.activeAbortControllers = [];

        try {

            const createCommand = new CreateMultipartUploadCommand({
                Bucket: this.bucket,
                Key: this.key,
                ContentType: file.type,
            });

            const createResponse = await this.client.send(createCommand);
            this.uploadId = createResponse.UploadId!;
            const partCount = Math.ceil(file.size / this.partSize);
            if (partCount > this.maxParts)
                throw new Error(`File too large — exceeds ${this.maxParts} parts`);

            const completedParts: { ETag: string; PartNumber: number }[] = [];
            let uploadedBytes = 0;

            for (let partNumber = 1; partNumber <= partCount; partNumber++) {
                if (this.isCancelled) throw new Error("Upload cancelled");

                const start = (partNumber - 1) * this.partSize;
                const end = Math.min(start + this.partSize, file.size);
                const partData = file.slice(start, end);

                const res = await this.uploadPart(this.key!, this.uploadId!, partNumber, partData);
                uploadedBytes += partData.size;
                onProgress?.({
                    loaded: uploadedBytes,
                    total: file.size,
                    percentage: Math.round((uploadedBytes / file.size) * 100),
                    partNumber,
                });
                completedParts.push(res);
            }

            if (this.isCancelled) throw new Error("Upload cancelled");

            const completeCommand = new CompleteMultipartUploadCommand({
                Bucket: this.bucket,
                Key: this.key,
                UploadId: this.uploadId,
                MultipartUpload: {
                    Parts: completedParts.sort((a, b) => a.PartNumber - b.PartNumber),
                },
            });

            const completeResponse = await this.client.send(completeCommand);

            const finalUrl =
                completeResponse.Location ||
                `https://${this.bucket}.s3.amazonaws.com/${this.key}`;

            this.cleanup();
            return finalUrl;
        } catch (err: any) {
            if (err.message === "Upload cancelled") {
                console.warn("⚠️ Upload was cancelled by user.");
            } else {
                console.error("❌ Upload failed:", err);
            }

            await this.cancelUpload();
            throw err;
        }
    }

    private async uploadPart(
        key: string,
        uploadId: string,
        partNumber: number,
        partData: Blob
    ): Promise<{ ETag: string; PartNumber: number }> {
        if (this.isCancelled) throw new Error("Upload cancelled");

        const controller = new AbortController();
        this.activeAbortControllers.push(controller);

        const command = new UploadPartCommand({
            Bucket: this.bucket,
            Key: key,
            PartNumber: partNumber,
            UploadId: uploadId,
        });
        const presignedUrl = await getSignedUrl(this.client, command, {
            expiresIn: 1800,
        });

        const response = await fetch(presignedUrl, {
            method: "PUT",
            body: partData,
            headers: { "Content-Type": "application/octet-stream" },
            signal: controller.signal,
        });

        if (!response.ok)
            throw new Error(`Part ${partNumber} failed: ${response.statusText}`);

        const etag = response.headers.get("ETag");
        if (!etag) throw new Error(`No ETag for part ${partNumber}`);

        return { ETag: etag, PartNumber: partNumber };
    }

    async cancelUpload() {

        if (this.isCancelled) {
            return;
        }

        this.isCancelled = true;


        // Abort any active fetch requests
        this.activeAbortControllers.forEach((ctrl) => ctrl.abort());
        this.activeAbortControllers = [];

        if (this.uploadId && this.key) {
            try {
                const abortCommand = new AbortMultipartUploadCommand({
                    Bucket: this.bucket,
                    Key: this.key,
                    UploadId: this.uploadId,
                });
                await this.client.send(abortCommand);

            } catch (err) {
                console.error("Error aborting upload:", err);
            }
        }

        this.cleanup();
    }

    private cleanup() {
        this.uploadId = null;
        this.key = null;
        this.activeAbortControllers = [];
    }
}
