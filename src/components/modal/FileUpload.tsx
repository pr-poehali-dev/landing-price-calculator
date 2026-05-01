import { useRef } from "react";
import Icon from "@/components/ui/icon";
import { FileItem, formatSize } from "./types";

interface FileUploadProps {
  files: FileItem[];
  loading: boolean;
  progress: number;
  onFiles: (files: FileList | null) => void;
  onRemove: (index: number) => void;
}

export default function FileUpload({ files, loading, progress, onFiles, onRemove }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onFiles(e.dataTransfer.files);
  };

  return (
    <>
      <div
        className="rounded cursor-pointer flex flex-col items-center justify-center gap-2 py-6"
        style={{
          border: "1px dashed var(--border-c)",
          background: "var(--bg)",
          pointerEvents: loading ? "none" : "auto",
        }}
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <Icon name="Upload" size={20} style={{ color: "var(--blue)" }} />
        <span className="text-xs font-body" style={{ color: "var(--text-muted)" }}>
          Нажмите или перетащите файлы
        </span>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => onFiles(e.target.files)}
        />
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((f, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-3 py-2 rounded text-xs font-body"
              style={{ background: "var(--bg)", color: "var(--text)" }}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <Icon name="FileText" size={14} style={{ color: "var(--blue)", flexShrink: 0 }} />
                <span className="truncate">{f.name}</span>
                <span style={{ color: "var(--text-muted)", flexShrink: 0 }}>{formatSize(f.size)}</span>
              </div>
              {!loading && (
                <button
                  type="button"
                  onClick={() => onRemove(i)}
                  style={{ color: "var(--text-muted)" }}
                  className="ml-2 flex-shrink-0"
                >
                  <Icon name="X" size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {loading && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-body" style={{ color: "var(--text-muted)" }}>
            <span>{progress < 100 ? "Загружаем файлы..." : "Обрабатываем..."}</span>
            <span>{progress < 100 ? `${progress}%` : ""}</span>
          </div>
          <div className="w-full rounded-full h-1" style={{ background: "var(--border-c)" }}>
            <div
              className="h-1 rounded-full transition-all duration-300"
              style={{ width: `${progress}%`, background: "var(--blue)" }}
            />
          </div>
        </div>
      )}
    </>
  );
}
