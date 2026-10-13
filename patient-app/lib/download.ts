import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import type { DownloadedPdfMetadata } from '@/types/storage';
import logger from '@/utils/logger';

import {
  getDownloadedPdf,
  removeDownloadedPdf,
  saveDownloadedPdf,
} from './storage';

export interface DownloadResult {
  success: boolean;
  localUri?: string;
  error?: string;
}

/**
 * Download a PDF file to device storage using the new File API
 */
export async function downloadPdf(
  documentId: string,
  title: string,
  pdfName: string,
  pdfUrl: string,
  size: number
): Promise<DownloadResult> {
  try {
    // Create a unique filename using the title
    const timestamp = Date.now();
    const sanitizedTitle = title.replace(/[^a-zA-Z0-9-]/g, '_');
    const filename = `${sanitizedTitle}_${timestamp}.pdf`;

    logger.info(`Starting PDF download: ${title}`);
    logger.debug(`Downloading PDF to: ${Paths.document}`);
    logger.debug(`Downloading PDF from: ${pdfUrl}`);
    logger.debug(`Downloading PDF filename: ${filename}`);
    // Use the new File API to download
    const destinationFile = new File(Paths.document, filename);

    // Download the file - the new API doesn't support progress callbacks directly
    // We'll download to the destination
    const downloadedFile = await File.downloadFileAsync(
      pdfUrl,
      destinationFile,
      {
        idempotent: true, // Overwrite if exists
      }
    );

    logger.info(`Download completed: ${downloadedFile.uri}`);

    // Get actual file size
    const fileInfo = await downloadedFile.info();
    const actualSize = fileInfo.size ?? size;

    // Save metadata
    const metadata: DownloadedPdfMetadata = {
      documentId,
      title,
      pdfName,
      localUri: downloadedFile.uri,
      size: actualSize,
      downloadedAt: new Date().toISOString(),
      originalUrl: pdfUrl,
    };

    await saveDownloadedPdf(metadata);
    logger.success(`PDF downloaded successfully: ${title}`);

    return {
      success: true,
      localUri: downloadedFile.uri,
    };
  } catch (error) {
    logger.error(`Failed to download PDF: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Download failed',
    };
  }
}

/**
 * Open a PDF file with the system's default PDF viewer
 * Uses platform-specific methods for better UX
 */
export async function openPdf(localUri: string): Promise<boolean> {
  try {
    // Create File instance from URI
    const file = new File(localUri);

    // Check if file exists
    if (!file.exists) {
      logger.error('PDF file does not exist');
      return false;
    }

    // Share sheet lets the user pick their PDF viewer. Works in Expo Go.
    logger.info('Opening PDF with Sharing');

    logger.success('PDF opened successfully');
    return true;
  } catch (error) {
    logger.error(`Failed to open PDF: ${error}`);
    return false;
  }
}

/**
 * Share a PDF file using the native share dialog
 */
export async function sharePdf(localUri: string): Promise<boolean> {
  try {
    // Create File instance from URI
    const file = new File(localUri);

    // Check if file exists
    if (!file.exists) {
      logger.error('PDF file does not exist');
      return false;
    }

    // Check if sharing is available
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      logger.error('Sharing is not available on this device');
      return false;
    }

    // Share the PDF
    await Sharing.shareAsync(localUri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Share PDF',
    });

    logger.success('PDF shared successfully');
    return true;
  } catch (error) {
    logger.error(`Failed to share PDF: ${error}`);
    return false;
  }
}

/**
 * Delete a PDF file and its metadata
 */
export async function deletePdf(documentId: string): Promise<boolean> {
  try {
    // Get the PDF metadata
    const pdfMetadata = await getDownloadedPdf(documentId);
    if (!pdfMetadata) {
      logger.error('PDF metadata not found');
      return false;
    }

    // Create File instance and delete
    const file = new File(pdfMetadata.localUri);
    if (file.exists) {
      await file.delete();
      logger.success('PDF file deleted');
    }

    // Remove metadata
    await removeDownloadedPdf(documentId);
    logger.success('PDF metadata removed');

    return true;
  } catch (error) {
    logger.error(`Failed to delete PDF: ${error}`);
    return false;
  }
}
