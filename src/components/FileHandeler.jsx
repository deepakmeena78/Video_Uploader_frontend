import React, { useState } from "react";
import axios from "axios";
import "../index.css";

const FileHandler = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const handleUpload = async (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("video", file);

    setIsUploading(true);
    setUploadProgress(0);
    setRemainingTime(0);
    setShowPopup(false);

    let elapsedTime = 0;

    // Dummy progress interval
    const interval = setInterval(() => {
      elapsedTime += 1;
      setUploadProgress((prev) => {
        const next = prev < 95 ? prev + 1 : prev;
        // Estimate remaining time based on dummy progress
        const remaining = Math.max(Math.round(((100 - next) / next) * elapsedTime), 0);
        setRemainingTime(remaining);
        return next;
      });
    }, 500); // adjust speed if needed

    try {
      await axios.post("http://localhost:5000/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      clearInterval(interval);
      setUploadProgress(100);
      setRemainingTime(0);
      setShowPopup(true);
    } catch (error) {
      clearInterval(interval);
      setUploadProgress(0);
      setRemainingTime(0);
      console.error("Upload failed", error);
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
