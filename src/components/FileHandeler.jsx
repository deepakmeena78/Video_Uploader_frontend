
import React, { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import "../index.css";

const FileHandler = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const [fileInfo, setFileInfo] = useState(null);
  const [uploadSpeed, setUploadSpeed] = useState(0);
  const [recording, setRecording] = useState(false);
  const [facingMode, setFacingMode] = useState("user"); // front/back camera

  const startTimeRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const videoRef = useRef(null);

  const navigate = useNavigate();

  const handleUpload = async (file) => {
    if (!file) return;

    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB < 25 || fileSizeMB > 100) {
      toast.error("⚠️ Please upload a video between 25 MB and 100 MB.");
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
      toast.success("✅ Video uploaded successfully!");
      setTimeout(() => navigate("/videos"), 1500);
    } catch (error) {
      console.error("Upload failed", error);
      setUploadProgress(0);
      setRemainingTime(0);
      setShowPopup(true);
      toast.error("❌ Video upload failed!");
    } finally {
      setIsUploading(false);
    }
  };

  // start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode },
        audio: true,
      });
      videoRef.current.srcObject = stream;
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: "video/webm",
      });
      recordedChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, {
          type: "video/webm",
        });
        const file = new File([blob], "recorded-video.webm", {
          type: "video/webm",
        });
        handleUpload(file);
      };

      mediaRecorderRef.current.start();
      setRecording(true);
      toast("🎥 Recording started", { icon: "⏺" });
    } catch (error) {
      console.error("Recording failed:", error);
      toast.error("❌ Failed to access camera/microphone");
    }
  };

  // stop recording
  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
    const tracks = videoRef.current.srcObject.getTracks();
    tracks.forEach((track) => track.stop());
    videoRef.current.srcObject = null;
    toast("⏹ Recording stopped", { icon: "✅" });
  };

  // switch camera
  const switchCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
    if (recording) {
      stopRecording();
      startRecording();
    }
    toast("🔄 Camera switched");
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <Toaster position="top-center" reverseOrder={false} />

      {/* Drag & Drop Upload Area */}
      <div
        className="border-2 border-dashed border-gray-400 rounded-xl p-6 text-center cursor-pointer hover:bg-gray-100 transition"
        onClick={() => document.getElementById("fileInput").click()}
      >
        <input
          type="file"
          id="fileInput"
          hidden
          accept="video/mp4"
          onChange={(e) => handleUpload(e.target.files[0])}
        />
        <p className="text-gray-700">
          📂 Drag & Drop or{" "}
          <span className="font-semibold text-blue-600">Click</span> to upload a
          video
        </p>
        <p className="text-sm text-gray-500">Allowed size: 25MB – 100MB</p>
      </div>

      {/* Video Recording */}
      <div className="mt-6 text-center">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-64 h-40 bg-black rounded-lg mx-auto mb-3"
        />
        {!recording ? (
          <button
            onClick={startRecording}
            className="px-5 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 mr-2"
          >
            🎥 Start Recording
          </button>
        ) : (
          <>
            <button
              onClick={stopRecording}
              className="px-5 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 mr-2"
            >
              ⏹ Stop Recording
            </button>
            {/* Switch Camera Button (only when recording) */}
            <button
              onClick={switchCamera}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600"
            >
              🔄 Switch Camera
            </button>
          </>
        )}
      </div>

      {/* File info */}
      {fileInfo && (
        <div className="mt-5 p-4 border rounded-lg bg-gray-50 text-gray-800 shadow-sm">
          <p>
            <strong>📂 File Name:</strong> {fileInfo.name}
          </p>
          <p>
            <strong>📏 File Size:</strong> {fileInfo.size} MB
          </p>
        </div>
      )}

      {/* Uploading Progress */}
      {isUploading && (
        <div className="mt-6 bg-white p-4 rounded-lg shadow-md">
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className="bg-blue-600 h-4 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-sm mt-3 text-gray-700 text-center">
            ⏳ Uploading... {uploadProgress}% <br />
            🚀 Speed: {uploadSpeed} MB/s | ⏱ Remaining: {remainingTime}s
          </p>
        </div>
      )}

      {/* Upload Complete */}
      {showPopup && !isUploading && (
        <div className="mt-5 p-4 bg-green-200 border rounded text-gray-800 text-center shadow-sm">
          ✅ Upload Complete!
        </div>
      )}
    </div>
  );
};

export default FileHandler;
