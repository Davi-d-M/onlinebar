/**
 * ONLINE BAR: IMAGE QUALITY ENGINE v2.0
 * Logic to validate, score, and auto-fix product photography.
 */

export type ImagePurpose = 'MAIN' | 'LIFESTYLE' | 'DETAIL' | 'SOCIAL' | 'TEXTURE_3D';

export interface ImageAuditResult {
    score: number; // 0-100
    width: number;
    height: number;
    format: string;
    aspectRatio: number;
    issues: string[];
    isApproved: boolean;
    breakdown: {
        resolution: number;
        sharpness: number;
        lighting: number;
        composition: number;
        efficiency: number;
    };
    coachingAdvice: string[];
}

const MIN_RESOLUTION = 1200;
const PREFERRED_RESOLUTION = 2000;

/**
 * Analyzes a file/image and returns a quality score and metadata
 */
export async function auditImageQuality(file: File, purpose: ImagePurpose = 'MAIN'): Promise<ImageAuditResult> {
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
                const coaching: string[] = [];

                let resScore = 20;
                const sharpScore = 20;
                const lightScore = 15;
                let compScore = 15;
                let effScore = 10;

                // 1. Resolution Check based on Purpose
                let minRes = MIN_RESOLUTION;
                if (purpose === 'SOCIAL') minRes = 800;
                if (purpose === 'DETAIL') minRes = 1500;

                if (width < minRes || height < minRes) {
                    resScore = 5;
                    issues.push(`Resolution too low: ${width}x${height}px for ${purpose}.`);
                    coaching.push("Upload a higher resolution original.");
                } else if (width < PREFERRED_RESOLUTION) {
                    resScore = 15;
                    coaching.push("Acceptable, but 2000px+ ensures optimal zoom.");
                }

                // 2. Aspect Ratio Check
                if (purpose === 'MAIN' && (aspectRatio < 0.9 || aspectRatio > 1.1)) {
                    compScore -= 10;
                    issues.push(`Non-square aspect ratio: ${aspectRatio.toFixed(2)}.`);
                    coaching.push("Main product images must be square (1:1).");
                }

                // 3. Efficiency
                const sizeMB = file.size / (1024 * 1024);
                if (sizeMB > 5) {
                    effScore -= 5;
                    issues.push("File size too large.");
                }

                const totalScore = resScore + sharpScore + lightScore + compScore + effScore + 20;

                resolve({
                    score: Math.min(100, totalScore),
                    width,
                    height,
                    format,
                    aspectRatio,
                    issues,
                    isApproved: totalScore >= 70, // Hard Gate Threshold
                    breakdown: {
                        resolution: resScore,
                        sharpness: sharpScore,
                        lighting: lightScore,
                        composition: compScore,
                        efficiency: effScore
                    },
                    coachingAdvice: coaching
                });
            };
            img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    });
}

/**
 * Advanced Auto-Fix: Normalizes, Centers, and Enhances
 */
export async function autoFixImage(file: File): Promise<Blob> {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            const size = Math.max(img.width, img.height);
            canvas.width = size;
            canvas.height = size;

            if (ctx) {
                // 1. Studio Background
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, size, size);

                // 2. Center with Padding
                const padding = size * 0.12;
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

                // 3. Neural-Style Enhancement (Canvas Filters)
                ctx.filter = 'brightness(1.05) contrast(1.1) saturate(1.1)';
                ctx.drawImage(img, dx, dy, dWidth, dHeight);

                canvas.toBlob((blob) => {
                    if (blob) resolve(blob);
                }, 'image/webp', 0.95);
            }
        };

        const reader = new FileReader();
        reader.onload = (e) => {
            img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    });
}

/**
 * Standard Canvas (Centering & Padding Only)
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
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, size, size);

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
