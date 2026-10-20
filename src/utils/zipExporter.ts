import JSZip from 'jszip';
import { ANDROID_SOURCE_FILES } from '../data/androidSourceFiles';

export async function generateAndroidProjectZip(): Promise<Blob> {
  const zip = new JSZip();

  // Root folder inside the zip
  const root = zip.folder('StTV');
  if (!root) throw new Error('Could not create StTV root folder in zip');

  // Add all Android files
  for (const file of ANDROID_SOURCE_FILES) {
    root.file(file.path, file.content);
  }

  // Generate binary zip blob
  return await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 }
  });
}

export function triggerDownload(blob: Blob, filename = 'StTV_Android_TV_Project.zip') {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
