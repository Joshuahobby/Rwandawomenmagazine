import multer from 'multer';
import path from 'path';
import type { Request, Response, NextFunction } from 'express';

const storage = multer.memoryStorage();

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowed = /jpeg|jpg|png|gif|webp|avif|svg|pdf|mp4|webm/;
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    if (allowed.test(ext)) {
        cb(null, true);
    } else {
        cb(new Error(`Unsupported file type: .${ext || 'unknown'}`));
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

/**
 * multer signals a rejected type or an oversized file by throwing, which the
 * app's generic handler turns into an opaque 500 ("Internal server error").
 * The editor uploads inline images through this route, so the author needs to
 * see the actual reason.
 */
export const uploadSingleFile = (field: string) => (
    (req: Request, res: Response, next: NextFunction) => {
        upload.single(field)(req, res, (err: unknown) => {
            if (!err) return next();
            const message = err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE'
                ? 'File is too large — the limit is 10MB.'
                : (err as Error)?.message || 'Upload failed.';
            return res.status(400).json({ error: message });
        });
    }
);
