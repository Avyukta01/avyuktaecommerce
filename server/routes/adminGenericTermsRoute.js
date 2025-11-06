const express = require("express");
const {
  getTerms,
  getTerm,
  createTerm,
  updateTerm,
  deleteTerm,
} = require("../controllers/adminGenericTermsController");

const router = express.Router();

router.get("/", getTerms);
router.get("/:id", getTerm);
router.post("/", createTerm);
router.put("/:id", updateTerm);
router.delete("/:id", deleteTerm);

module.exports = router;
