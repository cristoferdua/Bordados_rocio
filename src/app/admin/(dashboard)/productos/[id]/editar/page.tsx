"use client";

import { useState, useEffect, use, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, X, Trash2, Upload } from "lucide-react";

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  rentalPrice: number;
  depositPrice: number | null;
  stock: number;
  isAvailable: boolean;
  categoryId: number;
  images: { id: number; url: string; alt: string | null; isPrimary: boolean }[];
}

interface UploadedImage {
  file?: File;
  preview: string;
  url: string;
  isExisting: boolean;
}

export default function EditarProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    rentalPrice: "",
    depositPrice: "",
    stock: "1",
    categoryId: "",
    isAvailable: true,
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/categorias").then((res) => res.json()),
      fetch(`/api/productos/${id}`).then((res) => res.json()),
    ]).then(([cats, product]: [Category[], Product]) => {
      setCategories(cats);
      setFormData({
        name: product.name,
        slug: product.slug,
        description: product.description,
        rentalPrice: String(product.rentalPrice),
        depositPrice: product.depositPrice ? String(product.depositPrice) : "",
        stock: String(product.stock),
        categoryId: String(product.categoryId),
        isAvailable: product.isAvailable,
      });
      setUploadedImages(
        product.images.length > 0
          ? product.images.map((img) => ({
              url: img.url,
              preview: img.url,
              isExisting: true,
            }))
          : []
      );
      setIsLoading(false);
    });
  }, [id]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s]/gi, "")
      .replace(/\s+/g, "-");
  };

  const handleNameChange = (name: string) => {
    setFormData({ ...formData, name, slug: generateSlug(name) });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: UploadedImage[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const preview = URL.createObjectURL(file);
      newImages.push({
        file,
        preview,
        url: "",
        isExisting: false,
      });
    }

    setUploadedImages([...uploadedImages, ...newImages]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    const image = uploadedImages[index];
    if (!image.isExisting) {
      URL.revokeObjectURL(image.preview);
    }
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Upload new images and keep existing ones
      const imageUrls: string[] = [];

      for (const img of uploadedImages) {
        if (img.isExisting) {
          imageUrls.push(img.url);
        } else if (img.file) {
          const formDataImg = new FormData();
          formDataImg.append("file", img.file);

          const uploadRes = await fetch("/api/upload", {
            method: "POST",
            body: formDataImg,
          });

          if (uploadRes.ok) {
            const data = await uploadRes.json();
            imageUrls.push(data.url);
          }
        }
      }

      const res = await fetch(`/api/productos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          rentalPrice: parseFloat(formData.rentalPrice),
          depositPrice: formData.depositPrice
            ? parseFloat(formData.depositPrice)
            : null,
          stock: parseInt(formData.stock),
          categoryId: parseInt(formData.categoryId),
          images: imageUrls,
        }),
      });

      if (res.ok) {
        router.push("/admin/productos");
        router.refresh();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de eliminar este producto?")) return;

    const res = await fetch(`/api/productos/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      router.push("/admin/productos");
      router.refresh();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/productos"
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="font-playfair text-2xl font-bold text-gray-900">
              Editar Producto
            </h1>
            <p className="text-sm text-gray-500">{formData.name}</p>
          </div>
        </div>
        <button
          onClick={handleDelete}
          className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
          Eliminar
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 space-y-6">
          <h2 className="font-playfair text-lg font-semibold text-gray-900">
            Información Básica
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Producto *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slug
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) =>
                setFormData({ ...formData, slug: e.target.value })
              }
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-500 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción *
            </label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 resize-none"
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría *
              </label>
              <select
                required
                value={formData.categoryId}
                onChange={(e) =>
                  setFormData({ ...formData, categoryId: e.target.value })
                }
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
              >
                <option value="">Selecciona una categoría</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock
              </label>
              <input
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: e.target.value })
                }
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 space-y-6">
          <h2 className="font-playfair text-lg font-semibold text-gray-900">
            Precios
          </h2>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio de Alquiler *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                  $
                </span>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.rentalPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, rentalPrice: e.target.value })
                  }
                  className="w-full rounded-xl border border-gray-200 pl-8 pr-4 py-3 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Depósito de Garantía
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                  $
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.depositPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, depositPrice: e.target.value })
                  }
                  className="w-full rounded-xl border border-gray-200 pl-8 pr-4 py-3 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isAvailable"
              checked={formData.isAvailable}
              onChange={(e) =>
                setFormData({ ...formData, isAvailable: e.target.checked })
              }
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="isAvailable" className="text-sm text-gray-700">
              Producto disponible para alquiler
            </label>
          </div>
        </div>

        {/* Images - File Upload */}
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-playfair text-lg font-semibold text-gray-900">
              Imágenes
            </h2>
          </div>

          {/* Upload area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-8 transition-colors hover:border-primary-300 hover:bg-primary-50/30"
          >
            <Upload className="h-8 w-8 text-gray-300" />
            <p className="mt-3 text-sm font-medium text-gray-600">
              Haz clic para agregar más imágenes
            </p>
            <p className="mt-1 text-xs text-gray-400">
              JPG, PNG, WebP o GIF. Máximo 5MB cada una.
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Image previews */}
          {uploadedImages.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {uploadedImages.map((img, index) => (
                <div key={index} className="group relative overflow-hidden rounded-xl bg-gray-100">
                  <div className="aspect-[3/4]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.preview}
                      alt={`Imagen ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  {index === 0 && (
                    <span className="absolute bottom-2 left-2 rounded-full bg-primary-500/80 px-2 py-0.5 text-xs font-semibold text-white">
                      Principal
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 text-center py-2">
              No hay imágenes. Haz clic arriba para agregar.
            </p>
          )}
        </div>

        <div className="flex justify-end gap-4">
          <Link
            href="/admin/productos"
            className="rounded-xl border border-gray-200 px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
