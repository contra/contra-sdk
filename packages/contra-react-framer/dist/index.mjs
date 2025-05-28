// src/components.tsx
import { useEffect, useState } from "react";

// src/context.tsx
import { createContext, useContext, useMemo } from "react";
import { ContraClient } from "@contra/contra-core";
import { jsx } from "react/jsx-runtime";
var ContraContext = createContext(null);
function ContraProvider({ apiKey, baseUrl, children }) {
  const client = useMemo(() => {
    return new ContraClient({ apiKey, baseUrl });
  }, [apiKey, baseUrl]);
  return /* @__PURE__ */ jsx(ContraContext.Provider, { value: client, children });
}
function useContra() {
  const client = useContext(ContraContext);
  if (!client) {
    throw new Error("useContra must be used within a ContraProvider");
  }
  return client;
}

// src/components.tsx
import { jsx as jsx2, jsxs } from "react/jsx-runtime";
function StarRating({ score, maxStars = 5, className, style }) {
  const fullStars = Math.floor(score);
  const hasHalfStar = score % 1 >= 0.5;
  const emptyStars = maxStars - fullStars - (hasHalfStar ? 1 : 0);
  return /* @__PURE__ */ jsxs("div", { className, style, children: [
    Array.from({ length: fullStars }, (_, i) => /* @__PURE__ */ jsx2("span", { style: { color: "#FFD700" }, children: "\u2605" }, `full-${i}`)),
    hasHalfStar && /* @__PURE__ */ jsx2("span", { style: { color: "#FFD700" }, children: "\u2606" }),
    Array.from({ length: emptyStars }, (_, i) => /* @__PURE__ */ jsx2("span", { style: { color: "#E5E5E5" }, children: "\u2606" }, `empty-${i}`))
  ] });
}
function ExpertCard({ expert, className, style, showProjects = true, maxProjects = 4 }) {
  return /* @__PURE__ */ jsxs("div", { className, style, children: [
    /* @__PURE__ */ jsx2("img", { src: expert.avatarUrl, alt: expert.name }),
    /* @__PURE__ */ jsx2("h3", { children: expert.name }),
    /* @__PURE__ */ jsx2(StarRating, { score: expert.averageReviewScore }),
    /* @__PURE__ */ jsxs("p", { children: [
      "$",
      expert.hourlyRateUSD,
      "/hr"
    ] }),
    expert.bio && /* @__PURE__ */ jsx2("p", { children: expert.bio }),
    expert.location && /* @__PURE__ */ jsx2("p", { children: expert.location }),
    showProjects && expert.projects.length > 0 && /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx2("h4", { children: "Recent Projects" }),
      /* @__PURE__ */ jsx2("div", { style: { display: "flex", gap: "10px", flexWrap: "wrap" }, children: expert.projects.slice(0, maxProjects).map((project) => /* @__PURE__ */ jsx2("div", { style: { width: "60px", height: "60px" }, children: /* @__PURE__ */ jsx2(
        "img",
        {
          src: project.coverUrl,
          alt: project.title,
          style: { width: "100%", height: "100%", objectFit: "cover", borderRadius: "4px" }
        }
      ) }, project.id)) })
    ] })
  ] });
}
function ExpertList({
  program,
  filters,
  className,
  style,
  renderExpert,
  renderEmpty,
  renderLoading,
  renderError
}) {
  const client = useContra();
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    let isCancelled = false;
    async function fetchExperts() {
      try {
        setLoading(true);
        setError(null);
        const response = await client.listExperts(program, filters);
        if (!isCancelled) {
          setExperts(response.data);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err : new Error("Failed to fetch experts"));
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }
    fetchExperts();
    return () => {
      isCancelled = true;
    };
  }, [client, program, filters]);
  if (loading) {
    return renderLoading ? renderLoading() : /* @__PURE__ */ jsx2("div", { children: "Loading experts..." });
  }
  if (error) {
    return renderError ? renderError(error) : /* @__PURE__ */ jsxs("div", { children: [
      "Error: ",
      error.message
    ] });
  }
  if (experts.length === 0) {
    return renderEmpty ? renderEmpty() : /* @__PURE__ */ jsx2("div", { children: "No experts found" });
  }
  return /* @__PURE__ */ jsx2("div", { className, style, children: experts.map(
    (expert) => renderExpert ? renderExpert(expert) : /* @__PURE__ */ jsx2(ExpertCard, { expert }, expert.id)
  ) });
}
export {
  ContraProvider,
  ExpertCard,
  ExpertList,
  StarRating,
  useContra
};
//# sourceMappingURL=index.mjs.map