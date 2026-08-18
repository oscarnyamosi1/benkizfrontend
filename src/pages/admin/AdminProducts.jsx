import { useState, useEffect, useRef } from "react";
import { endpoints } from "../../api/client";
import { uploadToCloudinary } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import "./styles/admin-products.css"; // We'll create this CSS file

const BASE_URL = import.meta.env.VITE_BASE_URL;

const EMPTY_FORM = {
  id: "",
  name: "",
  description: "",
  price: "",
  category: [],
  stock: "",
  imageUrl: "",
  imagePublicId: "",
};



export default function AdminProducts() {
  const { user } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);

  const [CATEGORIES,setCategories] =useState([])

  const [form, setForm] = useState(EMPTY_FORM);

  const [saving, setSaving] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);

  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fileRef = useRef();

  const getImageUrl = (path) => {
    if (!path) return "";

    if (path.startsWith("http")) {
      return path;
    }

    return `${BASE_URL}/${path.replace(/^\/+/, "")}`;
  };

  async function load() {
    try {
      setLoading(true);

      
      setCategories((await endpoints.items.categories()).data.map((category) => category.label));


      const res = await endpoints.admin.products.list(user);
  
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load products");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleImagePick(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      setUploadingImg(true);

      const { url, public_id } = await uploadToCloudinary(file);

      setForm((f) => ({
        ...f,
        imageUrl: url,
        imagePublicId: public_id,
      }));
    } catch (err) {
      console.error(err);
      setError("Image upload failed");
    } finally {
      setUploadingImg(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const payload = {
        id: form.id,
        name: form.name,
        description: form.description,
        price: Number(form.price),
        category: form.category,
        numberOfItems: Number(form.stock || 0),
        thumbnail: form.imageUrl,
        thumbnail_public_id: form.imagePublicId,
      };

      if (editId) {
        await endpoints.admin.products.update(editId, payload);
      } else {
        await endpoints.admin.products.create(payload);
      }

      setShowForm(false);
      setEditId(null);
      setForm(EMPTY_FORM);

      await load();
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Save failed"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this product?")) return;

    try {
      await endpoints.admin.products.delete(id);

      await load();
    } catch {
      setError("Delete failed");
    }
  }

  function openEdit(item) {
    setForm({
      id: item.id || "",
      name: item.name || "",
      description: item.description || "",
      price: item.price || "",
      // category: Array.isArray(item.category)
      //   ? item.category[0]?.name || ""
      //   : item.category || "",

      category: Array.isArray(item.category)
        ? item.category.map(c => typeof c === 'string' ? c : c.name)
        : (item.category ? [item.category] : []),

      stock: item.numberOfItems ?? "",

      imageUrl: item.thumbnail || "",
    });

    setEditId(item.id);

    setShowForm(true);

    setError("");
  }

  const filtered = items.filter((i) =>
    i.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-products">
      <div className="admin-products__header">
        <div>
          <h1 className="admin-products__title">Products</h1>
          <p className="admin-products__subtitle">{items.length} products total</p>
        </div>

        <button
          className="btn btn-primary btn-pill"
          onClick={() => {
            setForm(EMPTY_FORM);
            setEditId(null);
            setShowForm(true);
          }}
        >
          <i className="fa fa-plus" /> Add Product
        </button>
      </div>

      <div className="admin-products__search-wrapper">
        <input
          className="input input-pill"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <i className="fa fa-search admin-products__search-icon" />
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginTop: 20 }}>
          <i className="fa fa-exclamation-circle" /> {error}
        </div>
      )}

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">
              <i className={`fa ${editId ? 'fa-edit' : 'fa-plus-circle'}`} />
              {editId ? "Edit Product" : "New Product"}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <input
                  className="input input-pill"
                  required
                  placeholder="Product Name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      name: e.target.value,
                    }))
                  }
                />

                <textarea
                  className="input input-rounded"
                  placeholder="Description"
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      description: e.target.value,
                    }))
                  }
                />

                <input
                  className="input input-pill"
                  type="number"
                  placeholder="Price (KES)"
                  value={form.price}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      price: e.target.value,
                    }))
                  }
                />

                <input
                  className="input input-pill"
                  type="number"
                  placeholder="Stock Quantity"
                  value={form.stock}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      stock: e.target.value,
                    }))
                  }
                />

                <select
                  className="input input-pill"
                  value={form.category}
                  multiple
                  // onChange={(e) =>
                  //   setForm((f) => ({
                  //     ...f,
                  //     category: e.target.value,
                  //   }))
                  // }

                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, opt => opt.label);
                    setForm(prev => ({ ...prev, category: selected }));
                  }}
              >
                  <option >Select Category</option>

                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </option>
                  ))}
                </select>

                {form.imageUrl && (
                  <div className="image-preview-wrapper">
                    <img
                      src={getImageUrl(form.imageUrl)}
                      className="image-preview-circle"
                      alt="Product preview"
                    />
                  </div>
                )}

                <input
                  type="file"
                  hidden
                  ref={fileRef}
                  onChange={handleImagePick}
                  accept="image/*"
                />

                <button
                  type="button"
                  className="btn btn-outline btn-pill"
                  onClick={() => fileRef.current?.click()}
                >
                  <i className="fa fa-camera" />{" "}
                  {uploadingImg ? "Uploading..." : "Upload Image"}
                </button>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn btn-primary btn-pill"
                    disabled={saving}
                  >
                    <i className={`fa ${saving ? 'fa-spinner fa-spin' : 'fa-save'}`} />
                    {saving ? "Saving..." : "Save Product"}
                  </button>

                  <button
                    type="button"
                    className="btn btn-ghost btn-pill"
                    onClick={() => setShowForm(false)}
                  >
                    <i className="fa fa-times" /> Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="page-loading">
          <div className="spinner" />
          <p>Loading products...</p>
        </div>
      ) : (
        <div className="products-grid">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <i className="fa fa-birthday-cake" />
              <h3>{search ? "No products match your search" : "No products available"}</h3>
              <p>{search ? "Try adjusting your search terms" : "Start by adding your first product"}</p>
            </div>
          ) : (
            filtered.map((item) => (
              <div key={item.id} className="product-card">
                <img
                  src={getImageUrl(item.thumbnail)}
                  className="product-card__image"
                  alt={item.name}
                />

                <div className="product-card__body">
                  <h3 className="product-card__name">{item.name}</h3>

                  <p className="product-card__category">
                    <i className="fa fa-tag" />
                    {Array.isArray(item.category)
                      ? item.category.map((c) => c.name).join(", ")
                      : item.category || "Uncategorized"}
                  </p>

                  <div className="product-card__stats">
                    <span>
                      <i className="fa fa-box" /> Stock: {item.numberOfItems || 0}
                    </span>
                    <span>
                      <i className="fa fa-eye" /> Views: {item.numberofviews || 0}
                    </span>
                  </div>

                  <h3 className="product-card__price">
                    KES {Number(item.price).toLocaleString()}
                  </h3>

                  <div className="product-card__actions">
                    <button
                      className="btn btn-outline btn-pill btn-sm"
                      onClick={() => openEdit(item)}
                    >
                      <i className="fa fa-edit" /> Edit
                    </button>

                    <button
                      className="btn btn-danger btn-pill btn-sm"
                      onClick={() => handleDelete(item.id)}
                    >
                      <i className="fa fa-trash" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}