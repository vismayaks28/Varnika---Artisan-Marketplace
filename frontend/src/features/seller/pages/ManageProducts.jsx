import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';
import { sellerApi } from '../../../api/sellerApi';
import { extractApiError, formatCurrency, resolveImageUrl } from '../../../utils/formatters';
import Loading from '../../../components/Loading';
import ErrorMessage from '../../../components/ErrorMessage';
import ConfirmDialog from '../../../components/ConfirmDialog';

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [togglingId, setTogglingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadProducts = () => {
    setLoading(true);
    sellerApi
      .getProducts()
      .then((res) => setProducts(res.data))
      .catch((err) => setError(extractApiError(err, 'Failed to load your products.').message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleToggleAvailability = async (product) => {
    setTogglingId(product.id);
    setError('');
    try {
      const res = await sellerApi.updateProduct(product.id, {
        is_available: !product.is_available,
      });
      setProducts((prev) => prev.map((item) => (item.id === product.id ? res.data : item)));
    } catch (err) {
      setError(extractApiError(err, 'Could not update availability.').message);
    } finally {
      setTogglingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setError('');
    try {
      await sellerApi.deleteProduct(deleteTarget.id);
      setProducts((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setError(extractApiError(err, 'Could not delete product.').message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <Loading text="Loading your catalog..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">
            Catalog Inventory
          </p>
          <h1 className="mt-1 font-serif text-2xl font-semibold text-ink sm:text-3xl">
            Manage Products
          </h1>
        </div>
        <Link to="/seller/products/add" className="btn-primary">
          <PlusCircle className="h-4 w-4" />
          Add Product
        </Link>
      </div>

      <ErrorMessage message={error} />

      {products.length === 0 ? (
        <div className="card-surface px-6 py-14 text-center">
          <h2 className="font-serif text-lg font-semibold text-ink">No products listed yet</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Add your handcrafted items to showcase them on the Varnika marketplace.
          </p>
          <Link to="/seller/products/add" className="btn-primary mt-5">
            <PlusCircle className="h-4 w-4" />
            Add First Product
          </Link>
        </div>
      ) : (
        <div className="card-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-ivory-border bg-ivory-dark text-xs uppercase tracking-wider text-ink-muted">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Craft Item</th>
                  <th className="px-5 py-3.5 font-semibold">Category</th>
                  <th className="px-5 py-3.5 font-semibold">Price</th>
                  <th className="px-5 py-3.5 font-semibold">Enquiries</th>
                  <th className="px-5 py-3.5 font-semibold">Availability</th>
                  <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ivory-border">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-ivory/60">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={resolveImageUrl(product.image)}
                          alt={product.name}
                          className="h-14 w-14 shrink-0 rounded border border-ivory-border object-cover"
                        />
                        <div>
                          <p className="font-semibold text-ink">{product.name}</p>
                          <p className="text-xs text-ink-muted">{product.location}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-ink-muted">{product.category_display}</td>
                    <td className="px-5 py-4 font-semibold text-ink">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="px-5 py-4 text-ink-muted">{product.enquiry_count}</td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        disabled={togglingId === product.id}
                        onClick={() => handleToggleAvailability(product)}
                        className={`rounded border px-2.5 py-1 text-xs font-semibold transition-colors ${
                          product.is_available
                            ? 'border-[#BFD6C9] bg-forest-light text-forest hover:bg-forest hover:text-white'
                            : 'border-stone-300 bg-stone-100 text-stone-700 hover:bg-stone-200'
                        }`}
                      >
                        {togglingId === product.id
                          ? 'Updating...'
                          : product.is_available
                          ? 'Available'
                          : 'Unavailable'}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <Link
                          to={`/seller/products/${product.id}/edit`}
                          className="btn-secondary px-3 py-1.5 text-xs"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(product)}
                          className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Product"
        message={`Are you sure you want to permanently delete "${deleteTarget?.name}"? Associated enquiries will also be removed.`}
        confirmLabel="Delete Product"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}