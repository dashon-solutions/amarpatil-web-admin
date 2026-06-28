const mongoose = require("mongoose");
const { AsyncLocalStorage } = require("async_hooks");
const tenantsConfig = require("../config/tenants");

const asyncLocalStorage = new AsyncLocalStorage();
const tenantConnections = {};

// Override mongoose.model and mongoose.models to route queries dynamically
const originalModel = mongoose.model.bind(mongoose);
const schemas = {};

// Override connection model method to automatically compile schemas on tenant connections during population
const originalConnectionModel = mongoose.Connection.prototype.model;
mongoose.Connection.prototype.model = function (name, schema, collection) {
  if (!schema && !this.models[name]) {
    schema = schemas[name] || mongoose.modelSchemas[name] || (mongoose.models[name] && mongoose.models[name].schema);
  }
  return originalConnectionModel.call(this, name, schema, collection);
};

mongoose.model = function (name, schema, collection) {
  if (schema) {
    schemas[name] = schema;
    const defaultModel = originalModel(name, schema, collection);
    return createTenantModelProxy(name, defaultModel);
  } else {
    const defaultModel = originalModel(name);
    return createTenantModelProxy(name, defaultModel);
  }
};

// Wrap mongoose.models as well so directly accessed models are proxied
mongoose.models = new Proxy(mongoose.models, {
  get(target, prop, receiver) {
    const model = Reflect.get(target, prop, receiver);
    if (model) {
      return createTenantModelProxy(prop, model);
    }
    return model;
  }
});

function createTenantModelProxy(name, defaultModel) {
  return new Proxy(defaultModel, {
    get(target, prop, receiver) {
      const store = asyncLocalStorage.getStore();
      if (store && store.connection) {
        const schema = schemas[name] || target.schema;
        // Avoid overwriting error by retrieving existing compiled model
        const tenantModel = store.connection.models[name] || store.connection.model(name, schema);
        const value = Reflect.get(tenantModel, prop, tenantModel);
        return typeof value === "function" ? value.bind(tenantModel) : value;
      }
      // Only log warnings for operations that query or modify DB, not internal mongoose properties
      const dbOperations = ["find", "findOne", "create", "save", "update", "delete", "countDocuments", "findById"];
      if (dbOperations.some(op => String(prop).startsWith(op) || op === prop)) {
        console.warn(`[Tenant Proxy Fallback] No tenant store found for model ${name}, property ${String(prop)}. Active store:`, !!store);
      }
      return Reflect.get(target, prop, receiver);
    },
    construct(target, args, newTarget) {
      const store = asyncLocalStorage.getStore();
      if (store && store.connection) {
        const schema = schemas[name] || target.schema;
        const tenantModel = store.connection.models[name] || store.connection.model(name, schema);
        return Reflect.construct(tenantModel, args, tenantModel);
      }
      console.warn(`[Tenant Proxy Fallback] No tenant store found on construct for model ${name}. Active store:`, !!store);
      return Reflect.construct(target, args, newTarget);
    }
  });
}

/**
 * Get or establish a database connection for a tenant
 */
const getTenantConnection = async (domain, uri) => {
  if (tenantConnections[domain]) {
    return tenantConnections[domain];
  }

  const connection = mongoose.createConnection(uri);

  connection.on("connected", () => {
    console.log(`[Tenant DB] Connected successfully to domain: ${domain}`);
  });

  connection.on("error", (err) => {
    console.error(`[Tenant DB] Error for domain ${domain}:`, err);
  });

  tenantConnections[domain] = connection;
  return connection;
};

/**
 * Helper to normalize domains/URLs by extracting hostnames and removing protocol/ports
 */
const normalizeDomain = (domainStr) => {
  if (!domainStr) return "";
  try {
    if (domainStr.includes("://")) {
      return new URL(domainStr).hostname;
    }
    return domainStr.split(":")[0].toLowerCase();
  } catch (_) {
    return domainStr.toLowerCase();
  }
};

/**
 * Resolves a Tenant ID key (e.g. 'amarpatil', 'gabha') matching the request domain
 */
const resolveTenantId = (domain) => {
  if (!domain) return null;
  const normalized = normalizeDomain(domain);

  for (const [tenantId, config] of Object.entries(tenantsConfig)) {
    // Check if domain matches any in the domains array
    if (Array.isArray(config.domains)) {
      const hasMatch = config.domains.some(d => normalizeDomain(d) === normalized);
      if (hasMatch) {
        return tenantId;
      }
    }
    // Fallback: check if the key itself matches
    if (normalizeDomain(tenantId) === normalized) {
      return tenantId;
    }
  }
  return null;
};

/**
 * Express Middleware to resolve domain and wrap request in AsyncLocalStorage
 */
const tenantMiddleware = async (req, res, next) => {
  let requestDomain = req.headers["x-tenant-domain"];

  if (!requestDomain && req.query.tenantDomain) {
    requestDomain = req.query.tenantDomain;
  }

  if (!requestDomain && req.query.tenant) {
    requestDomain = req.query.tenant;
  }

  if (!requestDomain && req.headers.origin) {
    requestDomain = req.headers.origin;
  }

  if (!requestDomain && req.headers.referer) {
    requestDomain = req.headers.referer;
  }

  let tenantId = resolveTenantId(requestDomain);

  // Local development / testing hostname fallback
  if (!tenantId) {
    const hostDomain = normalizeDomain(req.headers.host || "");
    if (!hostDomain || hostDomain === "localhost" || hostDomain === "127.0.0.1") {
      tenantId = process.env.DEFAULT_TENANT_DOMAIN || Object.keys(tenantsConfig)[0];
    }
  }

  const config = tenantsConfig[tenantId];
  if (!config) {
    return res.status(404).json({ error: `Tenant configuration not found for requested domain: ${requestDomain || 'none'}` });
  }

  try {
    const connection = await getTenantConnection(tenantId, config.MONGODB_URI);

    // Setup request variables
    req.tenant = tenantId;
    req.tenantConfig = config;
    req.tenantConnection = connection;

    // Run request within the AsyncLocalStorage context
    asyncLocalStorage.run({ connection, config, tenant: tenantId }, () => {
      next();
    });
  } catch (error) {
    console.error(`[Tenant Middleware] Failed to initialize tenant context:`, error);
    res.status(500).json({ error: "Failed to establish tenant context" });
  }
};

/**
 * Helper to get current tenant configuration from context
 */
const getTenantConfig = () => {
  const store = asyncLocalStorage.getStore();
  return store ? store.config : null;
};

/**
 * Helper to get current tenant database connection from context
 */
const getTenantConnectionFromContext = () => {
  const store = asyncLocalStorage.getStore();
  return store ? store.connection : null;
};

module.exports = {
  tenantMiddleware,
  getTenantConnection,
  getTenantConfig,
  getTenantConnectionFromContext,
  resolveTenantId,
  asyncLocalStorage,
};
