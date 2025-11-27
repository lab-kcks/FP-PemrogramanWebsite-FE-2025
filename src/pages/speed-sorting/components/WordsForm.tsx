import { Button } from "@/components/ui/button";
import Dropzone from "@/components/ui/dropzone";
import { FormField } from "@/components/ui/form-field";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Typography } from "@/components/ui/typography";
import { Plus, Trash2 } from "lucide-react";

interface WordItem {
  text: string;
  categoryIndex: number;
  image?: File | null;
}

interface WordsFormProps {
  words: WordItem[];
  categories: string[];
  formErrors: Record<string, string>;
  onAddWord: () => void;
  onRemoveWord: (index: number) => void;
  onUpdateWord: (
    index: number,
    field: keyof WordItem,
    value: string | number | File | null,
  ) => void;
  onClearError: (key: string) => void;
}

export function WordsForm({
  words,
  categories,
  formErrors,
  onAddWord,
  onRemoveWord,
  onUpdateWord,
  onClearError,
}: WordsFormProps) {
  return (
    <div className="bg-white w-full p-6 space-y-6 rounded-xl border">
      <div className="flex items-center justify-between">
        <Typography variant="p">Words ({words.length})</Typography>
        <Button
          variant="outline"
          size="sm"
          onClick={onAddWord}
          disabled={words.length >= 20}
          type="button"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Word
        </Button>
      </div>
      <div className="space-y-4">
        {words.map((word, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center gap-2">
              <Typography variant="p" className="font-medium">
                Word {index + 1}
              </Typography>
              {words.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-auto"
                  onClick={() => onRemoveWord(index)}
                  type="button"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FormField
                  required
                  label="Word"
                  placeholder="Enter word"
                  type="text"
                  value={word.text}
                  onChange={(e) => onUpdateWord(index, "text", e.target.value)}
                  className={
                    formErrors[`words.${index}.text`]
                      ? "border-red-500 bg-red-50"
                      : "bg-[#F3F3F5]"
                  }
                />
                {formErrors[`words.${index}.text`] && (
                  <div className="text-sm text-red-500 mt-1">
                    {formErrors[`words.${index}.text`]}
                  </div>
                )}
              </div>

              <div className="grid w-full items-center gap-1.5">
                <Label className="flex items-center gap-1">
                  Category
                  <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={word.categoryIndex.toString()}
                  onValueChange={(value) =>
                    onUpdateWord(index, "categoryIndex", parseInt(value))
                  }
                >
                  <SelectTrigger
                    className={`w-full ${
                      formErrors[`words.${index}.categoryIndex`]
                        ? "border-red-500 bg-red-50"
                        : "bg-[#F3F3F5]"
                    }`}
                  >
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category, categoryIndex) => (
                      <SelectItem
                        key={categoryIndex}
                        value={categoryIndex.toString()}
                        disabled={category.trim() === ""}
                      >
                        {category.trim() ||
                          `Category ${categoryIndex + 1} (empty)`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors[`words.${index}.categoryIndex`] && (
                  <div className="text-sm text-red-500 mt-1">
                    {formErrors[`words.${index}.categoryIndex`]}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4">
              <Dropzone
                label="Word Image (Optional)"
                required={false}
                maxSize={5 * 1024 * 1024}
                allowedTypes={[
                  "image/png",
                  "image/jpeg",
                  "image/jpg",
                  "image/webp",
                ]}
                defaultValue={word.image}
                onChange={(file) => {
                  onUpdateWord(index, "image", file);
                  onClearError(`words.${index}.image`);
                }}
              />
              {formErrors[`words.${index}.image`] && (
                <div className="text-sm text-red-500 mt-1">
                  {formErrors[`words.${index}.image`]}
                </div>
              )}
            </div>
          </div>
        ))}
        {formErrors.words && (
          <div className="text-sm text-red-500 mt-1">{formErrors.words}</div>
        )}

        {Object.entries(formErrors).map(([key, error]) => {
          if (key.startsWith("category.") && key.endsWith(".words")) {
            return (
              <div key={key} className="text-sm text-red-500 mt-1">
                {error}
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}
