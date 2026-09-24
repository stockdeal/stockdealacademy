const { Router } = require("express");
const { createLead } = require("../controllers/leads.controller");

const router = Router();

router.post("/", createLead);

module.exports = router;
