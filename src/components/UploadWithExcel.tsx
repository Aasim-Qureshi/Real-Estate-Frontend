import React, { useState } from 'react';
import UploadBlock from '../components/UploadBlock';
import { type UploadedFile } from '../types/upload';
import { uploadExtractionWithUploadedFiles } from '../api/excelExtract';
import { type UploadProgressCallback } from '../types/upload';

const UploadWithExcel: React.FC = () => {
  const [excelFiles, setExcelFiles] = useState<UploadedFile[]>([]);
  const [pdfFiles, setPdfFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleUpload = async () => {
    if (!canUpload) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    // Progress callback
    const onProgress: UploadProgressCallback = (progress) => {
      setUploadProgress(progress);
    };
    
    try {
      // Use the axios-based API function
      const result = await uploadExtractionWithUploadedFiles(excelFiles, pdfFiles, onProgress);
      
      if (result.success) {
        console.log('Upload successful:', result.data);
        
        // Show success message with details
        alert(`Upload successful! Inserted ${result.data?.insertedCount} records. Matched ${result.data?.pdfStats.matchedPdfs} PDF files.`);
        
        // Clear files after successful upload
        setExcelFiles([]);
        setPdfFiles([]);
        setUploadProgress(0);
      } else {
        alert(`Upload failed: ${result.error}`);
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const canUpload = excelFiles.length > 0 && !isUploading;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Upload With Excel</h1>
          <p className="text-gray-600 mt-2">
            Upload your Excel file with real estate data and associated PDF documents
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Excel Upload Block */}
          <UploadBlock
            title="Excel Data File"
            description="Upload your Excel file containing real estate data"
            accept=".xlsx,.xls,.csv"
            multiple={false}
            maxFiles={1}
            maxSize={10}
            onFilesChange={setExcelFiles}
            uploadedFiles={excelFiles}
            disabled={isUploading}
          />

          {/* PDF Upload Block */}
          <UploadBlock
            title="PDF Documents"
            description="Upload PDF files associated with the Excel data"
            accept=".pdf"
            multiple={true}
            maxFiles={20}
            maxSize={10}
            onFilesChange={setPdfFiles}
            uploadedFiles={pdfFiles}
            disabled={isUploading}
          />
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Uploading files...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Upload Button */}
        <div className="flex justify-center">
          <button
            onClick={handleUpload}
            disabled={!canUpload}
            className={`px-8 py-3 rounded-lg font-semibold text-white transition-colors ${
              canUpload
                ? 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {isUploading ? `Uploading... ${uploadProgress}%` : 'Upload Files'}
          </button>
        </div>

        {/* Summary */}
        {(excelFiles.length > 0 || pdfFiles.length > 0) && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Upload Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Excel Files:</span> {excelFiles.length}
              </div>
              <div>
                <span className="font-medium">PDF Files:</span> {pdfFiles.length}
              </div>
              <div>
                <span className="font-medium">Total Files:</span> {excelFiles.length + pdfFiles.length}
              </div>
              <div>
                <span className="font-medium">Status:</span>{' '}
                <span className={isUploading ? 'text-blue-600' : 'text-green-600'}>
                  {isUploading ? `Uploading... ${uploadProgress}%` : 'Ready to upload'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadWithExcel;