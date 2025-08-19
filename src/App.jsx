import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import FileUploader from "./components/FileHandeler";
import VideoList from "./components/VideoList";
import "./index.css";
import "./App.css";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <Router>
      <Toaster/>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-teal-300 to-blue-200 font-poppins p-4">
        <h1 className="mb-6 text-3xl font-bold text-gray-800 text-center">
          🎥 Video Upload Project
        </h1>

        {/* Navigation */}
        <nav className="flex gap-4 mb-8 justify-center">
          <Link
            to="/"
            className="px-5 py-2 bg-white rounded-lg text-gray-800 font-medium shadow hover:shadow-lg transition transform hover:-translate-y-1"
          >
            Upload Video
          </Link>

          <Link
            to="/videos"
            className="px-5 py-2 bg-white rounded-lg text-gray-800 font-medium shadow hover:shadow-lg transition transform hover:-translate-y-1"
          >
            View Uploaded Videos
          </Link>
        </nav>

        <div className="w-full max-w-2xl p-6 rounded-xl bg-white shadow-lg">
          <Routes>
            <Route path="/" element={<FileUploader />} />
            <Route path="/videos" element={<VideoList />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
