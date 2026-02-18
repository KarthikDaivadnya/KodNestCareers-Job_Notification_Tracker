/* ============================================================
 * KODNEST CAREERS — MATCH SCORE ENGINE v1.0
 * ============================================================
 * Deterministic scoring. Each rule fires at most once.
 * Max possible score = 100 (capped).
 *
 * SCORING RULES:
 * +25  any roleKeyword in job.title         (case-insensitive)
 * +15  any roleKeyword in job.description   (case-insensitive)
 * +15  job.location in preferredLocations
 * +10  job.mode in preferredMode
 * +10  job.experience === experienceLevel
 * +15  any skill overlap (job.skills ∩ user.skills)
 * +5   postedDaysAgo <= 2
 * +5   source === 'LinkedIn'
 * ── cap at 100 ──
 * ============================================================ */

(function () {
  'use strict';

  var LS_PREFS = 'jobTrackerPreferences';

  /* ── Helpers ─────────────────────────────────────────────── */

  function csvToArray(str) {
    if (!str) return [];
    return str.split(',').map(function (s) { return s.trim().toLowerCase(); }).filter(Boolean);
  }

  function anyMatch(needles, haystack) {
    if (!needles.length || !haystack.length) return false;
    return needles.some(function (n) { return haystack.indexOf(n) !== -1; });
  }

  function skillsOverlap(userSkills, jobSkills) {
    /* Tolerant matching: 'react' matches 'react', 'react native', etc. */
    if (!userSkills.length || !jobSkills.length) return false;
    return userSkills.some(function (us) {
      return jobSkills.some(function (js) {
        return js.indexOf(us) !== -1 || us.indexOf(js) !== -1;
      });
    });
  }

  /* ── Public API ──────────────────────────────────────────── */

  function getPreferences() {
    try {
      var raw = localStorage.getItem(LS_PREFS);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function savePreferences(prefs) {
    localStorage.setItem(LS_PREFS, JSON.stringify(prefs));
  }

  function computeMatchScore(job, prefs) {
    if (!prefs) return 0;

    var score = 0;

    /* --- Role keywords --------------------------------------- */
    var keywords  = csvToArray(prefs.roleKeywords || '');
    var titleLow  = (job.title || '').toLowerCase();
    var descLow   = (job.description || '').toLowerCase();

    if (keywords.length) {
      /* +25 if any keyword in title */
      if (keywords.some(function (kw) { return titleLow.indexOf(kw) !== -1; })) {
        score += 25;
      }
      /* +15 if any keyword in description */
      if (keywords.some(function (kw) { return descLow.indexOf(kw) !== -1; })) {
        score += 15;
      }
    }

    /* --- Location -------------------------------------------- */
    var locs = prefs.preferredLocations || [];
    if (locs.length && locs.indexOf(job.location) !== -1) {
      score += 15;
    }

    /* --- Work mode ------------------------------------------- */
    var modes = prefs.preferredMode || [];
    if (modes.length && modes.indexOf(job.mode) !== -1) {
      score += 10;
    }

    /* --- Experience level ------------------------------------ */
    if (prefs.experienceLevel && prefs.experienceLevel === job.experience) {
      score += 10;
    }

    /* --- Skills overlap ------------------------------------- */
    var userSkills = csvToArray(prefs.skills || '');
    var jobSkills  = (job.skills || []).map(function (s) { return s.toLowerCase(); });
    if (skillsOverlap(userSkills, jobSkills)) {
      score += 15;
    }

    /* --- Recency bonus ------------------------------------- */
    if (job.postedDaysAgo <= 2) { score += 5; }

    /* --- Source bonus -------------------------------------- */
    if (job.source === 'LinkedIn') { score += 5; }

    /* --- Cap ----------------------------------------------- */
    return Math.min(score, 100);
  }

  /* Score tier helper for badge colouring */
  function scoreTier(score) {
    if (score >= 80) return 'high';   /* green  */
    if (score >= 60) return 'mid';    /* amber  */
    if (score >= 40) return 'low';    /* neutral*/
    return 'poor';                    /* grey   */
  }

  /* Salary extract for numeric sort */
  function extractSalaryNum(salaryRange) {
    var m = (salaryRange || '').replace(/[₹,]/g, '').match(/[\d.]+/);
    return m ? parseFloat(m[0]) : 0;
  }

  window.MATCH_ENGINE = {
    getPreferences:    getPreferences,
    savePreferences:   savePreferences,
    computeMatchScore: computeMatchScore,
    scoreTier:         scoreTier,
    extractSalaryNum:  extractSalaryNum
  };

}());
