'use strict';

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

exports.EXPERT_FIELDS = EXPERT_FIELDS;
exports.FILTER_KEYS = FILTER_KEYS;
exports.SORT_OPTIONS = SORT_OPTIONS;
exports.isErrorResponse = isErrorResponse;
exports.isExpertProfile = isExpertProfile;
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map