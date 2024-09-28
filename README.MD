# LightHouse Badger GitHub Action 🏆

[![Lighthouse Badger](https://img.shields.io/badge/Lighthouse-Badger-green.svg)](https://github.com/yourusername/lighthouse-badger)

## Overview

**LightHouse Badger** is a GitHub Action that automates the process of generating Lighthouse report badges in SVG format for each Lighthouse category (Performance, Accessibility, Best Practices, SEO, PWA). This action can then upload the generated badges to either an AWS S3 bucket or Azure Blob Storage for easy access and sharing.

## Key Features

- **Automated Badge Generation**: Generates SVG badges from Lighthouse reports for the main Lighthouse categories.
- **Flexible Upload Destination**: Supports uploading badges to either AWS S3 or Azure Blob Storage.
- **Easy Integration**: Seamlessly integrates into your GitHub CI/CD pipeline to visualize and track performance improvements over time.

## Inputs

| Input Name                 | Description                                                    | Required | Default |
|----------------------------|----------------------------------------------------------------|----------|---------|
| `s3-bucket-name`            | The S3 bucket name where SVG badges will be uploaded.          | false    |         |
| `s3-access-key-id`          | The AWS access key ID for S3 upload.                           | false    |         |
| `s3-secret-access-key`      | The AWS secret access key for S3 upload.                       | false    |         |
| `s3-region`                 | The AWS region for S3 upload.                                  | false    |         |
| `azure-container-name`      | The Azure Blob container name for uploading SVG badges.        | false    |         |
| `azure-storage-account-name`| The Azure Storage account name.                                | false    |         |
| `azure-storage-account-key` | The Azure Storage account key.                                 | false    |         |
| `upload-destination`        | Destination for uploading SVG badges: `"s3"` or `"azure"`.     | true     | `s3`    |
| `report-path`               | Path to the Lighthouse report directory.                       | false    | `.lighthouseci` |
| `result-categories`         | Comma-separated list of Lighthouse categories to generate badges for. | false | `performance,accessibility,best-practices,seo,pwa` |

## Outputs

| Output Name     | Description                                           |
|-----------------|-------------------------------------------------------|
| `s3-url`        | The URL of the uploaded SVG badges in S3.             |
| `azure-blob-url`| The URL of the uploaded SVG badges in Azure Blob.     |

## Usage

### Example 1: Uploading Badges to AWS S3

```yaml
name: Generate and Upload Lighthouse Badges to S3
on: [push]

jobs:
  lighthouse-badger:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v2

      - name: Run Lighthouse Badger
        uses: alejandro945/lighthouse-badger@v1
        with:
          s3-bucket-name: ${{ secrets.AWS_S3_BUCKET }}
          s3-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          s3-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          s3-region: 'us-west-2'
          upload-destination: 's3'
          report-path: '.lighthouseci'
          result-categories: 'performance,accessibility,best-practices,seo,pwa'
      
      - name: Output S3 URL
        run: echo "Badges uploaded to: ${{ steps.lighthouse-badger.outputs.s3-url }}"
```

### Example 2: Uploading Badges to Azure Blob Storage

```yaml
name: Generate and Upload Lighthouse Badges to Azure
on: [push]

jobs:
  lighthouse-badger:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v2

      - name: Run Lighthouse Badger
        uses: alejandro945/lighthouse-badger@v1
        with:
          azure-container-name: ${{ secrets.AZURE_CONTAINER_NAME }}
          azure-storage-account-name: ${{ secrets.AZURE_STORAGE_ACCOUNT }}
          azure-storage-account-key: ${{ secrets.AZURE_STORAGE_KEY }}
          upload-destination: 'azure'
          report-path: '.lighthouseci'
          result-categories: 'accessibility,best-practices,seo,pwa'

      - name: Output Azure Blob URL
        run: echo "Badges uploaded to: ${{ steps.lighthouse-badger.outputs.azure-blob-url }}"
```

## Prerequisites

- **AWS S3**: If using S3 for uploads, ensure you have your S3 bucket, access key, and secret key available. You can securely store these as GitHub secrets.
- **Azure Blob Storage**: For Azure uploads, you'll need to set up your Azure Storage account and container, with the corresponding access credentials stored as GitHub secrets.

## Setting up Secrets in GitHub

To securely pass your credentials to the action, you must add the following secrets to your GitHub repository:

1. **AWS S3**: Add `AWS_S3_BUCKET`, `AWS_ACCESS_KEY_ID`, and `AWS_SECRET_ACCESS_KEY`.
2. **Azure Blob Storage**: Add `AZURE_CONTAINER_NAME`, `AZURE_STORAGE_ACCOUNT`, and `AZURE_STORAGE_KEY`.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

---

This `README.md` outlines the purpose, usage examples, and necessary inputs/outputs for your Lighthouse Badger action. It includes examples for both AWS S3 and Azure Blob Storage, providing a clear guide for users to implement the action in their CI/CD pipelines.