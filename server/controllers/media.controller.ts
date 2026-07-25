import { Request, Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/auth';
import cloudinary from '../config/cloudinary';

export const uploadMedia = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file provided' });
        }

        const ext = req.file.originalname.split('.').pop()?.toLowerCase() || '';
        let fileType = 'image';
        if (['pdf'].includes(ext)) fileType = 'pdf';
        if (['mp4', 'webm'].includes(ext)) fileType = 'video';

        // Upload to Cloudinary
        const result: any = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: fileType === 'video' ? 'video' : 'auto',
                    folder: 'rwanda-women-magazine',
                    public_id: req.file!.originalname.split('.')[0] + '-' + Date.now(),
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(req.file!.buffer);
        });

        const media = await prisma.media.create({
            data: {
                fileName: req.file.originalname,
                filePath: result.secure_url,
                fileType,
                fileSize: req.file.size,
                uploadedBy: req.user!.id,
            },
        });

        return res.status(201).json(media);
    } catch (error) {
        console.error('Upload error:', error);
        return res.status(500).json({ error: 'Upload failed' });
    }
};

export const listMedia = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
        const type = req.query.type as string;

        const where: any = {};
        if (type) where.fileType = type;

        const [media, total] = await Promise.all([
            prisma.media.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: { uploader: { select: { id: true, fullName: true } } },
            }),
            prisma.media.count({ where }),
        ]);

        return res.json({ media, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
    } catch (_error) {
        return res.status(500).json({ error: 'Failed to fetch media' });
    }
};

export const deleteMedia = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const media = await prisma.media.findUnique({ where: { id } });

        if (!media) {
            return res.status(404).json({ error: 'Media not found' });
        }

        // Delete from Cloudinary
        // Extract public_id from file path if it was uploaded to Cloudinary
        // Logic: find the folder name and extract everything after it until the extension
        const folderName = 'rwanda-women-magazine';
        if (media.filePath.includes(folderName)) {
            const parts = media.filePath.split('/');
            const folderIndex = parts.indexOf(folderName);
            if (folderIndex !== -1) {
                const publicIdWithExt = parts.slice(folderIndex).join('/');
                const publicId = publicIdWithExt.split('.').slice(0, -1).join('.');
                await cloudinary.uploader.destroy(publicId);
            }
        }

        await prisma.media.delete({ where: { id } });
        return res.json({ message: 'Media deleted' });
    } catch (error) {
        console.error('Delete media error:', error);
        return res.status(500).json({ error: 'Failed to delete media' });
    }
};
