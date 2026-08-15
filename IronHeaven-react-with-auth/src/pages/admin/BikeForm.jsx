import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getBikeById, createBike, updateBike } from "../../firebase/bikes";
import { uploadBikePhoto } from "../../firebase/storage";
import AdminNav from "../../components/AdminNav";
import { resolveImage } from "../../utils/images";

const emptyBike = {
  id: "",
  name: "",
  badge: "",
  category: "",
  image: "",
  heroImage: "",
  tagline: "",
  price: "",
  description: "",
  specs: [], // array of {label, value} — Firestore doesn't allow arrays of arrays
  features: [], // array of strings
};

export default function BikeForm() {
  const { docId } = useParams(); // undefined when adding a new bike
  const isEditing = Boolean(docId);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyBike);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const [photoFile, setPhotoFile] = useState(null); // File chosen but not yet uploaded
  const [photoPreview, setPhotoPreview] = useState(""); // local blob: URL for preview

  useEffect(() => {
    if (!isEditing) return;
    (async () => {
      const bike = await getBikeById(docId);
      if (bike) {
        setForm({
          ...emptyBike,
          ...bike,
          specs: bike.specs || [],
          features: bike.features || [],
        });
      }
      setLoading(false);
    })();
  }, [docId, isEditing]);

  // Clean up the local preview URL when it's replaced/unmounted.
  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handlePhotoSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB.");
      return;
    }

    setError("");
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  // ---- Specs (label/value pairs) ----
  function handleSpecChange(index, field, value) {
    const specs = form.specs.map((spec, i) =>
      i === index ? { ...spec, [field]: value } : spec
    );
    setForm({ ...form, specs });
  }

  function addSpecRow() {
    setForm({ ...form, specs: [...form.specs, { label: "", value: "" }] });
  }

  function removeSpecRow(index) {
    setForm({ ...form, specs: form.specs.filter((_, i) => i !== index) });
  }

  // ---- Features (plain strings) ----
  function handleFeatureChange(index, value) {
    const features = form.features.map((f, i) => (i === index ? value : f));
    setForm({ ...form, features });
  }

  function addFeatureRow() {
    setForm({ ...form, features: [...form.features, ""] });
  }

  function removeFeatureRow(index) {
    setForm({ ...form, features: form.features.filter((_, i) => i !== index) });
  }

  function slugify(str) {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const name = form.name.trim();
    if (!name) {
      setError("Please enter a bike name.");
      return;
    }

    // If no Id was typed, build one from the name (e.g. "Ducati Monster"
    // -> "ducati-monster"). If that id is already taken, append -2, -3...
    let bikeId = form.id.trim() || slugify(name);
    if (!bikeId) {
      setError("Please enter an Id or a Name to auto-generate one.");
      return;
    }
    if (!isEditing) {
      const taken = await getBikeById(bikeId);
      let n = 2;
      while (taken) {
        const candidate = `${slugify(name) || bikeId}-${n}`;
        if (!(await getBikeById(candidate))) {
          bikeId = candidate;
          break;
        }
        n += 1;
      }
    }

    let heroImage = form.heroImage;

    if (photoFile) {
      setUploading(true);
      try {
        heroImage = await uploadBikePhoto(bikeId, photoFile);
      } catch (err) {
        setUploading(false);
        setError(err.message || "Photo upload failed.");
        return;
      }
      setUploading(false);
    }

    // Drop empty spec/feature rows before saving.
    const cleanSpecs = form.specs.filter(({ label, value }) => label.trim() || value.trim());
    const cleanFeatures = form.features.filter((f) => f.trim());
    const payload = {
      ...form,
      id: bikeId,
      heroImage,
      specs: cleanSpecs,
      features: cleanFeatures,
      related: form.related || [],
    };

    setSaving(true);
    try {
      if (isEditing) {
        await updateBike(docId, payload);
      } else {
        await createBike(payload); // uses bikeId as the Firestore doc id
      }
      navigate("/admin");
    } catch (err) {
      console.error("Save bike failed:", err);
      setError(err.message || "Failed to save bike.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="admin-loading">Loading…</div>;

  return (
    <div className="admin-dashboard">
      <AdminNav />

      <header className="admin-header">
        <div>
          <h1 className="admin-title">{isEditing ? "Edit Bike" : "Add Bike"}</h1>
          <p className="admin-subtitle">
            {isEditing
              ? "Update the details of this bike."
              : "Create a new entry in the IronHeaven catalog."}
          </p>
        </div>
      </header>

      {error && <p className="auth-error">{error}</p>}

      <form onSubmit={handleSubmit} className="admin-form" noValidate>
        <section className="admin-form-card">
          <h2>Identity</h2>
          <p className="admin-form-card-sub">
            Id is used in the public URL — leave blank to auto-generate from the
            name.
          </p>
          <div className="admin-form-grid">
            <label>
              Id
              <input
                name="id"
                value={form.id}
                onChange={handleChange}
                disabled={isEditing}
                placeholder="auto-generated if empty"
              />
            </label>

            <label>
              Name
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Badge
              <input
                name="badge"
                value={form.badge}
                onChange={handleChange}
                placeholder='e.g. "Sport"'
              />
            </label>

            <label>
              Category
              <input
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder='e.g. "sport", "cruiser", "adventure"'
              />
            </label>
          </div>
        </section>

        <section className="admin-form-card">
          <h2>Media</h2>
          <p className="admin-form-card-sub">
            The photo is used as the hero image on the bike's page.
          </p>
          <div className="admin-form-grid">
            <label className="span-2">
              Bike Photo
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
              />
            </label>
            {(photoPreview || form.heroImage) && (
              <img
                className="admin-photo-preview span-2"
                src={photoPreview || resolveImage(form.heroImage)}
                alt="Bike preview"
              />
            )}
            {uploading && (
              <p className="span-2" style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.85rem" }}>
                Uploading photo…
              </p>
            )}

            <label>
              Image class
              <input
                name="image"
                value={form.image}
                onChange={handleChange}
                placeholder="only needed for the old CSS card style"
              />
            </label>

            <label>
              Tagline
              <input
                name="tagline"
                value={form.tagline}
                onChange={handleChange}
              />
            </label>

            <label>
              Price
              <input
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder='e.g. "$8,000"'
              />
            </label>

            <label className="span-2">
              Description
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
              />
            </label>
          </div>
        </section>

        <section className="admin-form-card">
          <h2>Specifications</h2>
          <p className="admin-form-card-sub">
            Shown as a table on the bike page.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {form.specs.map((spec, i) => (
              <div className="admin-specs-row" key={i}>
                <input
                  placeholder="Label (e.g. Engine)"
                  value={spec.label}
                  onChange={(e) => handleSpecChange(i, "label", e.target.value)}
                />
                <input
                  placeholder="Value (e.g. 749cc V-Twin)"
                  value={spec.value}
                  onChange={(e) => handleSpecChange(i, "value", e.target.value)}
                />
                <button
                  type="button"
                  className="admin-remove-btn"
                  onClick={() => removeSpecRow(i)}
                  aria-label="Remove spec"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="admin-add-row-btn"
            onClick={addSpecRow}
            style={{ marginTop: "0.6rem" }}
          >
            + Add Spec
          </button>
        </section>

        <section className="admin-form-card">
          <h2>Features</h2>
          <p className="admin-form-card-sub">Bullet list on the bike page.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {form.features.map((feature, i) => (
              <div className="admin-features-row" key={i}>
                <input
                  placeholder="e.g. LED headlight with retro chrome housing"
                  value={feature}
                  onChange={(e) => handleFeatureChange(i, e.target.value)}
                />
                <button
                  type="button"
                  className="admin-remove-btn"
                  onClick={() => removeFeatureRow(i)}
                  aria-label="Remove feature"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="admin-add-row-btn"
            onClick={addFeatureRow}
            style={{ marginTop: "0.6rem" }}
          >
            + Add Feature
          </button>
        </section>

        <div className="admin-submit">
          <button
            className="admin-btn admin-btn-ghost"
            type="button"
            onClick={() => window.history.back()}
            disabled={saving || uploading}
          >
            Cancel
          </button>
          <button
            className="admin-btn admin-btn-primary"
            type="submit"
            disabled={saving || uploading}
          >
            {uploading
              ? "Uploading photo…"
              : saving
                ? "Saving…"
                : isEditing
                  ? "Save changes"
                  : "Create bike"}
          </button>
        </div>
      </form>
    </div>
  );
}
