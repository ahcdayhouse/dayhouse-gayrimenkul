# Day House Gayrimenkul — Production Static Portal

Production website prepared for GitHub + Cloudflare Pages.

## Production architecture
- Static website in repository root; Cloudflare Pages needs no build command.
- Listings are stored in `data/ilanlar.json`.
- Listing media is stored physically under `assets/ilanlar/<listing-id>/`.
- Every published listing receives a clean, generated SEO URL under `ilan/<city>/<district>/<neighborhood>/<transaction-type>/<slug>/`.
- Listing save/update regenerates canonical metadata, Open Graph/Twitter metadata, Schema.org `RealEstateListing` + breadcrumb JSON-LD, and `sitemap.xml`.
- Customer pages read the physical JSON data; they do not depend on browser LocalStorage.

## Local CMS
The admin is intentionally local-only and is not committed/deployed. Use `START_DAYHOUSE.bat` from the local project package. The local CMS writes listings and media directly into the repository files, then `YAYINLA.bat` validates and pushes public changes to `main`.

Accepted upload inputs: JPG, JPEG, PNG, WEBP and MP4. Browser-side photo optimization converts image uploads to high-quality WEBP for web performance; MP4 files are preserved.

## Production domain
https://dayhousegayrimenkul.com/
