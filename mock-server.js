// Mock Server para Admin Dashboard
// Corre con: bun mock-server.js

const PORT = 3000;

// Base de datos en memoria
const db = {
  users: [],
  tenants: []
};

// Generar JWT falso (solo para desarrollo)
function generateFakeJWT(userId, tenantId, email, role) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    userId,
    tenantId,
    email,
    role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400 // 24 horas
  }));
  const signature = btoa('mock-signature');
  return `${header}.${payload}.${signature}`;
}

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;

    // CORS headers
    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };

    // Handle preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers });
    }

    console.log(`${req.method} ${path}`);

    // ========== AUTH ENDPOINTS ==========

    // POST /admin/auth/signup
    if (path === '/admin/auth/signup' && req.method === 'POST') {
      const body = await req.json();
      const { email, password, name, tenantName, plan = 'starter' } = body;

      // Validar
      if (!email || !password || !name || !tenantName) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields' }),
          { status: 400, headers }
        );
      }

      // Verificar si ya existe
      if (db.users.find(u => u.email === email)) {
        return new Response(
          JSON.stringify({ error: 'Email already exists' }),
          { status: 400, headers }
        );
      }

      // Crear tenant
      const tenantId = `tenant_${Date.now()}`;
      const tenantSlug = tenantName.toLowerCase().replace(/\s+/g, '-');
      const tenant = {
        id: tenantId,
        name: tenantName,
        slug: tenantSlug,
        plan,
        createdAt: new Date().toISOString()
      };
      db.tenants.push(tenant);

      // Crear usuario
      const userId = `user_${Date.now()}`;
      const user = {
        id: userId,
        email,
        password, // En producción, esto debería estar hasheado
        name,
        role: 'admin',
        tenantId,
        createdAt: new Date().toISOString()
      };
      db.users.push(user);

      // Generar token
      const token = generateFakeJWT(userId, tenantId, email, 'admin');

      console.log(`✅ Signup exitoso: ${email} (Tenant: ${tenantName})`);

      return new Response(
        JSON.stringify({
          success: true,
          data: {
            token,
            user: {
              id: userId,
              email,
              name,
              role: 'admin',
              tenant: {
                id: tenantId,
                name: tenantName,
                slug: tenantSlug,
                plan
              }
            }
          }
        }),
        { headers }
      );
    }

    // POST /admin/auth/login
    if (path === '/admin/auth/login' && req.method === 'POST') {
      const body = await req.json();
      const { email, password } = body;

      // Buscar usuario
      const user = db.users.find(u => u.email === email && u.password === password);

      if (!user) {
        return new Response(
          JSON.stringify({ error: 'Invalid credentials' }),
          { status: 401, headers }
        );
      }

      // Buscar tenant
      const tenant = db.tenants.find(t => t.id === user.tenantId);

      // Generar token
      const token = generateFakeJWT(user.id, user.tenantId, user.email, user.role);

      console.log(`✅ Login exitoso: ${email}`);

      return new Response(
        JSON.stringify({
          success: true,
          data: {
            token,
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
              tenant: {
                id: tenant.id,
                name: tenant.name,
                slug: tenant.slug,
                plan: tenant.plan
              }
            }
          }
        }),
        { headers }
      );
    }

    // ========== HEALTH CHECK ==========
    if (path === '/health') {
      return new Response(
        JSON.stringify({
          status: 'ok',
          users: db.users.length,
          tenants: db.tenants.length
        }),
        { headers }
      );
    }

    // 404
    return new Response(
      JSON.stringify({ error: 'Not Found', path }),
      { status: 404, headers }
    );
  }
});

console.log(`🚀 Mock Server corriendo en http://localhost:${PORT}`);
console.log(`📝 Endpoints disponibles:`);
console.log(`   POST http://localhost:${PORT}/admin/auth/signup`);
console.log(`   POST http://localhost:${PORT}/admin/auth/login`);
console.log(`   GET  http://localhost:${PORT}/health`);
console.log(``);
console.log(`💡 Base de datos en memoria:`);
console.log(`   - Usuarios: ${db.users.length}`);
console.log(`   - Tenants: ${db.tenants.length}`);
