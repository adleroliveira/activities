import { useState, useCallback, useEffect } from "react";
import { UploadStatusUpdate } from "../services/AppController";
import { appController } from "../services/AppController";

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

  const updateProgress = useCallback((status: UploadStatusUpdate) => {
    setUploadProgress((prev) => ({
      ...prev,
      progress: status.progress,
      message: `Uploading: ${status.progress}%`,
    }));
  }, []);

  useEffect(() => {
    appController.registerMessageHandler("uploadProgress", updateProgress);

    return () => {
      // Clean up the handler when component unmounts
      // appController.unregisterMessageHandler("uploadProgress");
    };
  }, [updateProgress]);

  const uploadFile = async (file: File): Promise<UploadResponse> => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      setUploadProgress({
        progress: 0,
        status: "uploading",
        message: "Starting upload...",
        fileName: file.name,
      });

      const response = await fetch("http://localhost:3000/api/upload", {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${errorText || response.statusText}`);
      }

      const data = await response.json();

      setUploadProgress((prev) => ({
        ...prev,
        progress: 100,
        status: "success",
        message: "Upload complete!",
      }));

      return {
        success: true,
        message: "File uploaded successfully",
        fileId: data.fileId,
      };
    } catch (error) {
      console.error("Upload error:", error);
      setUploadProgress((prev) => ({
        ...prev,
        progress: 0,
        status: "error",
        message: error instanceof Error ? error.message : "Upload failed",
      }));

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
