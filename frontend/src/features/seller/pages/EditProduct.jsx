import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, Trash2 } from 'lucide-react';
import { productApi } from '../../../api/productApi';
import { sellerApi } from '../../../api/sellerApi';
import { extractApiError, resolveImageUrl } from '../../../utils/formatters';
import Loading from '../../../components/Loading';
import ErrorMessage from '../../../components/ErrorMessage';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'pottery',
    price: '',
    location: '',
    is_available: true,
  });
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [existingGallery, setExistingGallery] = useState([]);
  const [newPrimaryImage, setNewPrimaryImage] = useState(null);
  const [newPrimaryPreview, setNewPrimaryPreview] = useState('');
  const [newGalleryFiles, setNewGalleryFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([productApi.getCategories(), sellerApi.getProductById(id)])
      .then(([catRes, prodRes]) => {
        setCategories(catRes.data);
        const prod = prodRes.data;
        setFormData({
          name: prod.name,
          description: prod.description,
          category: prod.category,
          price: prod.price,
          location: prod.location,
          is_available: prod.is_available,
        });
        setCurrentImageUrl(resolveImageUrl(prod.image));
        setExistingGallery(prod.additional_images || []);
      })
      .catch((err) => {
        setError(extractApiError(err, 'Unable to load product details.').message);
      })
      .finally(() => setLoading(false));
  }, [id]);

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

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fileErr = validateFile(file);
    if (fileErr) {
      setFieldErrors((prev) => ({ ...prev, image: fileErr }));
      return;
    }
    setFieldErrors((prev) => ({ ...prev, image: '' }));
    setNewPrimaryImage(file);
    setNewPrimaryPreview(URL.createObjectURL(file));
  };

  const handleNewGalleryChange = (e) => {
    const files = Array.from(e.target.files || []);
    for (const f of files) {
      const errMsg = validateFile(f);
      if (errMsg) {
        setError(errMsg);
        return;
      }
    }
    setError('');
    setNewGalleryFiles(files.slice(0, 5));
  };

  const handleRemoveExistingGalleryImage = async (imageId) => {
    try {
      await sellerApi.deleteProductImage(id, imageId);
      setExistingGallery((prev) => prev.filter((img) => img.id !== imageId));
    } catch (err) {
      setError(extractApiError(err, 'Could not remove gallery image.').message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    if (!formData.price || Number(formData.price) <= 0) {
      setFieldErrors({ price: 'Price must be greater than 0.' });
      return;
    }

    const payload = new FormData();
    payload.append('name', formData.name.trim());
    payload.append('description', formData.description.trim());
    payload.append('category', formData.category);
    payload.append('price', formData.price);
    payload.append('location', formData.location.trim());
    payload.append('is_available', formData.is_available);

    if (newPrimaryImage) {
      payload.append('image', newPrimaryImage);
    }
    newGalleryFiles.forEach((img) => payload.append('gallery_images', img));

    setSubmitting(true);
    try {
      await sellerApi.updateProduct(id, payload, true);
      navigate('/seller/products', { replace: true });
    } catch (err) {
      const parsed = extractApiError(err, 'Could not save changes.');
      setError(parsed.message);
      setFieldErrors(parsed.fieldErrors);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading text="Loading product details..." />;

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
          Edit Product
        </h1>
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
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
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
              className="input-field mt-1"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-ink">
              Craft Description *
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              required
              value={formData.description}
              onChange={handleChange}
              className="input-field mt-1"
            />
          </div>
        </div>

        {/* Primary Image */}
        <div>
          <label className="block text-sm font-medium text-ink">Primary Product Photograph</label>
          <div className="mt-2 flex flex-wrap items-center gap-4">
            <img
              src={newPrimaryPreview || currentImageUrl}
              alt={formData.name}
              className="h-32 w-32 rounded-md border border-ivory-border object-cover"
            />
            <label className="btn-secondary cursor-pointer">
              <Upload className="h-4 w-4" />
              Replace Primary Image
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>
          {fieldErrors.image && <p className="mt-1 text-xs text-red-700">{fieldErrors.image}</p>}
        </div>

        {/* Existing & Additional Gallery Images */}
        <div>
          <label className="block text-sm font-medium text-ink">Additional Detail Photos</label>
          {existingGallery.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-3">
              {existingGallery.map((img) => (
                <div key={img.id} className="relative">
                  <img
                    src={resolveImageUrl(img.image)}
                    alt="Gallery detail"
                    className="h-24 w-24 rounded-md border border-ivory-border object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveExistingGalleryImage(img.id)}
                    className="absolute top-1 right-1 rounded bg-white/90 p-1 text-red-700 shadow hover:bg-red-50"
                    title="Delete gallery image"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-3">
            <label className="btn-secondary cursor-pointer">
              <Upload className="h-4 w-4" />
              Upload More Detail Photos
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={handleNewGalleryChange}
                className="hidden"
              />
            </label>
            {newGalleryFiles.length > 0 && (
              <p className="mt-1.5 text-xs text-ink-muted">
                {newGalleryFiles.length} new gallery image(s) queued to upload.
              </p>
            )}
          </div>
        </div>

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
            Available for buyer enquiries
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link to="/seller/products" className="btn-secondary">
            Cancel
          </Link>
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}