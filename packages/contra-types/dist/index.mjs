// src/index.ts
var isExpertProfile = (obj) => {
  return obj && typeof obj.id === "string" && typeof obj.name === "string";
};
var isErrorResponse = (obj) => {
  return obj && typeof obj.code === "string" && typeof obj.message === "string";
};
var EXPERT_FIELDS = [
  "id",
  "name",
  "oneLiner",
  "avatarUrl",
  "profileUrl",
  "inquiryUrl",
  "hourlyRateUSD",
  "location",
  "available",
  "averageReviewScore",
  "reviewsCount",
  "projectsCompletedCount",
  "followersCount",
  "earningsUSD",
  "skillTags",
  "socialLinks",
  "projects"
];
var FILTER_KEYS = [
  "available",
  "languages",
  "location",
  "minRate",
  "maxRate",
  "sortBy",
  "limit",
  "offset",
  "q"
];
var SORT_OPTIONS = [
  "relevance",
  "newest",
  "oldest",
  "rate_asc",
  "rate_desc",
  "rating_desc"
];

export { EXPERT_FIELDS, FILTER_KEYS, SORT_OPTIONS, isErrorResponse, isExpertProfile };
//# sourceMappingURL=index.mjs.map
//# sourceMappingURL=index.mjs.map