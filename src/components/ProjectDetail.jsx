import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ExternalLink,
  Github,
  Code2,
  Star,
  ChevronRight,
  Layers,
  Layout,
  Globe,
  Package,
  Cpu,
  Code,
  Home,
  RefreshCw,
} from "lucide-react";
import Swal from "sweetalert2";
import { toSlug } from "../utils/slug";
import { prepareProjects, isProjectPublished } from "../utils/projects";
import { supabase } from "../supabase";

const CACHE_KEY = "projects";

const TECH_ICONS = {
  React: Globe,
  Tailwind: Layout,
  Express: Cpu,
  Python: Code,
  Javascript: Code,
  HTML: Code,
  CSS: Code,
  default: Package,
};

// Slug di-generate dari Title, jadi pencarian tetap dilakukan di sisi klien
// (sama seperti Portofolio) karena tabel projects tidak punya kolom slug.
// Hanya proyek yang dipublikasikan yang boleh cocok — proyek yang belum
// dipublikasikan diperlakukan sama dengan proyek yang tidak ada.
const findProjectBySlug = (projects, slug) =>
  (Array.isArray(projects) ? projects : [])
    .filter(isProjectPublished)
    .find((project) => toSlug(project.Title) === slug);

const readCachedProjects = () => {
  try {
    // Cache bisa berisi proyek yang sudah tidak dipublikasikan (cache lama),
    // jadi hasilnya disaring dan diurutkan dulu sebelum dipakai.
    return prepareProjects(JSON.parse(localStorage.getItem(CACHE_KEY)));
  } catch {
    return [];
  }
};

const enhanceProject = (project) => ({
  ...project,
  Features: project.Features || [],
  TechStack: project.TechStack || [],
  Github: project.Github || "https://github.com/EkiZR",
});

const TechBadge = ({ tech }) => {
  const Icon = TECH_ICONS[tech] || TECH_ICONS["default"];
  return (
    <div className="group relative overflow-hidden px-3 py-2 md:px-4 md:py-2.5 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-xl border border-blue-500/10 hover:border-blue-500/30 transition-all duration-300 cursor-default">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all duration-500" />
      <div className="relative flex items-center gap-1.5 md:gap-2">
        <Icon className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-400 group-hover:text-blue-300 transition-colors" />
        <span className="text-xs md:text-sm font-medium text-blue-300/90 group-hover:text-blue-200 transition-colors">
          {tech}
        </span>
      </div>
    </div>
  );
};

const FeatureItem = ({ feature }) => {
  return (
    <li className="group flex items-start space-x-3 p-2.5 md:p-3.5 rounded-xl hover:bg-white/5 transition-all duration-300 border border-transparent hover:border-white/10">
      <div className="relative mt-2">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full blur group-hover:opacity-100 opacity-0 transition-opacity duration-300" />
        <div className="relative w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 group-hover:scale-125 transition-transform duration-300" />
      </div>
      <span className="text-sm md:text-base text-gray-300 group-hover:text-white transition-colors">
        {feature}
      </span>
    </li>
  );
};

