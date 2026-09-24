const { Router } = require("express");
const { listUsers, listLeads } = require("../controllers/admin.controller");
const { requireAdmin } = require("../middleware/auth");

const router = Router();

router.get("/users", requireAdmin, listUsers);
router.get("/leads", requireAdmin, listLeads);

module.exports = router;
