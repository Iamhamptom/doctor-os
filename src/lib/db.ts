// @ts-nocheck — Supabase-to-Prisma compatibility shim
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Prisma-compatible proxy: translates prisma-style calls to Supabase queries
// This lets our tools work without changing their code
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const prisma: any = new Proxy({} as Record<string, unknown>, {
  get(_target, model: string) {
    const table = `dos_${camelToSnake(model)}s`;

    return {
      findMany: async (opts: { where?: Record<string, unknown>; orderBy?: Record<string, string> | Record<string, string>[]; take?: number; select?: Record<string, boolean>; include?: Record<string, unknown> }) => {
        let query = supabase.from(table).select("*");
        if (opts?.where) query = applyWhere(query, opts.where);
        if (opts?.take) query = query.limit(opts.take);
        if (opts?.orderBy) query = applyOrderBy(query, opts.orderBy);
        const { data, error } = await query;
        if (error) { console.warn(`[db] ${table} findMany error:`, error.message); return []; }
        return (data || []).map(row => snakeToCamelObj(row));
      },

      findFirst: async (opts: { where?: Record<string, unknown> }) => {
        let query = supabase.from(table).select("*");
        if (opts?.where) query = applyWhere(query, opts.where);
        query = query.limit(1).single();
        const { data, error } = await query;
        if (error) return null;
        return data ? snakeToCamelObj(data) : null;
      },

      findUnique: async (opts: { where?: Record<string, unknown> }) => {
        let query = supabase.from(table).select("*");
        if (opts?.where) query = applyWhere(query, opts.where);
        query = query.limit(1).single();
        const { data, error } = await query;
        if (error) return null;
        return data ? snakeToCamelObj(data) : null;
      },

      create: async (opts: { data: Record<string, unknown> }) => {
        const row = camelToSnakeObj(opts.data);
        const { data, error } = await supabase.from(table).insert(row).select().single();
        if (error) { console.error(`[db] ${table} create error:`, error.message); throw error; }
        return snakeToCamelObj(data);
      },

      update: async (opts: { where: Record<string, unknown>; data: Record<string, unknown> }) => {
        const row = camelToSnakeObj(opts.data);
        let query = supabase.from(table).update(row);
        if (opts.where.id) query = query.eq("id", opts.where.id);
        const { data, error } = await query.select().single();
        if (error) { console.error(`[db] ${table} update error:`, error.message); throw error; }
        return snakeToCamelObj(data);
      },

      updateMany: async (opts: { where: Record<string, unknown>; data: Record<string, unknown> }) => {
        const row = camelToSnakeObj(opts.data);
        let query = supabase.from(table).update(row);
        query = applyWhere(query, opts.where);
        const { data, error } = await query.select();
        if (error) return { count: 0 };
        return { count: data?.length || 0 };
      },

      count: async (opts?: { where?: Record<string, unknown> }) => {
        let query = supabase.from(table).select("id", { count: "exact", head: true });
        if (opts?.where) query = applyWhere(query, opts.where);
        const { count, error } = await query;
        if (error) return 0;
        return count || 0;
      },
    };
  },
});

// ── Helpers ─────────────────────────────────────────

function camelToSnake(s: string): string {
  return s.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

function snakeToCamel(s: string): string {
  return s.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

function camelToSnakeObj(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[camelToSnake(key)] = value;
  }
  return result;
}

function snakeToCamelObj(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[snakeToCamel(key)] = value;
  }
  return result;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyWhere(query: any, where: Record<string, unknown>): any {
  for (const [key, value] of Object.entries(where)) {
    if (key === "OR") continue; // Skip complex OR clauses for now
    if (key === "NOT") continue;
    const col = camelToSnake(key);

    if (value && typeof value === "object" && !Array.isArray(value)) {
      const cond = value as Record<string, unknown>;
      if ("contains" in cond) query = query.ilike(col, `%${cond.contains}%`);
      else if ("gte" in cond && "lt" in cond) query = query.gte(col, cond.gte).lt(col, cond.lt);
      else if ("gte" in cond && "lte" in cond) query = query.gte(col, cond.gte).lte(col, cond.lte);
      else if ("gte" in cond) query = query.gte(col, cond.gte);
      else if ("lte" in cond) query = query.lte(col, cond.lte);
      else if ("lt" in cond) query = query.lt(col, cond.lt);
      else if ("not" in cond) query = query.neq(col, cond.not);
      else if ("in" in cond) query = query.in(col, cond.in as unknown[]);
      else query = query.eq(col, value);
    } else {
      query = query.eq(col, value);
    }
  }
  return query;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyOrderBy(query: any, orderBy: Record<string, string> | Record<string, string>[]): any {
  const orders = Array.isArray(orderBy) ? orderBy : [orderBy];
  for (const order of orders) {
    for (const [key, dir] of Object.entries(order)) {
      query = query.order(camelToSnake(key), { ascending: dir === "asc" });
    }
  }
  return query;
}
