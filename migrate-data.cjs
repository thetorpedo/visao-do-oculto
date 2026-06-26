#!/usr/bin/env node

/**
 * Migrador de dados — Visão do Oculto
 * Lê os JSONs em /src/data, normaliza para o schema atual e salva em /src/data/migrated
 *
 * Uso: node migrate-data.cjs [--dry-run]
 *   --dry-run  Só valida e mostra erros, sem gravar arquivos
 */

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.resolve("./src/data");
const OUT_DIR = path.resolve("./src/data/migrated");
const DRY_RUN = process.argv.includes("--dry-run");

// ─────────────────────────────────────────
// Utilitários
// ─────────────────────────────────────────

function readJson(file) {
  const raw = fs.readFileSync(path.join(DATA_DIR, file), "utf-8");
  const data = JSON.parse(raw);
  return Array.isArray(data) ? data : Object.values(data).find(Array.isArray);
}

function writeJson(file, data) {
  if (DRY_RUN) return;
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, file), JSON.stringify(data, null, 2), "utf-8");
}

function toStr(value) {
  if (value === null || value === undefined) return null;
  return String(value);
}

function toSnakeCase(str) {
  return str
    .normalize("NFD")                        // separa acentos dos caracteres
    .replace(/[\u0300-\u036f]/g, "")         // remove acentos
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]/g, "")          // remove caracteres especiais
    .trim()
    .replace(/[\s-]+/g, "_");               // espaços e hífens viram _
}

function resolveId(item) {
  // Se já é string no formato snake_case, mantém
  if (typeof item.id === "string" && /^[a-z0-9_]+$/.test(item.id)) return item.id;
  // Se é numérico ou string com caractere estranho, gera do nome
  if (item.nome) return toSnakeCase(item.nome);
  // Fallback
  return `item_${item.id}`;
}

// Retorna o código numérico original, ou null se já era snake_case
function resolveCodigo(item, autoIndex) {
  if (typeof item.id === "number") return item.id;
  // Se era snake_case, não tinha código numérico — atribui sequencial
  return autoIndex;
}

