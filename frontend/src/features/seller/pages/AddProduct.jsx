import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ImagePlus, X } from 'lucide-react';
import { productApi } from '../../../api/productApi';
import { sellerApi } from '../../../api/sellerApi';
import { useAuth } from '../../../context/AuthContext';
import { useStore } from '../../../context/StoreContext';
import { extractApiError } from '../../../utils/formatters';
import ErrorMessage from '../../../components/ErrorMessage';

export default function AddProduct() {
  const { user } = useAuth();
  const { showToast } = useStore();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: '',
    short_description: '',
    description: '',
    category: 'pottery',
    price: '',
    original_price: '',
    offer_label: '',
    offer_start: '',
    offer_end: '',
    stock_quantity: '10',
    sku: '',
    is_available: true,
    material: '',
    craft_technique: '',
    dimensions: '',
    weight: '',
    color: '',
    care_instructions: '',
    is_customizable: false,
    location: user?.seller_profile?.manufacturing_location || user?.location || '',
    processing_time: '',
    shipping_info: '',
    return_policy: '',
  });

  const [mainImage, setMainImage] = useState(null);
  const [mainPreview, setMainPreview] = useState('');
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    productApi
      .getCategories()
      .then((res) => setCategories(res.data || []))
      .catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleMainImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMainImage(file);
    setMainPreview(URL.createObjectURL(file));
  };

  const handleGalleryChange = (e) => {
    const selected = Array.from(e.target.files || []).slice(0, 5);
    setGalleryFiles(selected);
    setGalleryPreviews(selected.map((file) => URL.createObjectURL(file)));
  };

  const removeGalleryItem = (index) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    if (!mainImage) {
      setError('Please select a main product photograph.');
      return;
    }

    const payload = new FormData();
    Object.entries(form).forEach(([key, val]) => {
      if (val !== '' && val !== null) {
        payload.append(key, val);
      }
    });
    payload.append('image', mainImage);
    galleryFiles.forEach((file) => payload.append('gallery_images', file));

    setSubmitting(true);
    try {
      await sellerApi.createProduct(payload);
      showToast('Handcrafted product published to the Varnika storefront.');
      navigate('/seller/products', { replace: true });
    } catch (err) {
      const parsed = extractApiError(err, 'Could not publish product. Please check the fields below.');
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
          Back to My Products
        </Link>
        <h1 className="mt-2 font-serif text-2xl font-semibold text-ink sm:text-3xl">
          Add Handcrafted Product
        </h1>
        <p className="mt-1 text-xs text-ink-muted">
          Published items automatically appear in the public shop, category pages, and your brand profile.
        </p>
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
                placeholder="e.g., Hand-Thrown Terracotta Water Jug"
                className="input-field mt-1"
              />
              {fieldErrors.name && <p className="mt-1 text-xs text-red-700">{fieldErrors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-ink">Craft Category *</label>
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
                placeholder="e.g., Kutch, Gujarat"
                className="input-field mt-1"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-ink">
                Short Summary (shown below title)
              </label>
              <input
                name="short_description"
                type="text"
                maxLength={300}
                value={form.short_description}
                onChange={handleChange}
                placeholder="One-line highlight of material, finish, or heritage technique"
                className="input-field mt-1"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-ink">Detailed Story &amp; Description *</label>
              <textarea
                name="description"
                rows={4}
                required
                value={form.description}
                onChange={handleChange}
                placeholder="Describe how this item is made, its cultural origin, and usage..."
                className="input-field mt-1"
              />
            </div>
          </div>
        </section>

        {/* 2. Product Photography */}
        <section className="space-y-4 border-t border-ivory-border pt-6">
          <h2 className="font-serif text-lg font-semibold text-ink">2. Product Photography</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-ink">
                Main Product Image (JPEG/PNG/WebP, max 5MB) *
              </label>
              <label className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-ivory-border bg-ivory/60 p-5 text-center hover:border-terracotta">
                <ImagePlus className="h-6 w-6 text-terracotta" />
                <span className="mt-1.5 text-xs font-semibold text-ink">Choose Main Photo</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleMainImageChange}
                  className="hidden"
                />
              </label>
              {mainPreview && (
                <img
                  src={mainPreview}
                  alt="Main preview"
                  className="mt-3 h-36 w-full rounded-md border border-ivory-border object-cover"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-ink">
                Additional Gallery Images (up to 5 photos)
              </label>
              <label className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-ivory-border bg-ivory/60 p-5 text-center hover:border-forest">
                <ImagePlus className="h-6 w-6 text-forest" />
                <span className="mt-1.5 text-xs font-semibold text-ink">Select Gallery Photos</span>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleGalleryChange}
                  className="hidden"
                />
              </label>
              {galleryPreviews.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2.5">
                  {galleryPreviews.map((src, idx) => (
                    <div key={src} className="relative h-20 w-20">
                      <img
                        src={src}
                        alt={`Gallery ${idx + 1}`}
                        className="h-full w-full rounded border border-ivory-border object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeGalleryItem(idx)}
                        className="absolute -top-1.5 -right-1.5 rounded-full bg-red-700 p-0.5 text-white"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
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
              {fieldErrors.price && <p className="mt-1 text-xs text-red-700">{fieldErrors.price}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-ink">
                Original Price (optional, if on offer)
              </label>
              <input
                name="original_price"
                type="number"
                step="0.01"
                min="1"
                value={form.original_price}
                onChange={handleChange}
                placeholder="Must exceed selling price"
                className="input-field mt-1"
              />
              {fieldErrors.original_price && (
                <p className="mt-1 text-xs text-red-700">{fieldErrors.original_price}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-ink">Offer Label (optional)</label>
              <input
                name="offer_label"
                type="text"
                value={form.offer_label}
                onChange={handleChange}
                placeholder="e.g., Festive Craft Edit"
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
              {fieldErrors.offer_end && (
                <p className="mt-1 text-xs text-red-700">{fieldErrors.offer_end}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-ink">Available Stock Quantity *</label>
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
              <label className="block text-sm font-medium text-ink">Studio SKU (optional)</label>
              <input
                name="sku"
                type="text"
                value={form.sku}
                onChange={handleChange}
                placeholder="e.g., VRN-POT-001"
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
                Publish immediately to buyer storefront
              </label>
            </div>
          </div>
        </section>

        {/* 4. Craft Specifications & Care */}
        <section className="space-y-4 border-t border-ivory-border pt-6">
          <h2 className="font-serif text-lg font-semibold text-ink">4. Specifications &amp; Care</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-ink">Primary Material</label>
              <input
                name="material"
                type="text"
                value={form.material}
                onChange={handleChange}
                placeholder="e.g., Earthen Terracotta Clay"
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
                placeholder="e.g., Wheel-Thrown & Wood-Fired"
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
                placeholder="e.g., 22 cm H x 15 cm W"
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
                placeholder="e.g., 950 g"
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
                placeholder="e.g., Natural Red Ochre"
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
                placeholder="e.g., Rinse with warm water and soft sponge; avoid harsh detergents."
                className="input-field mt-1"
              />
            </div>
          </div>
        </section>

        {/* 5. Shipping & Return Details */}
        <section className="space-y-4 border-t border-ivory-border pt-6">
          <h2 className="font-serif text-lg font-semibold text-ink">5. Dispatch &amp; Return Terms</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-ink">Workshop Processing Time</label>
              <input
                name="processing_time"
                type="text"
                value={form.processing_time}
                onChange={handleChange}
                placeholder="e.g., Ships in 3–5 business days"
                className="input-field mt-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink">Return Eligibility</label>
              <input
                name="return_policy"
                type="text"
                value={form.return_policy}
                onChange={handleChange}
                placeholder="e.g., Replacement within 48h if damaged in transit"
                className="input-field mt-1"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-ink">Packaging &amp; Shipping Notes</label>
              <input
                name="shipping_info"
                type="text"
                value={form.shipping_info}
                onChange={handleChange}
                placeholder="e.g., Double-boxed with eco-friendly honeycomb cushioning"
                className="input-field mt-1"
              />
            </div>
          </div>
        </section>

        <div className="flex justify-end gap-3 border-t border-ivory-border pt-6">
          <Link to="/seller/products" className="btn-secondary">
            Cancel
          </Link>
          <button type="submit" disabled={submitting} className="btn-primary px-8">
            {submitting ? 'Publishing...' : 'Publish Product'}
          </button>
        </div>
      </form>
    </div>
  );
}