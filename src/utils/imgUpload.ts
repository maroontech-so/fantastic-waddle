// Utility to upload images to ImgBB and return the URL
export const IMGBB_API_KEY = '227b454223cfd2b2e4b773a520ebb80d';

export async function uploadToImgBB(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload image to ImgBB');
  }

  const data = await response.json();
  if (data && data.success && data.data && (data.data.url || data.data.display_url)) {
    return data.data.url || data.data.display_url;
  } else {
    throw new Error(data?.error?.message || 'Invalid response from ImgBB');
  }
}
