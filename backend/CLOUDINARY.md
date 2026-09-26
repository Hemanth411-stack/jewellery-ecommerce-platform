# Product media setup

Add these values from your Cloudinary product environment to `backend/.env`:

```dotenv
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Restart the backend. Do not put these credentials in frontend environment files.

All three values must come from the same Cloudinary product environment. A `cloud_name mismatch` error means the cloud name does not match the API credentials. Use `node scripts/checkCloudinary.js` from `backend` to check connectivity without uploading files.

In Admin → Products, upload images and videos normally. The admin-only multipart endpoint uploads each file to Cloudinary before adding its HTTPS URL to the form. Save the product to retain those URLs in MongoDB. Images are converted to WebP at quality 90, without resizing the full product image. Cart and wishlist use smaller Cloudinary delivery transformations. Videos keep their uploaded format; MP4 is recommended for browser playback.

Application limits: 10 MB per image and 50 MB per video. Your Cloudinary account's limits also apply. Ensure any reverse proxy permits 50 MB multipart requests. Missing credentials or upload failures show an error instead of silently storing base64 files in MongoDB.

## Existing products

Uploading or changing embedded base64 images/videos moves them to Cloudinary. Price, stock and other text-only edits skip unchanged media entirely. Use the migration command below to move existing media without editing products. Ordinary external image/video URLs stay unchanged.

For all existing products, run from `backend`:

```powershell
npm run media:migrate
npm run media:migrate -- --apply
```

The first command is read-only and reports how many products need migration. The second uploads media and replaces the product's media fields only after successful uploads. Concurrently edited products are skipped; rerun to process them. Completed products are skipped automatically on future runs. Content-based upload IDs avoid duplicate assets when retrying the same file.

Product deletion or removal of media does not delete Cloudinary assets automatically, so historical order images remain available. Uploads from abandoned forms may remain in Cloudinary. Historical order snapshots containing base64 images are not rewritten by the product migration.

Reference: [Cloudinary Node.js uploads](https://cloudinary.com/documentation/node_image_and_video_upload).
