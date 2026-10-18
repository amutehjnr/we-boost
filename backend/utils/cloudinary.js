const cloudinary = require('cloudinary').v2;

function configureCloudinary() {
  const cloud_name = (process.env.CLOUDINARY_CLOUD_NAME || '').trim();
  const api_key = (process.env.CLOUDINARY_API_KEY || '').trim();
  const api_secret = (process.env.CLOUDINARY_API_SECRET || '').trim();

  // Support single CLOUDINARY_URL if provided (cloudinary://key:secret@cloud_name)
  if (process.env.CLOUDINARY_URL) {
    cloudinary.config({ secure: true });
    return true;
  }

  if (!cloud_name || !api_key || !api_secret) {
    return false;
  }

  cloudinary.config({
    cloud_name,
    api_key,
    api_secret,
    secure: true,
  });
  return true;
}

/**
 * Upload an image buffer to Cloudinary.
 * Uses base64 data URI — more reliable on Vercel serverless than upload_stream.
 */
async function uploadProofImage(file) {
  const ok = configureCloudinary();
  if (!ok && !process.env.CLOUDINARY_URL) {
    throw new Error(
      'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET on the backend.'
    );
  }

  const buffer = Buffer.isBuffer(file) ? file : file.buffer;
  const mimetype = file.mimetype || 'image/jpeg';

  if (!buffer || !buffer.length) {
    throw new Error('Empty image file.');
  }

  const dataUri = `data:${mimetype};base64,${buffer.toString('base64')}`;

  try {
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: 'weboost/task-proofs',
      resource_type: 'image',
      overwrite: false,
    });

    if (!result?.secure_url) {
      throw new Error('Cloudinary did not return a secure URL.');
    }

    return result;
  } catch (err) {
    const msg =
      err?.error?.message ||
      err?.message ||
      'Cloudinary upload failed';
    console.error('Cloudinary upload failed:', err);
    throw new Error(msg);
  }
}

module.exports = { cloudinary, uploadProofImage, configureCloudinary };