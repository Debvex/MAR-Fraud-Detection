import React, { useRef, useState, useEffect } from "react";
import { FileText, ImageIcon, Upload, UploadCloud, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

function UploadZone() {
  const [isFileUploaderOpen, setIsFileUploaderOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFiles = (newFiles) => {
    const validTypes = ["application/pdf", "image/jpeg", "image/png"];

    const selected = Array.from(newFiles)
      .filter((file) => validTypes.includes(file.type))
      .map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        }),
      );

    setFiles((prev) => [...prev, ...selected]);
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

  const removeFile = (index) => {
    const fileToRemove = files[index];
    URL.revokeObjectURL(fileToRemove.preview);
    setFiles(files.filter((_, i) => i !== index));
  };

  // Cleanup
  useEffect(() => {
    return () => {
      files.forEach((file) => URL.revokeObjectURL(file.preview));
    };
  }, [files]);

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
            Select Files
          </button>
          <button className="px-6 py-2 bg-white/5 text-white font-bold rounded-lg text-sm hover:bg-white/10 transition-all active:scale-95">
            Bulk Import
          </button>
        </div>
      )}

      {isFileUploaderOpen && (
        <div className="w-full max-w-3xl mx-auto space-y-4">
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
              multiple
              className="hidden"
            />

            <Upload size={32} className="mx-auto text-gray-400" />
            <p className="text-white mt-2">Drop or Click to Upload</p>
          </div>

          {/* Preview Section */}
          <div className="space-y-2">
            <AnimatePresence>
              {files.map((file, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition"
                  onClick={() => window.open(file.preview, "_blank")}
                >
                  {/* File Info */}
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

                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // prevent opening file
                      removeFile(idx);
                    }}
                    className="p-1 hover:bg-white/10 rounded-full text-gray-400 hover:text-red-400"
                  >
                    <X size={18} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default UploadZone;
