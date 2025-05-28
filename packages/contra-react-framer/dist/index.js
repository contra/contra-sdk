"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  ContraProvider: () => ContraProvider,
  ExpertCard: () => ExpertCard,
  ExpertList: () => ExpertList,
  StarRating: () => StarRating,
  useContra: () => useContra
});
module.exports = __toCommonJS(index_exports);

// src/components.tsx
var import_react2 = require("react");

// src/context.tsx
var import_react = require("react");
var import_contra_core = require("@contra/contra-core");
var import_jsx_runtime = require("react/jsx-runtime");
var ContraContext = (0, import_react.createContext)(null);
function ContraProvider({ apiKey, baseUrl, children }) {
  const client = (0, import_react.useMemo)(() => {
    return new import_contra_core.ContraClient({ apiKey, baseUrl });
  }, [apiKey, baseUrl]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContraContext.Provider, { value: client, children });
}
function useContra() {
  const client = (0, import_react.useContext)(ContraContext);
  if (!client) {
    throw new Error("useContra must be used within a ContraProvider");
  }
  return client;
}

// src/components.tsx
var import_jsx_runtime2 = require("react/jsx-runtime");
function StarRating({ score, maxStars = 5, className, style }) {
  const fullStars = Math.floor(score);
  const hasHalfStar = score % 1 >= 0.5;
  const emptyStars = maxStars - fullStars - (hasHalfStar ? 1 : 0);
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className, style, children: [
    Array.from({ length: fullStars }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { style: { color: "#FFD700" }, children: "\u2605" }, `full-${i}`)),
    hasHalfStar && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { style: { color: "#FFD700" }, children: "\u2606" }),
    Array.from({ length: emptyStars }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { style: { color: "#E5E5E5" }, children: "\u2606" }, `empty-${i}`))
  ] });
}
function ExpertCard({ expert, className, style, showProjects = true, maxProjects = 4 }) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className, style, children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("img", { src: expert.avatarUrl, alt: expert.name }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("h3", { children: expert.name }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(StarRating, { score: expert.averageReviewScore }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("p", { children: [
      "$",
      expert.hourlyRateUSD,
      "/hr"
    ] }),
    expert.bio && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { children: expert.bio }),
    expert.location && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { children: expert.location }),
    showProjects && expert.projects.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("h4", { children: "Recent Projects" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: { display: "flex", gap: "10px", flexWrap: "wrap" }, children: expert.projects.slice(0, maxProjects).map((project) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: { width: "60px", height: "60px" }, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
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
  const [experts, setExperts] = (0, import_react2.useState)([]);
  const [loading, setLoading] = (0, import_react2.useState)(true);
  const [error, setError] = (0, import_react2.useState)(null);
  (0, import_react2.useEffect)(() => {
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
    return renderLoading ? renderLoading() : /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { children: "Loading experts..." });
  }
  if (error) {
    return renderError ? renderError(error) : /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { children: [
      "Error: ",
      error.message
    ] });
  }
  if (experts.length === 0) {
    return renderEmpty ? renderEmpty() : /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { children: "No experts found" });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className, style, children: experts.map(
    (expert) => renderExpert ? renderExpert(expert) : /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(ExpertCard, { expert }, expert.id)
  ) });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ContraProvider,
  ExpertCard,
  ExpertList,
  StarRating,
  useContra
});
//# sourceMappingURL=index.js.map