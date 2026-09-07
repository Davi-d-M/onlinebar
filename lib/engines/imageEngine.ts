/**
 * ONLINE BAR: IMAGE QUALITY ENGINE
 * Logic to validate, score, and optimize product photography.
 */

export interface ImageAuditResult {
    score: number; // 0-100
    width: number;
    height: number;
    format: string;
    aspectRatio: number;
    issues: string[];
    isApproved: boolean;
}

const MIN_RESOLUTION = 1200;
const PREFERRED_RESOLUTION = 2000;

/**
 * Analyzes a file/image and returns a quality score and metadata
 */
export async function auditImageQuality(file: File): Promise<ImageAuditResult> {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const width = img.width;
                const height = img.height;
                const format = file.type.split('/')[1] || 'unknown';
                const aspectRatio = width / height;
                const issues: string[] = [];
                let score = 100;

                // 1. Resolution Check
                if (width < MIN_RESOLUTION || height < MIN_RESOLUTION) {
                    score -= 40;
                    issues.push(`Resolution too low: ${width}x${height}px. Min 1200px required.`);
                } else if (width < PREFERRED_RESOLUTION || height < PREFERRED_RESOLUTION) {
                    score -= 10;
                    issues.push(`Resolution sub-optimal. 2000px+ recommended for zoom clarity.`);
                }

                // 2. Aspect Ratio (Bar Standard is 1:1 or 4:5)
                if (aspectRatio < 0.75 || aspectRatio > 1.25) {
                    score -= 20;
                    issues.push(`Non-standard aspect ratio: ${aspectRatio.toFixed(2)}. Square (1:1) is preferred.`);
                }

                // 3. Format Check
                if (!['jpeg', 'png', 'webp', 'avif'].includes(format)) {
                    score -= 30;
                    issues.push(`Unoptimized format: ${format}. Use WebP or AVIF for better performance.`);
                }

                // 4. File Size (Extreme compression or raw bloat)
                const sizeMB = file.size / (1024 * 1024);
                if (sizeMB < 0.05) {
                    score -= 20;
                    issues.push("File size too small. Likely heavily compressed/blurry.");
                } else if (sizeMB > 5) {
                    score -= 10;
                    issues.push("File size excessive. Optimize for faster mobile loading.");
                }

                resolve({
                    score: Math.max(0, score),
                    width,
                    height,
                    format,
                    aspectRatio,
                    issues,
                    isApproved: score >= 60
                });
            };
            img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    });
}

/**
 * Normalizes an image to the Online Bar Standard Canvas
 * (Centering, Padding, Consistent Background)
 */
export async function standardizeImageCanvas(file: File): Promise<Blob> {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            const size = Math.max(img.width, img.height);
            canvas.width = size;
            canvas.height = size;

            if (ctx) {
                // Fill White Background (Standard Bar Aesthetic)
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, size, size);

                // Draw Image Centered with 10% padding
                const padding = size * 0.1;
                const drawSize = size - (padding * 2);

                let dx = padding;
                let dy = padding;
                let dWidth = drawSize;
                let dHeight = drawSize;

                if (img.width > img.height) {
                    dHeight = (img.height / img.width) * drawSize;
                    dy = (size - dHeight) / 2;
                } else {
                    dWidth = (img.width / img.height) * drawSize;
                    dx = (size - dWidth) / 2;
                }

                ctx.drawImage(img, dx, dy, dWidth, dHeight);

                canvas.toBlob((blob) => {
                    if (blob) resolve(blob);
                }, 'image/webp', 0.9);
            }
        };

        const reader = new FileReader();
        reader.onload = (e) => {
            img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    });
}