function toStrRequired(value, fallback = "") {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function report(file, index, item, issues) {
  if (issues.length === 0) return;
  console.warn(`\n⚠️  ${file}[${index}] "${item.nome ?? item.id}":`);
  for (const issue of issues) {
    console.warn(`   - ${issue}`);
  }
}

// ─────────────────────────────────────────
// Migradores por tipo
// ─────────────────────────────────────────

function migratePoderes() {
  const items = readJson("poderes.json");
  const errors = [];
  const result = items.map((item, i) => {
    const issues = [];

    if (item.afinidade !== null && item.elemento === null) {
      issues.push(`afinidade definida sem elemento — afinidade será removida`);
    }

    const normalized = {
      id: resolveId(item),
      codigo: resolveCodigo(item, i + 1),
      nome: toStrRequired(item.nome),
      tipo: item.tipo ?? null,
      elemento: item.elemento ?? null,
      descricao: toStrRequired(item.descricao),
      preRequisitos: item.preRequisitos ?? null,
      afinidade: item.elemento !== null ? (item.afinidade ?? null) : null,
      fonteLivro: toStrRequired(item.fonteLivro),
      fontePagina: toStrRequired(item.fontePagina),
    };

    report("poderes.json", i, item, issues);
    return normalized;
  });

  writeJson("poderes.json", result);
  console.log(`✅ poderes.json — ${result.length} itens migrados`);
  return result;
}

function migrateEquipamentos() {
  const items = readJson("equipamentos.json");
  const result = items.map((item, i) => {
    const issues = [];

    // tipo: string → array
    let tipo;
    if (Array.isArray(item.tipo)) {
      tipo = item.tipo;
    } else if (item.tipo2) {
      tipo = [item.tipo, item.tipo2];
    } else {
      tipo = [item.tipo];
    }

    // id: snake_case do nome; codigo: numérico original ou sequencial
    if (typeof item.id === "number") {
      issues.push(`id numérico (${item.id}) convertido para snake_case do nome`);
    }

    const id = resolveId(item);
    const codigo = resolveCodigo(item, i + 1);

    // campos de arma: agrupados em subobjeto ou null
    const isArma = item.armaTipo !== undefined || tipo.includes("Arma");
    const arma = isArma
      ? {
          armaTipo: toStrRequired(item.armaTipo),
          empunhadura: item.empunhadura ?? null,
          catArma: item.catArma ?? null,
          municao: item.municao ?? null,
        }
      : null;

    if (!isArma && (item.empunhadura || item.catArma || item.municao)) {
      issues.push(`campos de arma presentes mas tipo não é "Arma" — verifique`);
    }

    const normalized = {
      id,
      codigo,
      nome: toStrRequired(item.nome),
      tipo,
      subtipo: item.subtipo ?? null,
      categoria: item.categoria !== undefined ? toStr(item.categoria) : null,
      espaco: item.espaco ?? null,
      descricao: toStrRequired(item.descricao),
      elemento: item.elemento ?? null,
      dano: item.dano ?? null,
      critico: item.critico ?? null,
      alcance: item.alcance ?? null,
      tipoDano: item.tipoDano ?? null,
      defesa: item.defesa ?? null,
      arma,
      fonteLivro: toStrRequired(item.fonteLivro),
      fontePagina: toStrRequired(item.fontePagina),
    };

    report("equipamentos.json", i, item, issues);
    return normalized;
  });

  writeJson("equipamentos.json", result);
  console.log(`✅ equipamentos.json — ${result.length} itens migrados`);
  return result;
}

function migrateOrigens() {
  const items = readJson("origens.json");
  // Origens já estão uniformes — só garantir tipos
  const result = items.map((item, i) => ({
    id: resolveId(item),
    codigo: resolveCodigo(item, i + 1),
    nome: toStrRequired(item.nome),
    descricao: toStrRequired(item.descricao),
    pericias: toStrRequired(item.pericias),
    tecnicaNome: toStrRequired(item.tecnicaNome),
    tecnicaDescricao: toStrRequired(item.tecnicaDescricao),
    fonteLivro: toStrRequired(item.fonteLivro),
    fontePagina: toStrRequired(item.fontePagina),
  }));

  writeJson("origens.json", result);
  console.log(`✅ origens.json — ${result.length} itens migrados`);
  return result;
}

function migrateRituais() {
  const items = readJson("rituais.json");
  const result = items.map((item, i) => {
    const issues = [];

    // id: snake_case do nome; codigo: numérico original ou sequencial
    if (typeof item.id === "number") {
      issues.push(`id numérico (${item.id}) convertido para snake_case do nome`);
    }

    // fontePagina: sempre string
    if (typeof item.fontePagina === "number") {
      issues.push(`fontePagina numérica (${item.fontePagina}) convertida para string`);
    }

    const normalized = {
      id: resolveId(item),
      codigo: resolveCodigo(item, i + 1),
      nome: toStrRequired(item.nome),
      elemento: Array.isArray(item.elemento) ? item.elemento : [item.elemento].filter(Boolean),
      circulo: item.circulo,
      execucao: toStrRequired(item.execucao),
      alcance: toStrRequired(item.alcance),
      alvo: item.alvo ?? null,
      area: item.area ?? null,
      duracao: item.duracao ?? null,
      resistencia: item.resistencia ?? null,
      descricao: toStrRequired(item.descricao),
      aprimoramentos: item.aprimoramentos ?? null,
      fonteLivro: toStrRequired(item.fonteLivro),
      fontePagina: toStrRequired(item.fontePagina),
    };

    report("rituais.json", i, item, issues);
    return normalized;
  });

  writeJson("rituais.json", result);
  console.log(`✅ rituais.json — ${result.length} itens migrados`);
  return result;
}

function migrateTrilhas() {
  const items = readJson("trilhas.json");
  const result = items.map((item, i) => {
    const issues = [];

    if (!item.nex10 || !item.nex40) {
      issues.push(`nex10 ou nex40 ausente — campos obrigatórios`);
    }
    if (item.descricao === null) {
      issues.push(`descricao nula — verifique se é esperado`);
    }

    const normalized = {
      id: resolveId(item),
      codigo: resolveCodigo(item, i + 1),
      nome: toStrRequired(item.nome),
      tipo: toStrRequired(item.tipo),
      descricao: item.descricao ?? null,
      especial: item.especial ?? null,
      nex10: toStrRequired(item.nex10),
      nex40: toStrRequired(item.nex40),
      nex65: item.nex65 ?? null,
      nex99: item.nex99 ?? null,
      fonteLivro: toStrRequired(item.fonteLivro),
      fontePagina: toStrRequired(item.fontePagina),
    };

    report("trilhas.json", i, item, issues);
    return normalized;
  });

  writeJson("trilhas.json", result);
  console.log(`✅ trilhas.json — ${result.length} itens migrados`);
  return result;
}

// ─────────────────────────────────────────
// Main
// ─────────────────────────────────────────

console.log(`\n🔄 Iniciando migração${DRY_RUN ? " (dry-run — sem gravação)" : ""}...\n`);

migratePoderes();
migrateEquipamentos();
migrateOrigens();
migrateRituais();
migrateTrilhas();

if (!DRY_RUN) {
  console.log(`\n📁 Arquivos migrados salvos em: ${OUT_DIR}`);
  console.log(`   Verifique os dados antes de substituir os originais.\n`);
} else {
  console.log(`\nDry-run concluído. Nenhum arquivo foi gravado.\n`);
}
