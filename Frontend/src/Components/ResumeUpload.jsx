import { useState, useRef } from "react";
import { Upload, FileText, Loader2 } from "lucide-react";
import { useAuth } from "../lib/auth-context";

export function ResumeUpload({ onUploadComplete }) {

  const { user } = useAuth();

  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef(null);

  const allowedTypes = [
    "text/plain",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ];

  const handleFile = async (file) => {

    if (!file) return;

    if (!allowedTypes.includes(file.type)) {
      alert("Please upload TXT, PDF, DOC or DOCX file");
      return;
    }

    setIsUploading(true);

    try {

      const formData = new FormData();
      formData.append("resume", file);
      formData.append("userId", user?.id);

      const response = await fetch("http://localhost:5000/api/resume/upload", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Upload failed");
      }

      onUploadComplete(data.resumeId);

    } catch (error) {

      console.error("Upload error:", error);
      alert("Failed to upload and analyze resume");

    } finally {

      setIsUploading(false);

    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`
        relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
        transition-all duration-200 ease-in-out
        ${
          isDragging
            ? "border-blue-500 bg-blue-50 scale-105"
            : "border-gray-300 bg-white hover:border-blue-400 hover:bg-gray-50"
        }
        ${isUploading ? "pointer-events-none opacity-75" : ""}
      `}
    >

      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.pdf,.doc,.docx"
        onChange={handleFileInput}
        className="hidden"
      />

      <div className="flex flex-col items-center gap-4">

        {isUploading ? (

          <>
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />

            <div>
              <p className="text-lg font-semibold text-gray-700">
                Analyzing Resume...
              </p>

              <p className="text-sm text-gray-500 mt-1">
                This may take a few seconds
              </p>
            </div>
          </>

        ) : (

          <>
            <div className="relative">

              <Upload className="w-16 h-16 text-gray-400" />

              <FileText className="w-8 h-8 text-blue-500 absolute -bottom-1 -right-1" />

            </div>

            <div>
              <p className="text-lg font-semibold text-gray-700">
                Drop your resume here or click to browse
              </p>

              <p className="text-sm text-gray-500 mt-2">
                Supports TXT, PDF, DOC, DOCX
              </p>
            </div>
          </>

        )}

      </div>
    </div>
  );
}