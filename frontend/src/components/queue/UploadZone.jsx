import React, { useRef, useState, useEffect, useContext } from "react";
import { FileText, ImageIcon, Upload, UploadCloud, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { SideBarData } from "../../context/SideBarContext";

function UploadZone({ onUploadSuccess }) {
  const [isFileUploaderOpen, setIsFileUploaderOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef(null);
  const { setSidebarData } = useContext(SideBarData);

  const handleFiles = (newFiles) => {
    const validTypes = ["application/pdf", "image/jpeg", "image/png"];

    const selected = Array.from(newFiles).filter((f) =>
      validTypes.includes(f.type),
    );

    if (selected.length > 0) {
      setErrorMessage("");
      // 🔥 revoke old preview
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }

      const singleFile = Object.assign(selected[0], {
        preview: URL.createObjectURL(selected[0]),
      });

      setFile(singleFile);
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = () => {
    if (file?.preview) URL.revokeObjectURL(file.preview);
    setErrorMessage("");
    setFile(null);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
    };
  }, [file]);

  const [formData, setFormData] = useState({
    student_id: "",
    student_name: "",
    claimed_category: "",
    claimed_points: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setErrorMessage("Select one PDF or image before submitting.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    const data = new FormData();

    data.append("file", file);
    data.append("student_id", formData.student_id);
    data.append("student_name", formData.student_name);
    data.append("claimed_category", formData.claimed_category);
    data.append("claimed_points", formData.claimed_points);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/submissions/upload`,
        {
          method: "POST",
          body: data,
        },
      );

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null);
        throw new Error(errorPayload?.detail || `Upload failed with status ${response.status}`);
      }

      const result = await response.json();
      onUploadSuccess?.(result);
      setSidebarData("dashboard");
      setIsFileUploaderOpen(false);
    } catch (error) {
      console.error("Error uploading file:", error);
      setErrorMessage(error.message || "Upload failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface border border-white/5 rounded-2xl p-10 flex flex-col items-center justify-center text-center group cursor-pointer hover:bg-surface-container transition-all duration-300"
    >
      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
        <UploadCloud className="text-primary" size={32} />
      </div>

      <h3 className="text-lg font-bold text-white mb-2">
        Upload MAR Certificate
      </h3>

      {!isFileUploaderOpen && (
        <div className="flex gap-3">
          <button
            className="px-6 py-2 bg-primary-container text-[#001a41] font-bold rounded-lg text-sm hover:opacity-90 transition-opacity active:scale-95"
            onClick={() => setIsFileUploaderOpen(true)}
          >
            Select Files and Fill Details
          </button>
          <button className="px-6 py-2 bg-white/5 text-white font-bold rounded-lg text-sm hover:bg-white/10 transition-all active:scale-95">
            Bulk Import
          </button>
        </div>
      )}

      {isFileUploaderOpen && (
        <form
          className="w-full max-w-6xl mx-auto space-y-4"
          onSubmit={handleSubmit}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* LEFT SIDE → FILE UPLOADER */}
            <div className="space-y-4">
              {/* Drop Zone */}
              <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current.click()}
                className={`p-10 border-2 border-dashed rounded-2xl ${
                  isDragging
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => handleFiles(e.target.files)}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                />

                <Upload size={32} className="mx-auto text-gray-400" />
                <p className="text-white mt-2 text-center">
                  Drop or Click to Upload
                </p>
              </div>

              {/* File List */}
              <div className="space-y-2">
                <AnimatePresence>
                  {file && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition"
                      onClick={() => window.open(file.preview, "_blank")}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-blue-400">
                          {file.type === "application/pdf" ? (
                            <FileText size={20} />
                          ) : (
                            <ImageIcon size={20} />
                          )}
                        </div>

                        <span className="text-sm text-white truncate max-w-[200px]">
                          {file.name}
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile();
                        }}
                        className="p-1 hover:bg-white/10 rounded-full text-gray-400 hover:text-red-400"
                      >
                        <X size={18} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* RIGHT SIDE → FORM */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
              <h3 className="text-white font-bold text-lg">Student Details</h3>

              <input
                type="text"
                placeholder="Student ID"
                name="student_id"
                className="w-full p-3 rounded-lg bg-black/30 border border-white/10 text-white outline-none"
                onChange={handleChange}
              />

              <input
                type="text"
                placeholder="Student Name"
                name="student_name"
                className="w-full p-3 rounded-lg bg-black/30 border border-white/10 text-white outline-none"
                onChange={handleChange}
              />

              <input
                type="text"
                placeholder="Category (e.g. Sports)"
                name="claimed_category"
                className="w-full p-3 rounded-lg bg-black/30 border border-white/10 text-white outline-none"
                onChange={handleChange}
              />

              <input
                type="number"
                placeholder="Claimed Points"
                name="claimed_points"
                className="w-full p-3 rounded-lg bg-black/30 border border-white/10 text-white outline-none"
                onChange={handleChange}
              />
            </div>
          </div>

          <button
            className="w-full px-6 py-3 bg-blue-600 text-white font-bold rounded-lg text-sm hover:bg-blue-500 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing Upload..." : "Scan Documents and Details"}
          </button>
          {errorMessage && (
            <p className="text-sm text-red-400">{errorMessage}</p>
          )}
        </form>
      )}
    </motion.div>
  );
}

export default UploadZone;
