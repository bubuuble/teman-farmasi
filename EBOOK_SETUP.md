# E-Book Feature Setup Guide

## ✅ What's Been Created

### 1. **E-Book Schema** (`sanity/schemas/ebook.ts`)
- Categories based on mentor expertise areas:
  - Cosmetic Formulation
  - R&D
  - Pharmapreneur
  - Cosmetic Sciences
  - Research
  - International Programs
  - Public Education
  - Chemistry
  - Natural Products
  - Microbiology
  - Pharmacology
  - Metodologi Penelitian
  - Statistika
  - Academic Writing
  - Farmakologi
  - Farmasetika
  - Kimia Farmasi
  - Farmasi Klinik
  - Lainnya

### 2. **E-Book Page** (`app/ebooks/page.tsx`)
- Hero section with statistics
- Category filter display
- Responsive design matching homepage style
- CTA section for downloads

### 3. **E-Book Grid Component** (`app/ebooks/EBookGrid.tsx`)
- Card-based layout
- Category badges with color coding
- Download functionality
- Featured badge for popular ebooks
- Responsive grid (1/2/3 columns)

### 4. **Sanity Queries** (`lib/sanity-queries.ts`)
- `getAllEBooks()` - Get all ebooks sorted by featured and published date

### 5. **Seed Data** (`seed-ebooks.js`)
- 13 sample e-books across different categories
- Based on mentor expertise areas
- Ready to seed to Sanity

## 🚀 How to Use

### Step 1: Seed Sample E-Books
```bash
node seed-ebooks.js
```

### Step 2: Upload PDF Files in Sanity Studio
1. Go to `http://localhost:3000/studio`
2. Navigate to "E-Books" section
3. For each e-book:
   - Upload a cover image (recommended: 600x800px)
   - Upload the PDF file
   - Save changes

### Step 3: Access the E-Book Page
Visit: `http://localhost:3000/ebooks`

## 📝 How to Add New E-Books

### Via Sanity Studio (Recommended)
1. Go to Sanity Studio
2. Click "E-Books" in the sidebar
3. Click "Create new E-Book"
4. Fill in all required fields:
   - Title
   - Slug (auto-generated)
   - Description
   - Category (select from dropdown)
   - Author
   - Cover Image (upload)
   - PDF File (upload)
   - Number of Pages (optional)
   - File Size (optional)
   - Published Date
   - Featured (checkbox)
5. Click "Publish"

### Via Seed File
Add new entries to the `ebooks` array in `seed-ebooks.js` and run:
```bash
node seed-ebooks.js
```

## 🎨 Design Features

### Homepage-Matched Styling
- Same color scheme (brand-pink, brand-cream, brand-dark)
- Consistent rounded borders and shadows
- Matching hover effects
- Same typography and spacing

### Category Colors
Each category has a unique color badge for easy identification.

### Download Flow
- Click "Download Gratis" button
- PDF opens in new tab
- Can save or view directly

## 📱 Responsive Design
- Mobile: 1 column grid
- Tablet: 2 column grid
- Desktop: 3 column grid

## 🔧 Customization

### Update Categories
Edit `sanity/schemas/ebook.ts` and modify the category list.

### Change Colors
Edit `app/ebooks/EBookGrid.tsx` and update the `categoryColors` object.

### Modify Layout
Edit `app/ebooks/EBookGrid.tsx` for card design
Edit `app/ebooks/page.tsx` for page layout

## 📊 Features Included
✅ Free PDF downloads
✅ Category filtering (display only)
✅ Featured e-books
✅ Download statistics
✅ File size and page count display
✅ Author attribution
✅ Responsive design
✅ CMS integration
✅ SEO-friendly URLs

## 🔮 Future Enhancements (Optional)
- Add category filtering functionality
- Add search bar
- Add sorting options
- Track download counts automatically
- Add user reviews/ratings
- Add email capture before download
- Add related e-books section
