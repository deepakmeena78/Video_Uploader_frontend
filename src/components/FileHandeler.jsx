import React, { useState, useRef } from "react";
import axios from "axios";
import "../index.css";

const FileHandler = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const startTimeRef = useRef(null);

  const handleUpload = async (file) => {
    if (!file) return;

    const fileSizeMB = file.size / (1024 * 1024); // Convert bytes to MB

    if (fileSizeMB < 25 || fileSizeMB > 100) {
      alert("Please upload a video between 25 MB and 100 MB.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setRemainingTime(0);
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

            const elapsedTime = (new Date().getTime() - startTimeRef.current) / 1000;

            const speed = loaded / elapsedTime;
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

      {isUploading && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-sm mt-2 text-gray-700">
            Uploading... {uploadProgress}% | Remaining: {remainingTime}s
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
