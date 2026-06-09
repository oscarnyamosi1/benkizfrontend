import { useState, useEffect, useRef } from "react";
import { endpoints } from "../../api/client";
import { uploadToCloudinary } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const EMPTY_FORM = {
  id:"",
  name: "",
  description: "",
  price: "",
  category: "",
  stock: "",
  imageUrl: "",
  imagePublicId: "", 
};

const CATEGORIES = [
  "cakes",
  "bread",
  "pastries",
  "drinks",
  "cupcakes",
  "cookies",
  "macarons",
  "wedding",
  "birthday",
];

export default function AdminProducts() {
  const { user } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);

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

      const res = await endpoints.admin.products.list(user);

      console.log("Products:", res.data);

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

      // const uploaded = await uploadToCloudinary(file);

      const { url,public_id } = await uploadToCloudinary(file);
      

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
        id:form.id,
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
      category:
        Array.isArray(item.category)
          ? item.category[0]?.name || ""
          : item.category || "",

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
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 30,
        }}
      >
        <div>
          <h1>Products</h1>
          <p>{items.length} products total</p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => {
            setForm(EMPTY_FORM);
            setEditId(null);
            setShowForm(true);
          }}
        >
          Add Product
        </button>
      </div>

      <input
        className="input"
        placeholder="Search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {error && (
        <div className="alert alert-danger" style={{ marginTop: 20 }}>
          {error}
        </div>
      )}

      {showForm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.4)",
            display: "grid",
            placeItems: "center",
            zIndex: 99,
          }}
        >
          <div
            className="card"
            style={{
              width: 550,
              padding: 25,
            }}
          >
            <h2>{editId ? "Edit Product" : "New Product"}</h2>

            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gap: 14 }}>
                <input
                  className="input"
                  required
                  placeholder="Name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      name: e.target.value,
                    }))
                  }
                />

                <textarea
                  className="input"
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
                  className="input"
                  type="number"
                  placeholder="Price"
                  value={form.price}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      price: e.target.value,
                    }))
                  }
                />

                <input
                  className="input"
                  type="number"
                  placeholder="Stock"
                  value={form.stock}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      stock: e.target.value,
                    }))
                  }
                />

                <select
                  className="input"
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      category: e.target.value,
                    }))
                  }
                >
                  <option value="">Select</option>

                  {CATEGORIES.map((c) => (
                    <option key={c}>
                      {c}
                    </option>
                  ))}
                </select>

                {form.imageUrl && (
                  <img
                    src={getImageUrl(form.imageUrl)}
                    height={40} style={{height:"40px",}}
                  />
                )}

                <input
                  type="file"
                  hidden
                  ref={fileRef}
                  onChange={handleImagePick}
                />

                <button
                  type="button"
                  className="btn"
                  onClick={() =>
                    fileRef.current?.click()
                  }
                >
                  {uploadingImg
                    ? "Uploading..."
                    : "Upload Image"}
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {saving
                    ? "Saving..."
                    : "Save"}
                </button>

                <button
                  type="button"
                  className="btn"
                  onClick={() =>
                    setShowForm(false)
                  }
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fill,minmax(280px,1fr))",
            gap: 20,
          }}
        >
          {filtered.map((item) => (
            <div
              key={item.id}
              className="card"
            >
              <img
                src={getImageUrl(item.thumbnail)}
                style={{
                  width: "100%",
                  height: 200,
                  objectFit: "cover",
                }}
              />

              <div style={{ padding: 15 }}>
                <h3>{item.name}</h3>

                <p>
                  {Array.isArray(item.category)
                    ? item.category
                        .map((c) => c.name)
                        .join(", ")
                    : item.category}
                </p>

                <div>
                  Stock:
                  {" "}
                  {item.numberOfItems}
                </div>

                <div>
                  Views:
                  {" "}
                  {item.numberofviews}
                </div>

                <h3>
                  KES{" "}
                  {Number(
                    item.price
                  ).toLocaleString()}
                </h3>

                <div
                  style={{
                    display: "flex",
                    gap: 10,
                  }}
                >
                  <button
                    className="btn"
                    onClick={() =>
                      openEdit(item)
                    }
                  >
                    Edit
                  </button>

                  <button
                    className="btn"
                    onClick={() =>
                      handleDelete(
                        item.id
                      )
                    }
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}