const prisma = require("../lib/prisma");

async function listUsers(req, res) {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
    },
  });
  return res.json({ users });
}

async function listLeads(req, res) {
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });
  return res.json({ leads });
}

module.exports = { listUsers, listLeads };
