import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { productApi } from '../../../api/productApi';
import { sellerApi } from '../../../api/sellerApi';
import { useAuth } from '../../../context/AuthContext';
import { extractApiError } from '../../../utils/formatters';
import ErrorMessage from '../../../components/ErrorMessage';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export default function AddProduct() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'pottery',
    price: '',
    location: user?.location || '',
    is_available: true,
  });
  const [primaryImage, setPrimaryImage] = useState(null);
  const [primaryPreview, setPrimaryPreview] = useState('');
  const [galleryImages, setGalleryImages] = useState([]);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    productApi
      .getCategories()
      .then((res) => setCategories(res.data))
      .catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const validateFile = (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Only JPEG, PNG, and WebP images are supported.';
    }
    if (file.size > MAX_SIZE_BYTES) {
      return 'Image size must not exceed 5 MB.';
    }
    return '';
  };

  const handlePrimaryImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fileErr = validateFile(file);
    if (fileErr) {
      setFieldErrors((prev) => ({ ...prev, image: fileErr }));
      return;
    }
    setFieldErrors((prev) => ({ ...prev, image: '' }));
    setPrimaryImage(file);
    setPrimaryPreview(URL.createObjectURL(file));
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const validFiles = [];
    for (const file of files.slice(0, 5)) {
      const fileErr = validateFile(file);
      if (fileErr) {
        setError(`Gallery upload error (${file.name}): ${fileErr}`);
        return;
      }
      validFiles.push(file);
    }
    setError('');
    setGalleryImages((prev) => [...prev, ...validFiles].slice(0, 5));
  };

  const removeGalleryImage = (index) => {
    setGalleryImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    const clientErrors = {};
    if (!formData.name.trim()) clientErrors.name = 'Product name is required.';
    if (!formData.description.trim()) clientErrors.description = 'Description is required.';
    if (!formData.price || Number(formData.price) <= 0) {
      clientErrors.price = 'Price must be a positive number greater than 0.';
    }
    if (!formData.location.trim()) clientErrors.location = 'Location is required.';
    if (!primaryImage) clientErrors.image = 'A primary product image is required.';

    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      setError('Please fix the highlighted fields before submitting.');
      return;
    }

    const payload = new FormData();
    payload.append('name', formData.name.trim());
    payload.append('description', formData.description.trim());
    payload.append('category', formData.category);
    payload.append('price', formData.price);
    payload.append('location', formData.location.trim());
    payload.append('is_available', formData.is_available);
    payload.append('image', primaryImage);
    galleryImages.forEach((img) => payload.append('gallery_images', img));

    setSubmitting(true);
    try {
      await sellerApi.createProduct(payload);
      navigate('/seller/products', { replace: true });
    } catch (err) {
      const parsed = extractApiError(err, 'Could not publish product.');
      setError(parsed.message);
      setFieldErrors(parsed.fieldErrors);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/seller/products"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Link>
        <h1 className="mt-2 font-serif text-2xl font-semibold text-ink sm:text-3xl">
          Publish Handcrafted Product
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Provide accurate material, sizing, and pricing details for prospective buyers.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card-surface space-y-6 p-6 sm:p-8">
        <ErrorMessage message={error} />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="name" className="block text-sm font-medium text-ink">
              Product Title *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Hand-Painted Jaipur Blue Pottery Vase"
              className="input-field mt-1"
            />
            {fieldErrors.name && <p className="mt-1 text-xs text-red-700">{fieldErrors.name}</p>}
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-ink">
              Craft Category *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="input-field mt-1"
            >
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))
              ) : (
                <>
                  <option value="pottery">Pottery &amp; Ceramics</option>
                  <option value="textiles">Textiles &amp; Handloom</option>
                  <option value="woodwork">Woodwork &amp; Carving</option>
                  <option value="metalwork">Metalwork &amp; Brass</option>
                  <option value="jewelry">Handcrafted Jewelry</option>
                  <option value="leather">Leather Craft</option>
                  <option value="painting">Paintings &amp; Folk Art</option>
                  <option value="basketry">Basketry &amp; Natural Fibers</option>
                  <option value="stonecraft">Stone &amp; Marble Craft</option>
                  <option value="other">Other Handmade Crafts</option>
                </>
              )}
            </select>
            {fieldErrors.category && (
              <p className="mt-1 text-xs text-red-700">{fieldErrors.category}</p>
            )}
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-ink">
              Price (INR) *
            </label>
            <input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="1"
              required
              value={formData.price}
              onChange={handleChange}
              placeholder="1500.00"
              className="input-field mt-1"
            />
            {fieldErrors.price && <p className="mt-1 text-xs text-red-700">{fieldErrors.price}</p>}
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="location" className="block text-sm font-medium text-ink">
              Origin / Workshop Location *
            </label>
            <input
              id="location"
              name="location"
              type="text"
              required
              value={formData.location}
              onChange={handleChange}
              placeholder="City, State"
              className="input-field mt-1"
            />
            {fieldErrors.location && (
              <p className="mt-1 text-xs text-red-700">{fieldErrors.location}</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-ink">
              Craft Description, Materials &amp; Dimensions *
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              required
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe raw materials used, crafting technique, dimensions, weight, and care instructions..."
              className="input-field mt-1"
            />
            {fieldErrors.description && (
              <p className="mt-1 text-xs text-red-700">{fieldErrors.description}</p>
            )}
          </div>
        </div>

        {/* Primary Image Upload */}
        <div>
          <label className="block text-sm font-medium text-ink">
            Primary Product Photograph * (JPEG, PNG, or WebP, max 5 MB)
          </label>
          <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-center">
            <label className="btn-secondary cursor-pointer">
              <Upload className="h-4 w-4" />
              {primaryImage ? 'Change Primary Image' : 'Select Primary Image'}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePrimaryImageChange}
                className="hidden"
              />
            </label>
            {primaryImage && (
              <span className="text-xs text-ink-muted">
                {primaryImage.name} ({(primaryImage.size / 1024).toFixed(0)} KB)
              </span>
            )}
          </div>
          {primaryPreview && (
            <img
              src={primaryPreview}
              alt="Primary preview"
              className="mt-3 h-40 w-40 rounded-md border border-ivory-border object-cover"
            />
          )}
          {fieldErrors.image && <p className="mt-1 text-xs text-red-700">{fieldErrors.image}</p>}
        </div>

        {/* Optional Gallery Images */}
        <div>
          <label className="block text-sm font-medium text-ink">
            Additional Detail Photos (Optional, up to 5 images)
          </label>
          <div className="mt-2">
            <label className="btn-secondary cursor-pointer">
              <Upload className="h-4 w-4" />
              Add Gallery Photos
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={handleGalleryChange}
                className="hidden"
              />
            </label>
          </div>
          {galleryImages.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-3">
              {galleryImages.map((file, idx) => (
                <div
                  key={`${file.name}-${idx}`}
                  className="relative rounded-md border border-ivory-border bg-ivory p-2 pr-7 text-xs"
                >
                  <span className="line-clamp-1 max-w-[140px] font-medium text-ink">
                    {file.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(idx)}
                    className="absolute top-1.5 right-1.5 text-ink-muted hover:text-red-700"
                    aria-label="Remove image"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Availability Toggle */}
        <div className="flex items-center gap-3 border-t border-ivory-border pt-4">
          <input
            id="is_available"
            name="is_available"
            type="checkbox"
            checked={formData.is_available}
            onChange={handleChange}
            className="h-4 w-4 rounded border-ivory-border text-forest focus:ring-forest"
          />
          <label htmlFor="is_available" className="text-sm font-medium text-ink">
            Available for buyer enquiries immediately upon publishing
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link to="/seller/products" className="btn-secondary">
            Cancel
          </Link>
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? 'Publishing...' : 'Publish Product'}
          </button>
        </div>
      </form>
    </div>
  );
}