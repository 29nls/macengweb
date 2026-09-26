import { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import { isProjectPublished } from "../../utils/projects";
import {
  Plus,
  Trash2,
  Upload,
  FolderGit2,
  X,
  ImageIcon,
  ExternalLink,
  Github,
  Pencil,
  Eye,
  EyeOff,
} from "lucide-react";

const Card = ({ children, className = "" }) => (
  <div className={`relative group ${className}`}>
    <div className="absolute -inset-0.5 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-2xl blur opacity-10 group-hover:opacity-25 transition duration-500" />
    <div className="relative bg-white/5 backdrop-blur-xl border border-white/12 rounded-2xl h-full">
      {children}
    </div>
  </div>
);

const InputField = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}) => (
  <div className="space-y-1.5">
    <label className="text-xs text-indigo-300/70 uppercase tracking-wider font-medium">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full bg-[#0d0d22] border border-white/10 rounded-xl px-4 py-2.5 text-gray-200 placeholder-gray-600 text-sm outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-all"
    />
  </div>
);

const SkeletonCard = () => (
  <div className="relative">
    <div className="absolute -inset-0.5 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-2xl blur opacity-10" />
    <div className="relative bg-white/5 border border-white/12 rounded-2xl p-4 flex flex-col gap-3">
      <div className="w-full aspect-[16/8] bg-white/5 animate-pulse rounded-xl" />
      <div className="h-4 bg-white/5 animate-pulse rounded-lg w-2/3" />
      <div className="h-3 bg-white/5 animate-pulse rounded-lg w-full" />
      <div className="h-3 bg-white/5 animate-pulse rounded-lg w-4/5" />
      <div className="flex gap-1.5 mt-1">
        <div className="h-5 w-16 bg-white/5 animate-pulse rounded-full" />
        <div className="h-5 w-12 bg-white/5 animate-pulse rounded-full" />
        <div className="h-5 w-20 bg-white/5 animate-pulse rounded-full" />
      </div>
      <div className="flex justify-between items-center pt-2 border-t border-white/8 mt-auto">
        <div className="flex gap-2">
          <div className="w-7 h-7 bg-white/5 animate-pulse rounded-lg" />
          <div className="w-7 h-7 bg-white/5 animate-pulse rounded-lg" />
        </div>
        <div className="flex gap-2">
          <div className="w-14 h-7 bg-white/5 animate-pulse rounded-lg" />
          <div className="w-16 h-7 bg-white/5 animate-pulse rounded-lg" />
        </div>
      </div>
    </div>
  </div>
);

const ProjectCard = ({ project, onDelete, onEdit, onTogglePublish }) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const published = isProjectPublished(project);

  return (
    <Card>
      <div className="p-4 flex flex-col h-full">
        {project.Img && (
          <div className="w-full aspect-[16/8] rounded-xl mb-4 border border-white/8 overflow-hidden bg-white/5">
            {!imgLoaded && (
              <div className="w-full h-full animate-pulse bg-white/5" />
            )}
            <img
              src={project.Img}
              alt={project.Title}
              onLoad={() => setImgLoaded(true)}
              className={`w-full h-full object-cover transition-opacity duration-300 ${imgLoaded ? "opacity-100" : "opacity-0 absolute"}`}
            />
          </div>
        )}
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <h3 className="font-semibold text-white text-sm">
            {project.Title}
          </h3>
          <button
            type="button"
            onClick={() => onTogglePublish(project)}
            aria-pressed={published}
            title={published ? "Unpublish project" : "Publish project"}
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[10px] font-medium transition-colors ${
              published
                ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20"
                : "border-amber-400/30 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20"
            }`}
          >
            {published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            {published ? "Published" : "Draft"}
          </button>
          <span className="ml-auto text-[10px] text-gray-500">
            Order {project.order_index ?? 0}
          </span>
        </div>
        {project.Description && (
          <p className="text-gray-400 text-xs mb-3 line-clamp-2 leading-relaxed">
            {project.Description}
          </p>
        )}
        {project.TechStack?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {project.TechStack.map((t) => (
              <span
                key={t}
                className="px-2 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/25 text-indigo-300 text-xs"
              >
                {t}
              </span>
            ))}
          </div>
        )}
        <div className="mt-auto flex items-center justify-between gap-2 pt-2 border-t border-white/8">
          <div className="flex gap-2">
            {project.Link && (
              <a
                href={project.Link}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg border border-white/10 text-gray-500 hover:text-white hover:border-white/20 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            {project.Github && (
              <a
                href={project.Github}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg border border-white/10 text-gray-500 hover:text-white hover:border-white/20 transition-colors"
              >
                <Github className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(project)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-500/25 text-indigo-400 hover:bg-indigo-500/10 text-xs transition-colors"
            >
              <Pencil className="w-3 h-3" /> Edit
            </button>
            <button
              onClick={() => onDelete(project.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 text-xs transition-colors"
            >
              <Trash2 className="w-3 h-3" /> Delete
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
};

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
    <div
      className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    />
    <div
      className="relative z-10 w-full max-w-2xl flex flex-col"
      style={{ maxHeight: "calc(100vh - 24px)" }}
    >
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-2xl blur opacity-20 pointer-events-none" />
      <div className="relative bg-[#0a0a1a] border border-white/12 rounded-2xl flex flex-col overflow-hidden">
        {/* Fixed header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8 shrink-0">
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  </div>
);

const ProjectForm = ({
  initial,
  onSubmit,
  onCancel,
  submitLabel = "Save Project",
  uploading,
}) => {
  const [form, setForm] = useState({
    Title: initial?.Title || "",
    Description: initial?.Description || "",
    TechStack: Array.isArray(initial?.TechStack)
      ? initial.TechStack.join(", ")
      : initial?.TechStack || "",
    Features: Array.isArray(initial?.Features)
      ? initial.Features.join(", ")
      : initial?.Features || "",
    Link: initial?.Link || "",
    Github: initial?.Github || "",
    is_published: initial ? isProjectPublished(initial) : true,
    order_index: initial?.order_index ?? 0,
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(initial?.Img || null);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form, file);
      }}
      className="p-5 sm:p-6 space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <InputField
            label="Project Title"
            value={form.Title}
            onChange={set("Title")}
            placeholder="e.g. My Portfolio Website"
            required
          />
        </div>

        <div className="sm:col-span-2 space-y-1.5">
          <label className="text-xs text-indigo-300/70 uppercase tracking-wider font-medium">
            Description
          </label>
          <textarea
            value={form.Description}
            onChange={set("Description")}
            placeholder="Describe what this project does, its purpose, and impact..."
            rows={3}
            className="w-full bg-[#0d0d22] border border-white/10 rounded-xl px-4 py-2.5 text-gray-200 placeholder-gray-600 text-sm outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-all resize-none"
          />
        </div>

        <InputField
          label="Tech Stack (comma separated)"
          value={form.TechStack}
          onChange={set("TechStack")}
          placeholder="e.g. React, Tailwind, Supabase"
        />
        <InputField
          label="Key Features (comma separated)"
          value={form.Features}
          onChange={set("Features")}
          placeholder="e.g. Auth, Dark mode, REST API"
        />
        <InputField
          label="Live URL"
          value={form.Link}
          onChange={set("Link")}
          placeholder="https://yourproject.com"
        />
        <InputField
          label="GitHub URL"
          value={form.Github}
          onChange={set("Github")}
          placeholder="https://github.com/username/repo"
        />

        <div className="space-y-1.5">
          <label className="text-xs text-indigo-300/70 uppercase tracking-wider font-medium">
            Publish Status
          </label>
          <button
            type="button"
            role="switch"
            aria-checked={form.is_published}
            onClick={() =>
              setForm((f) => ({ ...f, is_published: !f.is_published }))
            }
            className={`w-full flex items-center justify-between gap-3 border rounded-xl px-4 py-2.5 text-sm transition-all ${
              form.is_published
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:border-emerald-500/50"
                : "bg-[#0d0d22] border-white/10 text-gray-300 hover:border-white/20"
            }`}
          >
            <span className="flex items-center gap-2">
              {form.is_published ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
              {form.is_published ? "Published" : "Draft (hidden)"}
            </span>
            <span
              className={`relative w-9 h-5 rounded-full transition-colors ${
                form.is_published ? "bg-emerald-500/70" : "bg-white/10"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  form.is_published ? "translate-x-4" : ""
                }`}
              />
            </span>
          </button>
        </div>

        <InputField
          label="Order (order_index)"
          type="number"
          value={form.order_index}
          onChange={set("order_index")}
          placeholder="0"
        />

        <div className="sm:col-span-2 space-y-1.5">
          <label className="text-xs text-indigo-300/70 uppercase tracking-wider font-medium">
            Project Image
          </label>
          <label className="flex items-center gap-4 w-full bg-[#0d0d22] border border-dashed border-white/15 rounded-xl px-4 py-4 cursor-pointer hover:border-indigo-500/40 hover:bg-white/4 transition-all">
            {preview ? (
              <img
                src={preview}
                className="h-16 w-24 object-cover rounded-lg border border-white/10"
                alt="preview"
              />
            ) : (
              <div className="w-24 h-16 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                <ImageIcon className="w-5 h-5 text-gray-600" />
              </div>
            )}
            <div>
              <p className="text-sm text-gray-300">
                {preview ? "Change image" : "Click to upload image"}
              </p>
              <p className="text-xs text-gray-600 mt-0.5">
                PNG, JPG, WEBP supported
              </p>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-xl border border-white/10 text-gray-400 hover:text-white text-sm transition-colors"
        >
          Cancel
        </button>
        <button type="submit" disabled={uploading} className="relative group/s">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#4f52c9] to-[#8644c5] rounded-xl opacity-60 blur group-hover/s:opacity-100 transition duration-300" />
          <div className="relative flex items-center gap-2 px-5 py-2 bg-[#030014] rounded-xl border border-white/10">
            {uploading ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <Upload className="w-4 h-4 text-indigo-400" />
            )}
            <span className="text-sm text-gray-200">
              {uploading ? "Saving..." : submitLabel}
            </span>
          </div>
        </button>
      </div>
    </form>
  );
};

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      // Disamakan dengan urutan di beranda: order_index naik, lalu id turun,
      // supaya urutan di dashboard = urutan yang dilihat pengunjung.
      .order("order_index", { ascending: true })
      .order("id", { ascending: false });
    if (error) {
      // Jangan menimpa daftar yang sudah ada kalau permintaan gagal —
      // sebelumnya data null membuat halaman menampilkan "No projects yet".
      console.error("Failed to load projects:", error.message);
    } else {
      setProjects(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const uploadImage = async (f) => {
    const fileName = `${Date.now()}-${f.name}`;
    // Upload yang gagal harus menghentikan penyimpanan, bukan menyimpan
    // URL gambar yang tidak pernah ada ke database.
    const { error } = await supabase.storage
      .from("project-images")
      .upload(fileName, f);
    if (error) throw error;
    const { data } = supabase.storage
      .from("project-images")
      .getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleCreate = async (form, file) => {
    setUploading(true);
    try {
      let imgUrl = "";
      if (file) imgUrl = await uploadImage(file);
      const { error } = await supabase.from("projects").insert({
        Title: form.Title,
        Description: form.Description,
        Img: imgUrl,
        TechStack: form.TechStack.split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        Features: form.Features.split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        Link: form.Link,
        Github: form.Github,
        is_published: form.is_published,
        order_index: Number(form.order_index) || 0,
      });
      if (error) throw error;
      setShowCreate(false);
    } catch (error) {
      // Modal tetap terbuka supaya isian admin tidak hilang.
      console.error("Failed to save project:", error);
      alert(`Failed to save project: ${error.message}`);
    } finally {
      setUploading(false);
      fetchProjects();
    }
  };

  const handleEdit = async (form, file) => {
    setUploading(true);
    try {
      let imgUrl = editProject.Img || "";
      if (file) imgUrl = await uploadImage(file);
      const { error } = await supabase
        .from("projects")
        .update({
          Title: form.Title,
          Description: form.Description,
          Img: imgUrl,
          TechStack: form.TechStack.split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          Features: form.Features.split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          Link: form.Link,
          Github: form.Github,
          is_published: form.is_published,
          order_index: Number(form.order_index) || 0,
        })
        .eq("id", editProject.id);
      if (error) throw error;
      setEditProject(null);
    } catch (error) {
      // Modal edit tidak ditutup saat gagal, admin masih bisa memperbaiki.
      console.error("Failed to update project:", error);
      alert(`Failed to update project: ${error.message}`);
    } finally {
      setUploading(false);
      fetchProjects();
    }
  };

  const deleteProject = async (id) => {
    if (!confirm("Delete this project?")) return;
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) {
      console.error("Failed to delete project:", error);
      alert(`Failed to delete project: ${error.message}`);
    }
    fetchProjects();
  };

  const handleTogglePublish = async (project) => {
    const is_published = !isProjectPublished(project);
    // Update optimis supaya daftar tidak berkedip ke skeleton saat ditoggle.
    setProjects((prev) =>
      prev.map((p) => (p.id === project.id ? { ...p, is_published } : p)),
    );
    const { error } = await supabase
      .from("projects")
      .update({ is_published })
      .eq("id", project.id);
    if (error) {
      console.error("Failed to update publish status:", error);
      alert(`Failed to update publish status: ${error.message}`);
      fetchProjects(); // Ambil ulang supaya tampilan kembali sesuai server.
    }
  };

  return (
    <div className="space-y-6z ">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-xl blur opacity-50" />
            <div className="relative w-9 h-9 bg-[#030014] rounded-xl border border-white/15 flex items-center justify-center">
              <FolderGit2 className="w-4 h-4 text-indigo-400" />
            </div>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              Projects
            </h1>
            <p className="text-gray-500 text-xs">
              {loading ? "Loading..." : `${projects.length} projects total`}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="relative group shrink-0"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#4f52c9] to-[#8644c5] rounded-xl opacity-50 blur group-hover:opacity-80 transition duration-300" />
          <div className="relative flex items-center gap-2 px-4 py-2.5 bg-[#030014] rounded-xl border border-white/10">
            <Plus className="w-4 h-4 text-indigo-400" />
            <span className="text-sm text-gray-200">New Project</span>
          </div>
        </button>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <Modal title="Add New Project" onClose={() => setShowCreate(false)}>
          <ProjectForm
            onSubmit={handleCreate}
            onCancel={() => setShowCreate(false)}
            submitLabel="Save Project"
            uploading={uploading}
          />
        </Modal>
      )}

      {/* Edit Modal */}
      {editProject && (
        <Modal title="Edit Project" onClose={() => setEditProject(null)}>
          <ProjectForm
            initial={editProject}
            onSubmit={handleEdit}
            onCancel={() => setEditProject(null)}
            submitLabel="Update Project"
            uploading={uploading}
          />
        </Modal>
      )}

      {/* Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <Card>
          <div className="p-16 text-center">
            <FolderGit2 className="w-10 h-10 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">
              No projects yet. Create your first one!
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={deleteProject}
              onEdit={setEditProject}
              onTogglePublish={handleTogglePublish}
            />
          ))}
        </div>
      )}
    </div>
  );
}
