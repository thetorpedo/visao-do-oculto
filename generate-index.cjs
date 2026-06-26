#!/usr/bin/env node
/**
 * generate-index.cjs
 * Varre public/data/<categoria>/ e gera public/data/index.json
 * listando todos os arquivos .json encontrados por categoria.
 *
 * Uso: node generate-index.cjs
 * Rode sempre que adicionar/remover um arquivo de dados.
 */

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.resolve(__dirname, "public/data");
const CATEGORIAS = ["poderes", "rituais", "equipamentos", "origens", "trilhas"];

const index = {};

for (const categoria of CATEGORIAS) {
  const pastaCategoria = path.join(DATA_DIR, categoria);

  if (!fs.existsSync(pastaCategoria)) {
    console.warn(`⚠️  Pasta não encontrada: ${pastaCategoria} — pulando.`);
    index[categoria] = [];
    continue;
  }

  const arquivos = fs
    .readdirSync(pastaCategoria)
    .filter((f) => f.endsWith(".json"))
    .sort(); // ordem alfabética determinística

  // Caminho relativo a partir de /data/, ex: "poderes/poderes-as5.json"
  index[categoria] = arquivos.map((f) => `${categoria}/${f}`);

  console.log(`✅ ${categoria}: ${arquivos.length} arquivo(s) encontrado(s)`);
  arquivos.forEach((f) => console.log(`   • ${f}`));
}

const outputPath = path.join(DATA_DIR, "index.json");
fs.writeFileSync(outputPath, JSON.stringify(index, null, 2), "utf-8");
console.log(`\n📄 index.json gerado em ${outputPath}`);
