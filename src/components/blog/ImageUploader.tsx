import React, { useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageUploaderProps {
    onImageSelect: (file: File) => void;
    currentImage?: string;
    onRemoveImage?: () => void;
    uploading?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
    onImageSelect,
    currentImage,
    onRemoveImage,
    uploading = false,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            onImageSelect(file);
        }
    };

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Featured Image</label>

            {currentImage ? (
                <div className="relative">
                    <img
                        src={currentImage}
                        alt="Featured"
                        className="w-full h-64 object-cover rounded-lg border border-slate-200"
                    />
                    {onRemoveImage && (
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={onRemoveImage}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            ) : (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center cursor-pointer hover:border-slate-400 transition-colors"
                >
                    <Upload className="w-12 h-12 mx-auto text-slate-400 mb-2" />
                    <p className="text-sm text-slate-600">
                        {uploading ? 'Uploading...' : 'Click to upload image'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 10MB</p>
                </div>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
            />
        </div>
    );
};
