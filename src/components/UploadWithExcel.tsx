import React, { useState } from 'react';
import UploadBlock from '../components/UploadBlock';
import { type UploadedFile, type ValidationResult } from '../types/upload';
import { uploadExtractionWithUploadedFiles, validateExcelFiles, downloadCorrectedFile } from '../api/excelExtract';
import { type UploadProgressCallback } from '../types/upload';

const UploadWithExcel: React.FC = () => {
  const [excelFiles, setExcelFiles] = useState<UploadedFile[]>([]);
  const [pdfFiles, setPdfFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [validationChecked, setValidationChecked] = useState(false);

  const handleValidation = async () => {
    if (!excelFiles.length) {
      alert('Please select an Excel file first');
      return;
    }

    setIsValidating(true);
    setValidationResult(null);
    setValidationChecked(false);

    try {
      // Call validation API
      const result = await validateExcelFiles(excelFiles, pdfFiles);
      setValidationResult(result);
      setValidationChecked(true);
      
      if (result.isValid) {
        alert('Validation passed! You can now upload the files.');
      } else {
        alert(`Validation failed with ${result.summary.errorCount} errors. Please check the details below.`);
      }
    } catch (error) {
      console.error('Validation error:', error);
      alert('Validation failed. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleDownloadCorrectedFile = async () => {
    if (!validationResult?.correctedFile) return;
    
    try {
      const blob = await downloadCorrectedFile(validationResult.correctedFile.fileName);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = validationResult.correctedFile.fileName;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download corrected file. Please try again.');
    }
  };

  const handleUpload = async () => {
    if (!canUpload) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    const onProgress: UploadProgressCallback = (progress) => {
      setUploadProgress(progress);
    };
    
    try {
      const result = await uploadExtractionWithUploadedFiles(excelFiles, pdfFiles, onProgress);
      
      if (result.success) {
        console.log('Upload successful:', result.data);
        alert(`Upload successful! Inserted ${result.data?.insertedCount} records. Matched ${result.data?.pdfStats.matchedPdfs} PDF files.`);
        
        // Clear everything after successful upload
        setExcelFiles([]);
        setPdfFiles([]);
        setUploadProgress(0);
        setValidationResult(null);
        setValidationChecked(false);
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

  const handleFilesChange = (files: UploadedFile[], type: 'excel' | 'pdf') => {
    if (type === 'excel') {
      setExcelFiles(files);
    } else {
      setPdfFiles(files);
    }
    // Reset validation when files change
    setValidationResult(null);
    setValidationChecked(false);
  };

  const canValidate = excelFiles.length > 0 && !isValidating && !isUploading;
  const canUpload = validationChecked && validationResult?.isValid && !isUploading;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Upload With Excel</h1>
          <p className="text-gray-600 mt-2">
            Upload your Excel file with real estate data and associated PDF documents
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <UploadBlock
            title="Excel Data File"
            description="Upload your Excel file containing real estate data"
            accept=".xlsx,.xls,.csv"
            multiple={false}
            maxFiles={1}
            maxSize={10}
            onFilesChange={(files) => handleFilesChange(files, 'excel')}
            uploadedFiles={excelFiles}
            disabled={isUploading || isValidating}
          />

          <UploadBlock
            title="PDF Documents"
            description="Upload PDF files associated with the Excel data"
            accept=".pdf"
            multiple={true}
            maxFiles={20}
            maxSize={10}
            onFilesChange={(files) => handleFilesChange(files, 'pdf')}
            uploadedFiles={pdfFiles}
            disabled={isUploading || isValidating}
          />
        </div>

        {/* Validation and Upload Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={handleValidation}
            disabled={!canValidate}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              canValidate
                ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                : 'bg-gray-400 text-gray-200 cursor-not-allowed'
            }`}
          >
            {isValidating ? 'Validating...' : 'Validate Files'}
          </button>

          <button
            onClick={handleUpload}
            disabled={!canUpload}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              canUpload
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                : 'bg-gray-400 text-gray-200 cursor-not-allowed'
            }`}
          >
            {isUploading ? `Uploading... ${uploadProgress}%` : 'Upload Files'}
          </button>
        </div>

        {/* Validation Results */}
        {validationResult && (
          <div className="mb-8 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Validation Results
              <span className={`ml-2 text-sm font-medium px-2 py-1 rounded ${
                validationResult.isValid 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {validationResult.isValid ? 'PASSED' : 'FAILED'}
              </span>
            </h3>

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-sm">
              <div className="text-center p-3 bg-gray-50 rounded">
                <div className="text-2xl font-bold text-gray-800">{validationResult.summary.totalRows}</div>
                <div className="text-gray-600">Total Rows</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded">
                <div className="text-2xl font-bold text-red-600">{validationResult.summary.errorCount}</div>
                <div className="text-red-600">Errors</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded">
                <div className="text-2xl font-bold text-yellow-600">{validationResult.summary.warningCount}</div>
                <div className="text-yellow-600">Warnings</div>
              </div>
            </div>

            {/* Download Corrected File - UPDATED */}
            {validationResult.correctedFile && !validationResult.isValid && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-blue-800">Corrected File Available</h4>
                    <p className="text-sm text-blue-600">
                      A corrected Excel file has been generated with empty cells filled with "0"
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadCorrectedFile}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Download Corrected File
                  </button>
                </div>
              </div>
            )}

            {/* Errors List */}
            {validationResult.errors.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-red-700 mb-2">Validation Errors:</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {validationResult.errors.map((error, index) => (
                    <div key={index} className="p-3 bg-red-50 border border-red-200 rounded">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-medium text-red-800">Row {error.rowNumber}:</span>
                          <span className="text-red-700 ml-2">{error.field}</span>
                        </div>
                        <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded">
                          {error.type}
                        </span>
                      </div>
                      <p className="text-sm text-red-600 mt-1">{error.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Warnings List */}
            {validationResult.warnings.length > 0 && (
              <div>
                <h4 className="font-medium text-yellow-700 mb-2">Warnings:</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {validationResult.warnings.map((warning, index) => (
                    <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-medium text-yellow-800">Row {warning.rowNumber}:</span>
                          <span className="text-yellow-700 ml-2">{warning.field}</span>
                        </div>
                      </div>
                      <p className="text-sm text-yellow-600 mt-1">{warning.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

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

        {/* Summary */}
        {(excelFiles.length > 0 || pdfFiles.length > 0) && (
          <div className="bg-white rounded-lg shadow-md p-6">
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
                <span className="font-medium">Validation Status:</span>{' '}
                <span className={
                  !validationChecked ? 'text-gray-600' :
                  validationResult?.isValid ? 'text-green-600' : 'text-red-600'
                }>
                  {!validationChecked ? 'Not validated' :
                   validationResult?.isValid ? 'Validated ✓' : 'Validation failed'}
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