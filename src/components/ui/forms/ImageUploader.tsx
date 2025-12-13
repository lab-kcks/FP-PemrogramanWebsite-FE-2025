import { useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";

interface ImageUploaderProps {
  onFileSelect: (file: File) => void;
  selectedFile?: File | null;
}

export default function ImageUploader({
  onFileSelect,
  selectedFile,
}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file");
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Call callback
      onFileSelect(file);
    }
  };

  return (
    <div className="w-full">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition">
        {preview || selectedFile ? (
          <div className="space-y-4">
            <img
              src={preview || URL.createObjectURL(selectedFile!)}
              alt="Preview"
              className="w-32 h-32 object-cover mx-auto rounded"
            />
            <Typography variant="small" className="text-gray-600">
              {selectedFile?.name}
            </Typography>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setPreview(null);
                const input = document.getElementById(
                  "image-input",
                ) as HTMLInputElement;
                if (input) input.value = "";
              }}
            >
              Change Image
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="w-8 h-8 mx-auto text-gray-400" />
            <Typography variant="small" className="text-gray-600">
              Click to upload or drag and drop
            </Typography>
            <Typography variant="small" className="text-gray-400">
              PNG, JPG, GIF up to 10MB
            </Typography>
          </div>
        )}
        <input
          id="image-input"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
}
