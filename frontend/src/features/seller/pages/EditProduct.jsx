import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ImagePlus, Trash2 } from 'lucide-react';
import { productApi } from '../../../api/productApi';
import { sellerApi } from '../../../api/sellerApi';
import { useStore } from '../../../context/StoreContext';
import { extractApiError, resolveImageUrl } from '../../../utils/formatters';
import Loading from '../../../components/Loading';
import ErrorMessage from '../../../components/ErrorMessage';

export default function EditProduct() {
  const { id } = useParams();
  const { showToast } = useStore();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [product, setProduct] = useState(null);
  const [form, setForm] = useState(null);
  const [newMainImage, setNewMainImage] = useState(null);
  const [newGalleryFiles, setNewGalleryFiles] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    Promise.all([productApi.getCategories(), sellerApi.getProductById(id)])
      .then(([catRes, prodRes]) => {
        setCategories(catRes.data || []);
        const p = prodRes.data;
        setProduct(p);
        setForm({
          name: p.name || '',
          short_description: p.short_description || '',
          description: p.description || '',
          category: p.category || 'other',
          price: p.price || '',
          original_price: p.original_price || '',
          offer_label: p.offer_label || '',
          offer_start: p.offer_start || '',
          offer_end: p.offer_end || '',
          stock_quantity: String(p.stock_quantity ?? 0),
          sku: p.sku || '',
          is_available: Boolean(p.is_available),
          material: p.material || '',
          craft_technique: p.craft_technique || '',
          dimensions: p.dimensions || '',
          weight: p.weight || '',
          color: p.color || '',
          care_instructions: p.care_instructions || '',
          is_customizable: Boolean(p.is_customizable),
          location: p.location || '',
          processing_time: p.processing_time || '',
          shipping_info: p.shipping_info || '',
          return_policy: p.return_policy || '',
        });
      })
      .catch((err) => setError(extractApiError(err, 'Unable to load product.').message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleDeleteExistingGallery = async (imageId) => {
    try {
      await sellerApi.deleteProductImage(id, imageId);
      setProduct((prev) => ({
        ...prev,
        additional_images: prev.additional_images.filter((img) => img.id !== imageId),
      }));
      showToast('Gallery photo removed.');
    } catch (err) {
      setError(extractApiError(err, 'Could not remove gallery image.').message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    const payload = new FormData();
    Object.entries(form).forEach(([key, val]) => {
      if (key === 'original_price' || key === 'offer_start' || key === 'offer_end') {
        payload.append(key, val === null ? '' : val);
      } else if (val !== null) {
        payload.append(key, val);
      }
    });
    if (newMainImage) payload.append('image', newMainImage);
    newGalleryFiles.forEach((file) => payload.append('gallery_images', file));

    setSaving(true);
    try {
      await sellerApi.updateProduct(id, payload, true);
      showToast('Product changes saved and synced to storefront.');
      navigate('/seller/products', { replace: true });
    } catch (err) {
      const parsed = extractApiError(err, 'Could not save product updates.');
      setError(parsed.message);
      setFieldErrors(parsed.fieldErrors);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) return <Loading text="Loading product editor..." />;

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/seller/products"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Products
        </Link>
        <h1 className="mt-2 font-serif text-2xl font-semibold text-ink sm:text-3xl">
          Edit Product: {product.name}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="card-surface space-y-8 p-6 sm:p-8">
        <ErrorMessage message={error} />

        {/* 1. Basic Details */}
        <section className="space-y-4">
          <h2 className="font-serif text-lg font-semibold text-ink">1. Basic Craft Details</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-ink">Product Name *</label>
              <input
                name="name"
                type="text"
                required
                value={form.name}
                onChange={handleChange}
                className="input-field mt-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink">Category *</label>
              <select
                name="category"
                value={form.category}
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
              <label className="block text-sm font-medium text-ink">Crafted Location *</label>
              <input
                name="location"
                type="text"
                required
                value={form.location}
                onChange={handleChange}
                className="input-field mt-1"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-ink">Short Summary</label>
              <input
                name="short_description"
                type="text"
                maxLength={300}
                value={form.short_description}
                onChange={handleChange}
                className="input-field mt-1"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-ink">Detailed Description *</label>
              <textarea
                name="description"
                rows={4}
                required
                value={form.description}
                onChange={handleChange}
                className="input-field mt-1"
              />
            </div>
          </div>
        </section>

        {/* 2. Photos */}
        <section className="space-y-4 border-t border-ivory-border pt-6">
          <h2 className="font-serif text-lg font-semibold text-ink">2. Product Photography</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-ink">Current Main Image</p>
              <img
                src={newMainImage ? URL.createObjectURL(newMainImage) : resolveImageUrl(product.image)}
                alt={product.name}
                className="mt-2 h-40 w-full rounded-md border border-ivory-border object-cover"
              />
              <label className="btn-secondary mt-3 cursor-pointer py-1.5 text-xs">
                <ImagePlus className="h-3.5 w-3.5" />
                Replace Main Image
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setNewMainImage(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            </div>

            <div>
              <p className="text-sm font-medium text-ink">Gallery Photos</p>
              <div className="mt-2 flex flex-wrap gap-2.5">
                {(product.additional_images || []).map((img) => (
                  <div key={img.id} className="relative h-20 w-20">
                    <img
                      src={resolveImageUrl(img.image)}
                      alt="Gallery"
                      className="h-full w-full rounded border border-ivory-border object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteExistingGallery(img.id)}
                      className="absolute -top-1.5 -right-1.5 rounded-full bg-red-700 p-1 text-white"
                      title="Delete photo"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <label className="btn-secondary mt-3 cursor-pointer py-1.5 text-xs">
                <ImagePlus className="h-3.5 w-3.5" />
                Add More Gallery Photos
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setNewGalleryFiles(Array.from(e.target.files || []).slice(0, 5))}
                  className="hidden"
                />
              </label>
              {newGalleryFiles.length > 0 && (
                <p className="mt-1.5 text-xs text-forest">
                  {newGalleryFiles.length} new photo(s) queued for upload on save.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* 3. Pricing, Offers & Inventory */}
        <section className="space-y-4 border-t border-ivory-border pt-6">
          <h2 className="font-serif text-lg font-semibold text-ink">3. Pricing, Offers &amp; Inventory</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-ink">Selling Price (INR) *</label>
              <input
                name="price"
                type="number"
                step="0.01"
                min="1"
                required
                value={form.price}
                onChange={handleChange}
                className="input-field mt-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink">Original Price (optional)</label>
              <input
                name="original_price"
                type="number"
                step="0.01"
                min="1"
                value={form.original_price}
                onChange={handleChange}
                className="input-field mt-1"
              />
              {fieldErrors.original_price && (
                <p className="mt-1 text-xs text-red-700">{fieldErrors.original_price}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-ink">Offer Label</label>
              <input
                name="offer_label"
                type="text"
                value={form.offer_label}
                onChange={handleChange}
                className="input-field mt-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink">Offer Start Date</label>
              <input
                name="offer_start"
                type="date"
                value={form.offer_start}
                onChange={handleChange}
                className="input-field mt-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink">Offer End Date</label>
              <input
                name="offer_end"
                type="date"
                value={form.offer_end}
                onChange={handleChange}
                className="input-field mt-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink">Available Stock *</label>
              <input
                name="stock_quantity"
                type="number"
                min="0"
                required
                value={form.stock_quantity}
                onChange={handleChange}
                className="input-field mt-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink">SKU</label>
              <input
                name="sku"
                type="text"
                value={form.sku}
                onChange={handleChange}
                className="input-field mt-1"
              />
            </div>

            <div className="flex items-center pt-6 sm:col-span-2">
              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-ink">
                <input
                  name="is_available"
                  type="checkbox"
                  checked={form.is_available}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-ivory-border text-forest"
                />
                Published &amp; visible on buyer storefront
              </label>
            </div>
          </div>
        </section>

        {/* 4. Specifications & Care */}
        <section className="space-y-4 border-t border-ivory-border pt-6">
          <h2 className="font-serif text-lg font-semibold text-ink">4. Specifications &amp; Care</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-ink">Material</label>
              <input
                name="material"
                type="text"
                value={form.material}
                onChange={handleChange}
                className="input-field mt-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink">Craft Technique</label>
              <input
                name="craft_technique"
                type="text"
                value={form.craft_technique}
                onChange={handleChange}
                className="input-field mt-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink">Dimensions</label>
              <input
                name="dimensions"
                type="text"
                value={form.dimensions}
                onChange={handleChange}
                className="input-field mt-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink">Weight</label>
              <input
                name="weight"
                type="text"
                value={form.weight}
                onChange={handleChange}
                className="input-field mt-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink">Color / Finish</label>
              <input
                name="color"
                type="text"
                value={form.color}
                onChange={handleChange}
                className="input-field mt-1"
              />
            </div>

            <div className="flex items-center pt-6">
              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-ink">
                <input
                  name="is_customizable"
                  type="checkbox"
                  checked={form.is_customizable}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-ivory-border text-terracotta"
                />
                Available for custom orders
              </label>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-ink">Care Instructions</label>
              <textarea
                name="care_instructions"
                rows={2}
                value={form.care_instructions}
                onChange={handleChange}
                className="input-field mt-1"
              />
            </div>
          </div>
        </section>

        {/* 5. Dispatch & Returns */}
        <section className="space-y-4 border-t border-ivory-border pt-6">
          <h2 className="font-serif text-lg font-semibold text-ink">5. Dispatch &amp; Return Terms</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-ink">Processing Time</label>
              <input
                name="processing_time"
                type="text"
                value={form.processing_time}
                onChange={handleChange}
                className="input-field mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink">Return Policy</label>
              <input
                name="return_policy"
                type="text"
                value={form.return_policy}
                onChange={handleChange}
                className="input-field mt-1"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-ink">Shipping Info</label>
              <input
                name="shipping_info"
                type="text"
                value={form.shipping_info}
                onChange={handleChange}
                className="input-field mt-1"
              />
            </div>
          </div>
        </section>

        <div className="flex justify-end gap-3 border-t border-ivory-border pt-6">
          <Link to="/seller/products" className="btn-secondary">
            Cancel
          </Link>
          <button type="submit" disabled={saving} className="btn-primary px-8">
            {saving ? 'Saving Changes...' : 'Save Product Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}