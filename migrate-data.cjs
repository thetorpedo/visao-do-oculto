#!/usr/bin/env node

/**
 * Migrador de dados — Visão do Oculto
 * Lê os JSONs em /src/data, normaliza e salva em /src/data/migrated
 * Gera um arquivo por fonte (ex: poderes-as5.json) + um arquivo combinado por categoria
 *
 * Uso: node migrate-data.cjs [--dry-run]
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

function toStrRequired(value, fallback = "") {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function toSnakeCase(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "_");
}

// Resolve ID com estratégia de deduplicação:
// 1. snake_case(nome)
// 2. snake_case(nome)_fonteLivro  (se colisão com fonte diferente)
// 3. snake_case(nome)_fonteLivro_N (se duplicata real)
function buildIdMap(items) {
  const seen = new Map(); // id_base → [{ nome, fonteLivro, index }]

  return items.map((item, i) => {
    const base = toSnakeCase(item.nome || `item_${i}`);
    const fonte = toSnakeCase(item.fonteLivro || "");

    if (!seen.has(base)) {
      seen.set(base, [{ nome: item.nome, fonteLivro: item.fonteLivro, index: i }]);
      return base;
    }

    // Já existe — tenta com fonte
    const comFonte = `${base}_${fonte}`;
    const existentes = seen.get(base);
    const mesmaFonte = existentes.find(e => toSnakeCase(e.fonteLivro || "") === fonte);

    if (!mesmaFonte) {
      // Fonte diferente — usa base_fonte
      existentes.push({ nome: item.nome, fonteLivro: item.fonteLivro, index: i });
      seen.set(base, existentes);
      return comFonte;
    }

    // Mesma fonte — duplicata real, adiciona sufixo numérico
    const count = existentes.filter(e => toSnakeCase(e.fonteLivro || "") === fonte).length + 1;
    existentes.push({ nome: item.nome, fonteLivro: item.fonteLivro, index: i });
    seen.set(base, existentes);

    console.warn(`  ⚠️  Duplicata real: "${item.nome}" (${item.fonteLivro}) → ${comFonte}_${count}`);
    return `${comFonte}_${count}`;
  });
}

function resolveCodigo(item, autoIndex) {
  if (typeof item.id === "number") return item.id;
  return autoIndex;
}

function report(file, index, item, issues) {
  if (issues.length === 0) return;
  console.warn(`\n⚠️  ${file}[${index}] "${item.nome ?? item.id}":`);
  for (const issue of issues) {
    console.warn(`   - ${issue}`);
  }
}

// Agrupa itens por fonteLivro e salva um arquivo por fonte
function salvarPorFonte(categoria, items) {
  if (DRY_RUN) return;
  const porFonte = {};
  for (const item of items) {
    const chave = toSnakeCase(item.fonteLivro || "sem_fonte");
    if (!porFonte[chave]) porFonte[chave] = [];
    porFonte[chave].push(item);
  }
  for (const [fonte, itens] of Object.entries(porFonte)) {
    writeJson(`${categoria}-${fonte}.json`, itens);
  }
  const fontes = Object.keys(porFonte);
  console.log(`   📂 Arquivos por fonte: ${fontes.map(f => `${categoria}-${f}.json`).join(", ")}`);
}

// ─────────────────────────────────────────
// Migradores
// ─────────────────────────────────────────

function migratePoderes() {
  const items = readJson("poderes.json");
  const ids = buildIdMap(items);

  const result = items.map((item, i) => {
    const issues = [];
    if (item.afinidade !== null && item.elemento === null) {
      issues.push(`afinidade definida sem elemento — será removida`);
    }

    const normalized = {
      id: ids[i],
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
  salvarPorFonte("poderes", result);
  console.log(`✅ poderes.json — ${result.length} itens`);
  return result;
}

function migrateEquipamentos() {
  const items = readJson("equipamentos.json");
  const ids = buildIdMap(items);

  const result = items.map((item, i) => {
    const issues = [];

    let tipo;
    if (Array.isArray(item.tipo)) {
      tipo = item.tipo;
    } else if (item.tipo2) {
      tipo = [item.tipo, item.tipo2];
    } else {
      tipo = [item.tipo];
    }

    if (typeof item.id === "number") {
      issues.push(`id numérico convertido para snake_case`);
    }

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

    // defesa removido intencionalmente
    const normalized = {
      id: ids[i],
      codigo: resolveCodigo(item, i + 1),
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
      arma,
      fonteLivro: toStrRequired(item.fonteLivro),
      fontePagina: toStrRequired(item.fontePagina),
    };

    report("equipamentos.json", i, item, issues);
    return normalized;
  });

  writeJson("equipamentos.json", result);
  salvarPorFonte("equipamentos", result);
  console.log(`✅ equipamentos.json — ${result.length} itens`);
  return result;
}

function migrateOrigens() {
  const items = readJson("origens.json");
  const ids = buildIdMap(items);

  const result = items.map((item, i) => ({
    id: ids[i],
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
  salvarPorFonte("origens", result);
  console.log(`✅ origens.json — ${result.length} itens`);
  return result;
}

function migrateRituais() {
  const items = readJson("rituais.json");
  const ids = buildIdMap(items);

  const result = items.map((item, i) => {
    const issues = [];
    if (typeof item.id === "number") issues.push(`id numérico convertido`);
    if (typeof item.fontePagina === "number") issues.push(`fontePagina numérica convertida`);

    const normalized = {
      id: ids[i],
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
  salvarPorFonte("rituais", result);
  console.log(`✅ rituais.json — ${result.length} itens`);
  return result;
}

function migrateTrilhas() {
  const items = readJson("trilhas.json");
  const ids = buildIdMap(items);

  const result = items.map((item, i) => {
    const issues = [];
    if (!item.nex10 || !item.nex40) issues.push(`nex10 ou nex40 ausente`);
    if (item.descricao === null) issues.push(`descricao nula`);

    const normalized = {
      id: ids[i],
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
  salvarPorFonte("trilhas", result);
  console.log(`✅ trilhas.json — ${result.length} itens`);
  return result;
}

// ─────────────────────────────────────────
// Main
// ─────────────────────────────────────────

console.log(`\n🔄 Iniciando migração${DRY_RUN ? " (dry-run)" : ""}...\n`);

migratePoderes();
migrateEquipamentos();
migrateOrigens();
migrateRituais();
migrateTrilhas();

if (!DRY_RUN) {
  console.log(`\n📁 Arquivos em: ${OUT_DIR}\n`);
} else {
  console.log(`\nDry-run concluído. Nenhum arquivo gravado.\n`);
}