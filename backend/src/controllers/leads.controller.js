const prisma = require("../lib/prisma");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9]{10}$/;
const SOURCES = ["SCHOLARSHIP", "JOIN_FREE", "CONTACT"];

const clean = (v, max = 500) =>
  typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null;

async function createLead(req, res) {
  const { source } = req.body;
  if (!SOURCES.includes(source)) {
    return res.status(400).json({ error: "Invalid lead source" });
  }

  const data = {
    source,
    name: clean(req.body.name, 120),
    email: clean(req.body.email, 200),
    phone: clean(req.body.phone, 20),
    whatsapp: clean(req.body.whatsapp, 20),
    topic: clean(req.body.topic, 100),
    plan: clean(req.body.plan, 100),
    message: clean(req.body.message, 2000),
  };

  if (data.email && !EMAIL_RE.test(data.email)) {
    return res.status(400).json({ error: "Please enter a valid email" });
  }
  if (data.phone && !PHONE_RE.test(data.phone)) {
    return res.status(400).json({ error: "Mobile number must be 10 digits" });
  }
  if (data.whatsapp && !PHONE_RE.test(data.whatsapp)) {
    return res.status(400).json({ error: "WhatsApp number must be 10 digits" });
  }

  if (source === "JOIN_FREE" && !data.phone) {
    return res.status(400).json({ error: "Mobile number is required" });
  }
  if (source === "SCHOLARSHIP" && (!data.name || !data.phone || !data.email)) {
    return res.status(400).json({ error: "Name, contact number and email are required" });
  }
  if (source === "CONTACT" && (!data.name || !data.email)) {
    return res.status(400).json({ error: "Name and email are required" });
  }

  await prisma.lead.create({ data });
  return res.status(201).json({ ok: true });
}

module.exports = { createLead };
