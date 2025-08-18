import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../index.css";

function VideoList() {
  const [videos, setVideos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await axios.get("https://video-uploader-server-48c7.onrender.com/api/all");
        setVideos(res.data.videos);
      } catch (err) {
        console.error(err);
        alert("Failed to fetch videos");
      }
    };

    fetchVideos();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        📹 Uploaded Videos
      </h2>

      <div className="flex justify-center mb-6">
        <button
          onClick={() => navigate("/")}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition transform hover:-translate-y-1"
        >
          ⬆️ Upload New Video
        </button>
      </div>

      {videos.length === 0 && (
        <p className="text-gray-500 text-lg text-center">No videos uploaded yet.</p>
      )}

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {videos.map((video) => (
          <div
            key={video.public_id}
            className="bg-white shadow-lg rounded-xl overflow-hidden border hover:shadow-xl transition transform hover:-translate-y-1 flex flex-col items-center"
          >
            {/* 🎥 Video Container */}
            <div className="bg-black flex justify-center items-center rounded-lg overflow-hidden w-64 h-40 sm:w-48 sm:h-32">
              <video
                src={video.url}
                controls
                className="w-full h-full object-cover rounded-md"
                preload="metadata"
                loading="lazy"
              />
            </div>

            {/* ℹ️ Info */}
            <div className="mt-3 mb-4 text-center px-2">
              <p className="text-sm text-gray-600">
                Uploaded at:{" "}
                <span className="font-medium">
                  {new Date(video.created_at).toLocaleString()}
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default VideoList;
