import { useState } from "react";

interface UploadProgress {
  progress: number;
  status: "idle" | "uploading" | "processing" | "success" | "error";
  message: string;
  fileName: string | null;
}

interface UploadResponse {
  success: boolean;
  message: string;
  fileId?: string;
}

export const useFileUpload = () => {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    progress: 0,
    status: "idle",
    message: "",
    fileName: null,
  });

  const uploadFile = async (file: File): Promise<UploadResponse> => {
    try {
      // Create FormData
      const formData = new FormData();
      formData.append("file", file);

      setUploadProgress({
        progress: 0,
        status: "uploading",
        message: "Starting upload...",
        fileName: file.name,
      });

      // Make the upload request
      const response = await fetch("http://localhost:3000/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();

      setUploadProgress({
        progress: 100,
        status: "success",
        message: "Upload complete!",
        fileName: file.name,
      });

      return {
        success: true,
        message: "File uploaded successfully",
        fileId: data.fileId,
      };
    } catch (error) {
      setUploadProgress({
        progress: 0,
        status: "error",
        message: error instanceof Error ? error.message : "Upload failed",
        fileName: file.name,
      });

      return {
        success: false,
        message: error instanceof Error ? error.message : "Upload failed",
      };
    }
  };

  const resetUpload = () => {
    setUploadProgress({
      progress: 0,
      status: "idle",
      message: "",
      fileName: null,
    });
  };

  return {
    uploadProgress,
    uploadFile,
    resetUpload,
  };
};
