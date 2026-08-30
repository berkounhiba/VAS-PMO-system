/* ============================================================
   CONFIG CONSTANTS ONLY
   Everything that used to be sample/fake DATA now comes from the
   real database (see api.js + normalize.js + App.jsx). What's
   left here are genuine UI configuration values — thresholds for
   coloring, not records — which is a legitimate thing to keep as
   frontend config rather than a database table.
============================================================= */
export const RAG_THRESHOLDS = { redDelay: 14, amberDelay: 7 };
export const UTIL_THRESHOLDS = { overloaded: 0.9, healthy: 0.7 };
