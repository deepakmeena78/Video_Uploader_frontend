import React, { useState, useRef } from "react";
import axios from "axios";
import "../index.css";

const FileHandler = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const [fileInfo, setFileInfo] = useState(null); 
  const [uploadSpeed, setUploadSpeed] = useState(0);

  const startTimeRef = useRef(null);

  const handleUpload = async (file) => {
    if (!file) return;

    const fileSizeMB = file.size / (1024 * 1024);

    if (fileSizeMB < 25 || fileSizeMB > 100) {
      alert("Please upload a video between 25 MB and 100 MB.");
      return;
    }

    setFileInfo({
      name: file.name,
      size: fileSizeMB.toFixed(2),
    });

    setIsUploading(true);
    setUploadProgress(0);
    setRemainingTime(0);
    setUploadSpeed(0);
    setShowPopup(false);
    startTimeRef.current = new Date().getTime();

    const formData = new FormData();
    formData.append("video", file);

    try {
      await axios.post(
        "https://video-uploader-server-48c7.onrender.com/api/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const { loaded, total } = progressEvent;
            const percent = Math.round((loaded * 100) / total);
            setUploadProgress(percent);

            const elapsedTime =
              (new Date().getTime() - startTimeRef.current) / 1000;

            const speed = loaded / elapsedTime; 
            setUploadSpeed((speed / (1024 * 1024)).toFixed(2)); 

            const remainingBytes = total - loaded;
            const remaining = Math.max(Math.round(remainingBytes / speed), 0);
            setRemainingTime(remaining);
          },
        }
      );

      setUploadProgress(100);
      setRemainingTime(0);
      setShowPopup(true);
    } catch (error) {
      console.error("Upload failed", error);
      setUploadProgress(0);
      setRemainingTime(0);
      setShowPopup(true);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4">
      <input
        type="file"
        accept="video/mp4"
        onChange={(e) => handleUpload(e.target.files[0])}
        className="mb-4"
      />

      {fileInfo && (
        <div className="mb-3 p-3 border rounded bg-gray-50 text-gray-800">
          <p><strong>📂 File Name:</strong> {fileInfo.name}</p>
          <p><strong>📏 File Size:</strong> {fileInfo.size} MB</p>
        </div>
      )}

      {isUploading && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-sm mt-2 text-gray-700">
            Uploading... {uploadProgress}% | Speed: {uploadSpeed} MB/s | Remaining: {remainingTime}s
          </p>
        </div>
      )}

      {showPopup && !isUploading && (
        <div className="mt-4 p-4 bg-green-200 border rounded text-gray-800">
          ✅ Upload Complete!
        </div>
      )}
    </div>
  );
};

export default FileHandler;
