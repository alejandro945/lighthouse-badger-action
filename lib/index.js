"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const badgen_1 = require("badgen");
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const storage_blob_1 = require("@azure/storage-blob");
async function run() {
    var _a;
    try {
        // Obtener inputs del action
        const reportsPath = core.getInput('reports-path') || process.cwd();
        const uploadDestination = core.getInput('upload-destination') || 's3';
        const s3BucketName = core.getInput('s3-bucket-name');
        const s3AccessKeyId = core.getInput('s3-access-key-id');
        const s3SecretAccessKey = core.getInput('s3-secret-access-key');
        const s3Region = core.getInput('s3-region');
        const azureContainerName = core.getInput('azure-container-name');
        const azureStorageAccountName = core.getInput('azure-storage-account-name');
        const azureStorageAccountKey = core.getInput('azure-storage-account-key');
        const resultCategories = ['performance', 'accessibility', 'best-practices', 'seo', 'pwa'];
        // Leer los archivos de reportes
        const reportFiles = fs.readdirSync(reportsPath).filter(file => file.endsWith('.report.json'));
        if (!reportFiles.length) {
            core.warning('No Lighthouse reports found.');
            return;
        }
        for (const file of reportFiles) {
            const report = JSON.parse(fs.readFileSync(path.join(reportsPath, file), 'utf-8'));
            if (!report.categories) {
                core.warning(`Invalid file ${file}`);
                continue;
            }
            for (const label of resultCategories) {
                const score = ((_a = report.categories[label]) === null || _a === void 0 ? void 0 : _a.score) * 100;
                let color = 'red';
                if (score >= 90)
                    color = 'green';
                else if (score >= 50)
                    color = 'orange';
                const svg = (0, badgen_1.badgen)({ label, status: score.toString(), color });
                const svgFileName = path.join(reportsPath, file.replace('report.json', `${label}.svg`));
                fs.writeFileSync(svgFileName, svg);
                // Subir el SVG a S3 o Azure
                if (uploadDestination === 's3') {
                    await uploadToS3(svgFileName, s3BucketName, s3AccessKeyId, s3SecretAccessKey, s3Region);
                }
                else if (uploadDestination === 'azure') {
                    await uploadToAzure(svgFileName, azureContainerName, azureStorageAccountName, azureStorageAccountKey);
                }
            }
        }
    }
    catch (error) {
        core.setFailed(`Action failed with error: ${error.message}`);
    }
}
/**
 * Function to upload a file to S3
 * @param filePath - Route to the file to upload
 * @param bucketName
 * @param accessKeyId
 * @param secretAccessKey
 * @param region
 */
async function uploadToS3(filePath, bucketName, accessKeyId, secretAccessKey, region) {
    const s3 = new aws_sdk_1.default.S3({
        accessKeyId,
        secretAccessKey,
        region,
    });
    const fileContent = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);
    const params = {
        Bucket: bucketName,
        Key: fileName,
        Body: fileContent,
        ContentType: 'image/svg+xml',
    };
    try {
        const data = await s3.upload(params).promise();
        core.setOutput('s3-url', data.Location);
        core.info(`Uploaded ${fileName} to S3: ${data.Location}`);
    }
    catch (error) {
        core.setFailed(`Failed to upload ${fileName} to S3: ${error.message}`);
    }
}
/**
 * Function to upload a file to Azure Blob Storage
 * @param filePath  - Route to the file to upload
 * @param containerName
 * @param accountName
 * @param accountKey
 */
async function uploadToAzure(filePath, containerName, accountName, accountKey) {
    const sharedKeyCredential = new storage_blob_1.StorageSharedKeyCredential(accountName, accountKey);
    const blobServiceClient = new storage_blob_1.BlobServiceClient(`https://${accountName}.blob.core.windows.net`, sharedKeyCredential);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const fileContent = fs.readFileSync(filePath);
    const blobName = path.basename(filePath);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    try {
        await blockBlobClient.upload(fileContent, fileContent.length, {
            blobHTTPHeaders: { blobContentType: 'image/svg+xml' },
        });
        const blobUrl = blockBlobClient.url;
        core.setOutput('azure-blob-url', blobUrl);
        core.info(`Uploaded ${blobName} to Azure Blob Storage: ${blobUrl}`);
    }
    catch (error) {
        core.setFailed(`Failed to upload ${blobName} to Azure Blob Storage: ${error.message}`);
    }
}
run();