const ProjectStats = ({ project }) => {
  const techStackCount = project?.TechStack?.length || 0;
  const featuresCount = project?.Features?.length || 0;

  return (
    <div className="grid grid-cols-2 gap-3 md:gap-4 p-3 md:p-4 bg-[#0a0a1a] rounded-xl overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20 opacity-50 blur-2xl z-0" />
      <div className="relative z-10 flex items-center space-x-2 md:space-x-3 bg-white/5 p-2 md:p-3 rounded-lg border border-blue-500/20 transition-all duration-300 hover:scale-105 hover:border-blue-500/50 hover:shadow-lg">
        <div className="bg-blue-500/20 p-1.5 md:p-2 rounded-full">
          <Code2
            className="text-blue-300 w-4 h-4 md:w-6 md:h-6"
            strokeWidth={1.5}
          />
        </div>
        <div className="flex-grow">
          <div className="text-lg md:text-xl font-semibold text-blue-200">
            {techStackCount}
          </div>
          <div className="text-[10px] md:text-xs text-gray-400">
            Total Teknologi
          </div>
        </div>
      </div>

      <div className="relative z-10 flex items-center space-x-2 md:space-x-3 bg-white/5 p-2 md:p-3 rounded-lg border border-purple-500/20 transition-all duration-300 hover:scale-105 hover:border-purple-500/50 hover:shadow-lg">
        <div className="bg-purple-500/20 p-1.5 md:p-2 rounded-full">
          <Layers
            className="text-purple-300 w-4 h-4 md:w-6 md:h-6"
            strokeWidth={1.5}
          />
        </div>
        <div className="flex-grow">
          <div className="text-lg md:text-xl font-semibold text-purple-200">
            {featuresCount}
          </div>
          <div className="text-[10px] md:text-xs text-gray-400">
            Fitur Utama
          </div>
        </div>
      </div>
    </div>
  );
};

const handleGithubClick = (githubLink) => {
  if (githubLink === "Private") {
    Swal.fire({
      icon: "info",
      title: "Source Code Private",
      text: "Maaf, source code untuk proyek ini bersifat privat.",
      confirmButtonText: "Mengerti",
      confirmButtonColor: "#3085d6",
      background: "#030014",
      color: "#ffffff",
    });
    return false;
  }
  return true;
};

const DetailStyles = () => (
  <style>{`
    @keyframes blob {
      0% {
        transform: translate(0px, 0px) scale(1);
      }
      33% {
        transform: translate(30px, -50px) scale(1.1);
      }
      66% {
        transform: translate(-20px, 20px) scale(0.9);
      }
      100% {
        transform: translate(0px, 0px) scale(1);
      }
    }
    .animate-blob {
      animation: blob 10s infinite;
    }
    .animation-delay-2000 {
      animation-delay: 2s;
    }
    .animation-delay-4000 {
      animation-delay: 4s;
    }
    .animate-fadeIn {
      animation: fadeIn 0.7s ease-out;
    }
    .animate-slideInLeft {
      animation: slideInLeft 0.7s ease-out;
    }
    .animate-slideInRight {
      animation: slideInRight 0.7s ease-out;
    }
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
    @keyframes slideInLeft {
      from {
        opacity: 0;
        transform: translateX(-30px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    @keyframes slideInRight {
      from {
        opacity: 0;
        transform: translateX(30px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
  `}</style>
);

const Backdrop = () => (
  <div className="fixed inset-0">
    <div className="absolute -inset-[10px] opacity-20">
      <div className="absolute top-0 -left-4 w-72 md:w-96 h-72 md:h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
      <div className="absolute top-0 -right-4 w-72 md:w-96 h-72 md:h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-72 md:w-96 h-72 md:h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />
    </div>
    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02]" />
  </div>
);

const primaryActionClass =
  "group inline-flex items-center gap-2 px-5 md:px-7 py-2.5 md:py-3 bg-gradient-to-r from-blue-600/20 to-purple-600/20 hover:from-blue-600/30 hover:to-purple-600/30 text-blue-200 rounded-xl border border-blue-500/20 hover:border-blue-500/40 backdrop-blur-xl transition-all duration-300 text-sm md:text-base";

const secondaryActionClass =
  "group inline-flex items-center gap-2 px-5 md:px-7 py-2.5 md:py-3 bg-white/5 hover:bg-white/10 text-white/90 rounded-xl border border-white/10 hover:border-white/20 backdrop-blur-xl transition-all duration-300 text-sm md:text-base";

