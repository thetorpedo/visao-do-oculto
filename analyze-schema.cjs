#!/usr/bin/env node

/**
 * Analisador de schema para os JSONs de Ordem Paranormal
 * Uso: node analyze-schema.js <caminho-para-pasta-data>
 * Exemplo: node analyze-schema.js ./data
 */

const fs = require("fs");
const path = require("path");

const dataDir = process.argv[2] || "./data";
const files = ["poderes.json", "equipamentos.json", "origens.json", "rituais.json", "trilhas.json"];

function getType(value) {
  if (value === null) return "null";
  if (Array.isArray(value)) {
    if (value.length === 0) return "array<empty>";
    const innerTypes = [...new Set(value.map(getType))];
    return `array<${innerTypes.join("|")}>`;
  }
  if (typeof value === "object") return "object";
  return typeof value;
}

function analyzeItems(items, fileName) {
  const keyStats = {}; // key -> { count, types: Set, exampleValues, nullCount, emptyCount }
  const totalItems = items.length;
  const objectKeys = items.map((item) => Object.keys(item));

  for (const item of items) {
    for (const [key, value] of Object.entries(item)) {
      if (!keyStats[key]) {
        keyStats[key] = {
          count: 0,
          types: new Set(),
          exampleValues: [],
          nullCount: 0,
          emptyCount: 0,
        };
      }
      const stat = keyStats[key];
      stat.count++;
      stat.types.add(getType(value));

      if (value === null) stat.nullCount++;
      if (value === "" || (Array.isArray(value) && value.length === 0)) stat.emptyCount++;

      if (stat.exampleValues.length < 3 && value !== null && value !== "") {
        const example = Array.isArray(value)
          ? value.slice(0, 2)
          : typeof value === "string" && value.length > 60
          ? value.slice(0, 60) + "..."
          : value;
        if (!stat.exampleValues.some((e) => JSON.stringify(e) === JSON.stringify(example))) {
          stat.exampleValues.push(example);
        }
      }
    }
  }

  // Chaves que aparecem em alguns mas não em todos (inconsistências)
  const inconsistentKeys = Object.entries(keyStats).filter(
    ([, stat]) => stat.count < totalItems
  );

  // Chaves com tipos mistos
  const mixedTypeKeys = Object.entries(keyStats).filter(
    ([, stat]) => stat.types.size > 1
  );

  // Itens com chaves únicas/raras (aparece em menos de 10% dos itens)
  const rareKeys = Object.entries(keyStats).filter(
    ([, stat]) => stat.count / totalItems < 0.1
  );

  // Chaves presentes em todos os itens
  const universalKeys = Object.entries(keyStats).filter(
    ([, stat]) => stat.count === totalItems
  );

  return {
    fileName,
    totalItems,
    keyStats,
    inconsistentKeys,
    mixedTypeKeys,
    rareKeys,
    universalKeys,
  };
}

function printReport(analysis) {
  const { fileName, totalItems, keyStats, inconsistentKeys, mixedTypeKeys, rareKeys, universalKeys } = analysis;

  console.log("\n" + "═".repeat(60));
  console.log(`📄 ${fileName.toUpperCase()} — ${totalItems} itens`);
  console.log("═".repeat(60));

  // Todas as chaves com frequência e tipos
  console.log("\n📊 TODAS AS CHAVES:");
  const sorted = Object.entries(keyStats).sort(([, a], [, b]) => b.count - a.count);
  for (const [key, stat] of sorted) {
    const freq = ((stat.count / totalItems) * 100).toFixed(0);
    const types = [...stat.types].join(" | ");
    const flags = [];
    if (stat.nullCount > 0) flags.push(`${stat.nullCount}x null`);
    if (stat.emptyCount > 0) flags.push(`${stat.emptyCount}x vazio`);
    const flagStr = flags.length ? `  ⚠️  ${flags.join(", ")}` : "";
    console.log(`  ${key.padEnd(25)} ${String(stat.count).padStart(4)}/${totalItems} (${freq.padStart(3)}%)  [${types}]${flagStr}`);
  }

  if (inconsistentKeys.length > 0) {
    console.log("\n⚠️  CHAVES AUSENTES EM ALGUNS ITENS:");
    for (const [key, stat] of inconsistentKeys) {
      const missing = totalItems - stat.count;
      console.log(`  "${key}" — ausente em ${missing} itens`);
    }
  }

  if (mixedTypeKeys.length > 0) {
    console.log("\n🔀 CHAVES COM TIPOS MISTOS:");
    for (const [key, stat] of mixedTypeKeys) {
      console.log(`  "${key}" — ${[...stat.types].join(" | ")}`);
      if (stat.exampleValues.length > 0) {
        console.log(`     Exemplos: ${JSON.stringify(stat.exampleValues)}`);
      }
    }
  }

  if (rareKeys.length > 0) {
    console.log("\n🔍 CHAVES RARAS (<10% dos itens):");
    for (const [key, stat] of rareKeys) {
      console.log(`  "${key}" — ${stat.count} itens`);
      if (stat.exampleValues.length > 0) {
        console.log(`     Exemplos: ${JSON.stringify(stat.exampleValues)}`);
      }
    }
  }

  console.log("\n✅ CHAVES UNIVERSAIS (presentes em todos):");
  console.log("  " + universalKeys.map(([k]) => `"${k}"`).join(", "));
}

function run() {
  console.log(`\n🔎 Analisando JSONs em: ${path.resolve(dataDir)}\n`);

  const results = [];

  for (const file of files) {
    const filePath = path.join(dataDir, file);
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Arquivo não encontrado: ${filePath}`);
      continue;
    }

    let data;
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      data = JSON.parse(raw);
    } catch (e) {
      console.log(`❌ Erro ao ler ${file}: ${e.message}`);
      continue;
    }

    // Suporta tanto array raiz quanto objeto com chave raiz
    const items = Array.isArray(data) ? data : Object.values(data).find(Array.isArray);
    if (!items) {
      console.log(`❌ Não encontrei array de itens em ${file}`);
      continue;
    }

    const analysis = analyzeItems(items, file);
    results.push(analysis);
    printReport(analysis);
  }

  // Resumo geral
  console.log("\n" + "═".repeat(60));
  console.log("📋 RESUMO GERAL");
  console.log("═".repeat(60));
  for (const r of results) {
    const problems = r.inconsistentKeys.length + r.mixedTypeKeys.length;
    console.log(`  ${r.fileName.padEnd(25)} ${r.totalItems} itens   ${problems > 0 ? `⚠️  ${problems} inconsistência(s)` : "✅ uniforme"}`);
  }
  console.log("");
}

run();
