"use client";

import { useState, useEffect } from "react";
import { toast } from "@/lib/hooks/useToast";

interface FileItem {
  name: string;
  path: string;
  type: "file" | "directory";
  size?: number;
  extension?: string;
  modified?: Date;
}

interface FileManagerProps {
  initialPath?: string;
}

export default function FileManager({ initialPath = "" }: FileManagerProps) {
  const [currentPath, setCurrentPath] = useState(initialPath);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState<"file" | "directory">("file");
  const [createName, setCreateName] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Load files for current path
  const loadFiles = async (path: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/files/list?path=${encodeURIComponent(path)}`);
      if (!response.ok) throw new Error("Failed to load files");
      const data = await response.json();
      setFiles(data.files || []);
    } catch (error) {
      console.error("Error loading files:", error);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles(currentPath);
  }, [currentPath]);

  // Navigate to directory
  const navigateTo = (path: string) => {
    setCurrentPath(path);
    setSelectedFile(null);
    setFileContent("");
    setIsEditing(false);
  };

  // Navigate up one level
  const navigateUp = () => {
    if (!currentPath) return;
    const parts = currentPath.split("/").filter(Boolean);
    parts.pop();
    setCurrentPath(parts.join("/"));
  };

  // Read file content
  const readFile = async (path: string) => {
    try {
      const response = await fetch(`/api/files/read?path=${encodeURIComponent(path)}`);
      if (!response.ok) throw new Error("Failed to read file");
      const data = await response.json();
      setFileContent(data.content);
      setSelectedFile(path);
      setIsEditing(false);
    } catch (error) {
      console.error("Error reading file:", error);
    }
  };

  // Save file content
  const saveFile = async () => {
    if (!selectedFile) return;
    try {
      const response = await fetch("/api/files/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: selectedFile,
          content: fileContent,
        }),
      });
      if (!response.ok) throw new Error("Failed to save file");
      setIsEditing(false);
      loadFiles(currentPath); // Refresh file list
    } catch (error) {
      console.error("Error saving file:", error);
      toast.error("Failed to save file");
    }
  };

  // Delete file or directory
  const deleteItem = async (path: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      const response = await fetch("/api/files/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path }),
      });
      if (!response.ok) throw new Error("Failed to delete");
      if (selectedFile === path) {
        setSelectedFile(null);
        setFileContent("");
      }
      loadFiles(currentPath);
    } catch (error) {
      console.error("Error deleting:", error);
      toast.error("Failed to delete item");
    }
  };

  // Create file or directory
  const createItem = async () => {
    if (!createName) return;
    const newPath = currentPath 
      ? `${currentPath}/${createName}`
      : createName;
    try {
      const response = await fetch("/api/files/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: newPath,
          type: createType,
          content: createType === "file" ? "" : undefined,
        }),
      });
      if (!response.ok) throw new Error("Failed to create");
      setShowCreateModal(false);
      setCreateName("");
      loadFiles(currentPath);
      if (createType === "file") {
        readFile(newPath);
        setIsEditing(true);
      }
    } catch (error) {
      console.error("Error creating:", error);
      toast.error("Failed to create item");
    }
  };

  // Upload file
  const handleUpload = async (file?: File) => {
    const fileToUpload = file || uploadFile;
    if (!fileToUpload) return;
    const formData = new FormData();
    formData.append("file", fileToUpload);
    formData.append("path", currentPath);
    try {
      const response = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to upload");
      setShowUploadModal(false);
      setUploadFile(null);
      loadFiles(currentPath);
    } catch (error) {
      console.error("Error uploading:", error);
      toast.error("Failed to upload file");
    }
  };

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes("Files")) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only hide if we're leaving the main container
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      // Upload all files to current path
      for (const file of files) {
        await handleUpload(file);
      }
    }
  };

  // Format file size
  const formatSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Get file icon
  const getFileIcon = (item: FileItem) => {
    if (item.type === "directory") return "📁";
    const ext = item.extension?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "")) return "🖼️";
    if (["mp4", "webm", "mov", "avi"].includes(ext || "")) return "🎬";
    if (["glb", "gltf", "obj", "fbx"].includes(ext || "")) return "🎨";
    if (["md"].includes(ext || "")) return "📝";
    return "📄";
  };

  const pathParts = currentPath ? currentPath.split("/").filter(Boolean) : [];

  return (
    <>
      {/* Drag overlay - covers entire area */}
      {isDragging && (
        <div 
          className="fixed inset-0 bg-ember/30 border-4 border-dashed border-ember-glow z-50 flex items-center justify-center backdrop-blur-sm"
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="bg-shadow border-2 border-ember-glow rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">📤</div>
            <p className="text-2xl font-bold text-ember-glow">Drop files to upload</p>
            <p className="text-text-secondary mt-2">
              Files will be uploaded to: <code className="text-ember-glow">public/{currentPath || ""}</code>
            </p>
          </div>
        </div>
      )}

      {/* Main content with drag handlers */}
      <div 
        className="flex h-full gap-4 relative"
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >

      {/* File Browser */}
      <div className="w-1/3 border-r border-border bg-shadow p-4 overflow-y-auto">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-glow mb-2">File Browser</h2>
          
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-text-secondary mb-4">
            <button
              onClick={() => navigateTo("")}
              className="hover:text-ember-glow transition-colors"
            >
              public
            </button>
            {pathParts.map((part, index) => (
              <span key={index} className="flex items-center gap-2">
                <span>/</span>
                <button
                  onClick={() => navigateTo(pathParts.slice(0, index + 1).join("/"))}
                  className="hover:text-ember-glow transition-colors"
                >
                  {part}
                </button>
              </span>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2 mb-4">
            {currentPath && (
              <button
                onClick={navigateUp}
                className="btn-secondary text-sm px-3 py-1"
              >
                ↑ Up
              </button>
            )}
            <button
              onClick={() => {
                setCreateType("directory");
                setShowCreateModal(true);
              }}
              className="btn-secondary text-sm px-3 py-1"
            >
              + Folder
            </button>
            <button
              onClick={() => {
                setCreateType("file");
                setShowCreateModal(true);
              }}
              className="btn-secondary text-sm px-3 py-1"
            >
              + File
            </button>
            <button
              onClick={() => setShowUploadModal(true)}
              className="btn text-sm px-3 py-1"
            >
              📤 Upload
            </button>
          </div>
        </div>

        {/* File List */}
        {loading ? (
          <div className="text-text-muted">Loading...</div>
        ) : (
          <div className="space-y-1">
            {files.map((item) => (
              <div
                key={item.path}
                className={`flex items-center justify-between p-2 rounded-lg hover:bg-deep transition-colors ${
                  selectedFile === item.path ? "bg-deep border border-ember-glow" : ""
                }`}
              >
                <button
                  onClick={() => {
                    if (item.type === "directory") {
                      navigateTo(item.path);
                    } else {
                      readFile(item.path);
                    }
                  }}
                  className="flex items-center gap-2 flex-1 text-left"
                >
                  <span className="text-xl">{getFileIcon(item)}</span>
                  <span className="text-text-secondary">{item.name}</span>
                </button>
                <div className="flex items-center gap-2">
                  {item.size && (
                    <span className="text-xs text-text-muted">
                      {formatSize(item.size)}
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteItem(item.path);
                    }}
                    className="text-text-muted hover:text-red-500 transition-colors px-2"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
            {files.length === 0 && (
              <div className="text-text-muted text-center py-8">
                Empty directory
              </div>
            )}
          </div>
        )}
      </div>

      {/* File Viewer/Editor */}
      <div className="flex-1 p-4 overflow-y-auto">
        {selectedFile ? (
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-glow">{selectedFile.split("/").pop()}</h3>
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <button onClick={saveFile} className="btn">
                      💾 Save
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        readFile(selectedFile);
                      }}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button onClick={() => setIsEditing(true)} className="btn">
                    ✏️ Edit
                  </button>
                )}
              </div>
            </div>

            {/* File Preview */}
            {!isEditing && (
              <div className="flex-1">
                {selectedFile.endsWith(".md") ? (
                  <div className="prose prose-invert max-w-none">
                    <pre className="bg-shadow border border-border rounded-lg p-4 overflow-x-auto">
                      {fileContent}
                    </pre>
                  </div>
                ) : selectedFile.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                  <img
                    src={`/${selectedFile}`}
                    alt={selectedFile}
                    className="max-w-full h-auto rounded-lg border border-border"
                  />
                ) : selectedFile.match(/\.(mp4|webm|mov|avi)$/i) ? (
                  <video
                    src={`/${selectedFile}`}
                    controls
                    className="max-w-full rounded-lg border border-border"
                  />
                ) : selectedFile.match(/\.(glb|gltf|obj|fbx)$/i) ? (
                  <div className="bg-shadow border border-border rounded-lg p-8 text-center">
                    <div className="text-6xl mb-4">🎨</div>
                    <p className="text-text-secondary mb-4">
                      3D Model: {selectedFile.split("/").pop()}
                    </p>
                    <p className="text-sm text-text-muted">
                      Use a 3D viewer to preview this model
                    </p>
                    <a
                      href={`/${selectedFile}`}
                      download
                      className="btn mt-4 inline-block"
                    >
                      Download Model
                    </a>
                  </div>
                ) : (
                  <pre className="bg-shadow border border-border rounded-lg p-4 overflow-x-auto text-sm">
                    {fileContent || "Binary file - cannot preview"}
                  </pre>
                )}
              </div>
            )}

            {/* File Editor */}
            {isEditing && (
              <textarea
                value={fileContent}
                onChange={(e) => setFileContent(e.target.value)}
                className="flex-1 w-full bg-shadow border border-border rounded-lg p-4 text-text-primary font-mono text-sm resize-none"
                placeholder="File content..."
              />
            )}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-text-muted">
            Select a file to view or edit
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-shadow border border-border rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-glow mb-4">
              Create {createType === "directory" ? "Folder" : "File"}
            </h3>
            <input
              type="text"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              placeholder={`${createType === "directory" ? "Folder" : "File"} name`}
              className="w-full bg-deep border border-border rounded-lg px-4 py-2 text-text-primary mb-4"
              onKeyDown={(e) => {
                if (e.key === "Enter") createItem();
                if (e.key === "Escape") setShowCreateModal(false);
              }}
              autoFocus
            />
            <div className="flex gap-2">
              <button onClick={createItem} className="btn flex-1">
                Create
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setCreateName("");
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-shadow border border-border rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-glow mb-4">Upload File</h3>
            <input
              type="file"
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              className="w-full bg-deep border border-border rounded-lg px-4 py-2 text-text-primary mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={() => handleUpload()}
                disabled={!uploadFile}
                className="btn flex-1 disabled:opacity-50"
              >
                Upload
              </button>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadFile(null);
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}

