import { useEffect, useRef } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link"],
    ["clean"],
  ],
};

const formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "link",
];

export function RichTextEditor({
  id,
  name,
  value,
  onChange,
  placeholder = "Nhập nội dung...",
  className,
}: RichTextEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Fix accessibility issue: Quill generates form elements without id/name attributes
  useEffect(() => {
    if (containerRef.current) {
      const formElements = containerRef.current.querySelectorAll(
        "select, input"
      );
      formElements.forEach((element, index) => {
        const el = element as HTMLSelectElement | HTMLInputElement;
        if (!el.id) {
          el.id = `${id || name || "quill"}-toolbar-${el.className.replace(/\s+/g, "-")}-${index}`;
        }
        if (!el.name) {
          el.name = el.id;
        }
      });
    }
  }, [id, name]);

  return (
    <div ref={containerRef} id={id} className={cn("rich-text-editor", className)}>
      <style>{`
        .rich-text-editor .ql-container {
          min-height: 150px;
          font-size: 14px;
          border-bottom-left-radius: 0.375rem;
          border-bottom-right-radius: 0.375rem;
        }
        .rich-text-editor .ql-toolbar {
          border-top-left-radius: 0.375rem;
          border-top-right-radius: 0.375rem;
          background: hsl(var(--muted) / 0.3);
        }
        .rich-text-editor .ql-container,
        .rich-text-editor .ql-toolbar {
          border-color: hsl(var(--input));
        }
        .rich-text-editor .ql-editor {
          font-family: inherit;
        }
        .rich-text-editor .ql-editor.ql-blank::before {
          color: hsl(var(--muted-foreground));
          font-style: normal;
        }
        .rich-text-editor:focus-within .ql-container,
        .rich-text-editor:focus-within .ql-toolbar {
          border-color: hsl(var(--ring));
        }
      `}</style>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
    </div>
  );
}

export default RichTextEditor;