const StatusScreen = ({ code, title, description, actions }) => (
  <div className="min-h-screen bg-[#030014] relative overflow-hidden flex items-center justify-center px-[5%]">
    <Backdrop />
    <div className="relative z-10 w-full max-w-2xl text-center space-y-5 md:space-y-6 py-24 animate-fadeIn">
      {code && (
        <p className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 bg-clip-text text-transparent">
          {code}
        </p>
      )}
      <h1 className="text-2xl md:text-4xl font-bold text-white">{title}</h1>
      <p className="text-sm md:text-base text-gray-400 leading-relaxed">
        {description}
      </p>
      {actions && (
        <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 pt-2">
          {actions}
        </div>
      )}
    </div>
    <DetailStyles />
  </div>
);

// Section #Portofolio baru dirender setelah WelcomeScreen selesai (~4 detik),
// jadi elemennya ditunggu sampai muncul lalu digulir. Timer ini mengakhiri
// dirinya sendiri, jadi aman walau komponen pemanggilnya sudah unmount.
const scrollToPortfolioSection = () => {
  let attempts = 0;
  const timer = setInterval(() => {
    const section = document.querySelector("#Portofolio");
    if (section) {
      clearInterval(timer);
      section.scrollIntoView({ behavior: "smooth" });
    } else if (++attempts > 120) {
      clearInterval(timer);
    }
  }, 100);
};

const ProjectNotFound = ({ slug }) => {
  const navigate = useNavigate();

  const goToProjects = () => {
    navigate("/");
    scrollToPortfolioSection();
  };

  return (
    <>
      <Helmet>
        <title>Project Tidak Ditemukan — Eki Zulfar Rachman</title>
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <StatusScreen
        code="404"
        title="Project tidak ditemukan"
        description={
          <>
            Tautan dengan alamat{" "}
            <span className="text-white/90 font-medium break-all">
              “{slug}”
            </span>{" "}
            tidak cocok dengan project mana pun. Mungkin tautannya salah ketik,
            atau projectnya sudah tidak ada lagi.
          </>
        }
        actions={
          <>
            <Link to="/" className={primaryActionClass}>
              <Home className="w-4 h-4 md:w-5 md:h-5" />
              <span className="font-medium">Kembali ke Home</span>
            </Link>
            <button onClick={goToProjects} className={secondaryActionClass}>
              <Layers className="w-4 h-4 md:w-5 md:h-5" />
              <span className="font-medium">Lihat Semua Project</span>
            </button>
          </>
        }
      />
    </>
  );
};

const ProjectLoadError = ({ onRetry }) => (
  <>
    <Helmet>
      <title>Gagal Memuat Project — Eki Zulfar Rachman</title>
      <meta name="robots" content="noindex, follow" />
    </Helmet>
    <StatusScreen
      code="Oops!"
      title="Gagal memuat project"
      description="Kami tidak bisa mengambil data project dari server. Periksa koneksi internetmu, lalu coba lagi."
      actions={
        <>
          <button onClick={onRetry} className={primaryActionClass}>
            <RefreshCw className="w-4 h-4 md:w-5 md:h-5 group-hover:rotate-180 transition-transform duration-500" />
            <span className="font-medium">Coba Lagi</span>
          </button>
          <Link to="/" className={secondaryActionClass}>
            <Home className="w-4 h-4 md:w-5 md:h-5" />
            <span className="font-medium">Kembali ke Home</span>
          </Link>
        </>
      }
    />
  </>
);

const ProjectDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  // "loading" | "ready" | "notfound" | "error"
  const [status, setStatus] = useState("loading");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    let cancelled = false;

    // Cache dipakai lebih dulu supaya halaman langsung tampil,
    // lalu data terbaru diambil dari Supabase.
    const cachedProject = findProjectBySlug(readCachedProjects(), slug);
    setProject(cachedProject ? enhanceProject(cachedProject) : null);
    setStatus(cachedProject ? "ready" : "loading");

    const loadProject = async () => {
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .or("is_published.eq.true,is_published.is.null")
          .order("order_index", { ascending: true })
          .order("id", { ascending: false });

        if (error) throw error;
        if (cancelled) return;

        // Hasil server disaring & diurutkan ulang di sisi klien juga, supaya
        // proyek yang belum dipublikasikan tidak pernah masuk ke cache bersama.
        const projects = prepareProjects(data);
        localStorage.setItem(CACHE_KEY, JSON.stringify(projects));
        window.dispatchEvent(new Event("portfolioDataUpdated"));

        const freshProject = findProjectBySlug(projects, slug);
        if (freshProject) {
          setProject(enhanceProject(freshProject));
          setStatus("ready");
        } else {
          // Data server adalah sumber kebenaran: slug tidak ada di sana.
          setStatus("notfound");
        }
      } catch (error) {
        console.error("Gagal memuat project dari Supabase:", error.message);
        if (cancelled) return;
        // Kalau cache ada, halaman tetap bisa dibaca; kalau tidak, tawarkan coba lagi.
        if (!cachedProject) setStatus("error");
      }
    };

    loadProject();

    return () => {
      cancelled = true;
    };
  }, [slug, reloadKey]);

  if (status === "notfound") {
    return <ProjectNotFound slug={slug} />;
  }

  if (status === "error") {
    return <ProjectLoadError onRetry={() => setReloadKey((key) => key + 1)} />;
  }

  if (status !== "ready" || !project) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center">
        <div className="text-center space-y-6 animate-fadeIn">
          <div className="w-16 h-16 md:w-24 md:h-24 mx-auto border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          <h2 className="text-xl md:text-3xl font-bold text-white">
            Loading Project...
          </h2>
        </div>
        <DetailStyles />
      </div>
    );
  }

  const projectUrl = `https://ekizr.com/project/${toSlug(project.Title)}`;

  return (
    <>
      <Helmet>
        <title>{project.Title} — Eki Zulfar Rachman</title>
        <meta
          name="description"
          content={
            project.Description
              ? project.Description.slice(0, 155)
              : `Project ${project.Title} oleh Eki Zulfar Rachman — Frontend Web Developer.`
          }
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={projectUrl} />
        <meta
          property="og:title"
          content={`${project.Title} — Eki Zulfar Rachman`}
        />
        <meta
          property="og:description"
          content={project.Description?.slice(0, 155)}
        />
        <meta property="og:url" content={projectUrl} />
        <meta property="og:type" content="website" />
        {project.Img && <meta property="og:image" content={project.Img} />}
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "CreativeWork",
            "name": "${project.Title}",
            "description": "${project.Description?.replace(/"/g, '\\"')}",
            "url": "${projectUrl}",
            "author": {
              "@type": "Person",
              "name": "Eki Zulfar Rachman",
              "url": "https://ekizr.com"
            }
          }
        `}</script>
      </Helmet>

      <div className="min-h-screen bg-[#030014] px-[2%] sm:px-0 relative overflow-hidden">
        <Backdrop />

        <div className="relative">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-16">
            <div className="flex items-center space-x-2 md:space-x-4 mb-8 md:mb-12 animate-fadeIn">
              <button
                onClick={() => navigate(-1)}
                className="group inline-flex items-center space-x-1.5 md:space-x-2 px-3 md:px-5 py-2 md:py-2.5 bg-white/5 backdrop-blur-xl rounded-xl text-white/90 hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-white/20 text-sm md:text-base"
              >
                <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 group-hover:-translate-x-1 transition-transform" />
                <span>Back</span>
              </button>
              <div className="flex items-center space-x-1 md:space-x-2 text-sm md:text-base text-white/50">
                <span>Projects</span>
                <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
                <span className="text-white/90 truncate">{project.Title}</span>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 md:gap-16">
              <div className="space-y-6 md:space-y-10 animate-slideInLeft">
                <div className="space-y-4 md:space-y-6">
                  <h1 className="text-3xl md:text-6xl font-bold bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 bg-clip-text text-transparent leading-tight">
                    {project.Title}
                  </h1>
                  <div className="relative h-1 w-16 md:w-24">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse" />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-sm" />
                  </div>
                </div>

                <div className="prose prose-invert max-w-none">
                  <p className="text-base md:text-lg text-gray-300/90 leading-relaxed">
                    {project.Description}
                  </p>
                </div>

                <ProjectStats project={project} />

                <div className="flex flex-wrap gap-3 md:gap-4">
                  <a
                    href={project.Link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative inline-flex items-center space-x-1.5 md:space-x-2 px-4 md:px-8 py-2.5 md:py-4 bg-gradient-to-r from-blue-600/10 to-purple-600/10 hover:from-blue-600/20 hover:to-purple-600/20 text-blue-300 rounded-xl transition-all duration-300 border border-blue-500/20 hover:border-blue-500/40 backdrop-blur-xl overflow-hidden text-sm md:text-base"
                  >
                    <div className="absolute inset-0 translate-y-[100%] bg-gradient-to-r from-blue-600/10 to-purple-600/10 transition-transform duration-300 group-hover:translate-y-[0%]" />
                    <ExternalLink className="relative w-4 h-4 md:w-5 md:h-5 group-hover:rotate-12 transition-transform" />
                    <span className="relative font-medium">Live Demo</span>
                  </a>

                  <a
                    href={project.Github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative inline-flex items-center space-x-1.5 md:space-x-2 px-4 md:px-8 py-2.5 md:py-4 bg-gradient-to-r from-purple-600/10 to-pink-600/10 hover:from-purple-600/20 hover:to-pink-600/20 text-purple-300 rounded-xl transition-all duration-300 border border-purple-500/20 hover:border-purple-500/40 backdrop-blur-xl overflow-hidden text-sm md:text-base"
                    onClick={(e) =>
                      !handleGithubClick(project.Github) && e.preventDefault()
                    }
                  >
                    <div className="absolute inset-0 translate-y-[100%] bg-gradient-to-r from-purple-600/10 to-pink-600/10 transition-transform duration-300 group-hover:translate-y-[0%]" />
                    <Github className="relative w-4 h-4 md:w-5 md:h-5 group-hover:rotate-12 transition-transform" />
                    <span className="relative font-medium">Github</span>
                  </a>
                </div>

                <div className="space-y-4 md:space-y-6">
                  <h3 className="text-lg md:text-xl font-semibold text-white/90 mt-[3rem] md:mt-0 flex items-center gap-2 md:gap-3">
                    <Code2 className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
                    Technologies Used
                  </h3>
                  {project.TechStack.length > 0 ? (
                    <div className="flex flex-wrap gap-2 md:gap-3">
                      {project.TechStack.map((tech, index) => (
                        <TechBadge key={index} tech={tech} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm md:text-base text-gray-400 opacity-50">
                      No technologies added.
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-6 md:space-y-10 animate-slideInRight">
                <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl group">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#030014] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <img
                    src={project.Img}
                    alt={project.Title}
                    className="w-full object-cover transform transition-transform duration-700 will-change-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 border-2 border-white/0 group-hover:border-white/10 transition-colors duration-300 rounded-2xl" />
                </div>

                <div className="bg-white/[0.02] backdrop-blur-xl rounded-2xl p-8 border border-white/10 space-y-6 hover:border-white/20 transition-colors duration-300 group">
                  <h3 className="text-xl font-semibold text-white/90 flex items-center gap-3">
                    <Star className="w-5 h-5 text-yellow-400 group-hover:rotate-[20deg] transition-transform duration-300" />
                    Key Features
                  </h3>
                  {project.Features.length > 0 ? (
                    <ul className="list-none space-y-2">
                      {project.Features.map((feature, index) => (
                        <FeatureItem key={index} feature={feature} />
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-400 opacity-50">
                      No features added.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <DetailStyles />
      </div>
    </>
  );
};

export default ProjectDetails;
