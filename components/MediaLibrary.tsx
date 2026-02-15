import React, { useState, useEffect, useRef } from 'react';
import { Media } from '../types';
import api from '../services/api';

interface MediaLibraryProps {
    onSelect?: (url: string) => void;
    selectionMode?: boolean;
}

const MediaLibrary: React.FC<MediaLibraryProps> = ({ onSelect, selectionMode = false }) => {
    const [media, setMedia] = useState<Media[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchMedia = async (page = 1) => {
        setIsLoading(true);
        try {
            const response = await api.get(`/media?page=${page}&limit=20`);
            setMedia(response.data.media);
            setPagination(response.data.pagination);
        } catch (error) {
            console.error('Failed to fetch media:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMedia(1);
    }, []);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            await api.post('/media', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            fetchMedia(1); // Refresh list
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Failed to upload file');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this file?')) return;
        try {
            await api.delete(`/media/${id}`);
            fetchMedia(pagination.page);
        } catch (error) {
            alert('Failed to delete media');
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-slate-100 dark:border-white/5">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Media Library</h3>
                <div className="flex items-center gap-2">
                    <input
                        type="file"
                        title="Upload media"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*,video/*"
                        onChange={handleFileUpload}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                        {isUploading ? (
                            <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></span>
                        ) : (
                            <span className="material-icons text-sm">cloud_upload</span>
                        )}
                        Upload Media
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {isLoading ? (
                    Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className="aspect-square bg-slate-100 dark:bg-white/5 rounded-xl animate-pulse"></div>
                    ))
                ) : media.length > 0 ? (
                    media.map((item) => (
                        <div key={item.id} className="group relative aspect-square bg-slate-50 dark:bg-white/5 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 hover:border-primary transition-colors cursor-pointer"
                            onClick={() => selectionMode && onSelect && onSelect(item.filePath)}
                        >
                            {item.fileType === 'image' ? (
                                <img src={item.filePath} alt={item.fileName} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                                    <span className="material-icons text-4xl">description</span>
                                    <span className="text-xs mt-2 uppercase font-bold">{item.fileName.split('.').pop()}</span>
                                </div>
                            )}

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                                <div className="flex justify-end">
                                    {!selectionMode && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                                            className="text-white/70 hover:text-red-400 transition-colors"
                                            title="Delete"
                                        >
                                            <span className="material-icons text-sm">delete</span>
                                        </button>
                                    )}
                                </div>
                                <div>
                                    <p className="text-white text-xs truncate font-medium">{item.fileName}</p>
                                    <p className="text-white/60 text-[10px]">{formatFileSize(item.fileSize)}</p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-12 text-center text-slate-500 italic">No media files found. Upload some!</div>
                )}
            </div>

            {pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                    <button
                        disabled={pagination.page === 1}
                        onClick={() => fetchMedia(pagination.page - 1)}
                        className="p-2 rounded-lg bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-white/5"
                    >
                        <span className="material-icons text-sm">chevron_left</span>
                    </button>
                    <span className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400">
                        Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                        disabled={pagination.page === pagination.totalPages}
                        onClick={() => fetchMedia(pagination.page + 1)}
                        className="p-2 rounded-lg bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-white/5"
                    >
                        <span className="material-icons text-sm">chevron_right</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default MediaLibrary;
