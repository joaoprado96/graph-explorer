const fs = require("fs");
const path = require("path");

const configPath = path.resolve(__dirname, "config.json");

// Verifica se o arquivo existe
if (!fs.existsSync(configPath)) {
  console.error("Erro: Arquivo config.json não encontrado!");
  process.exit(1);
}

// Carrega e exporta as variáveis
const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
Object.entries(config).forEach(([key, value]) => {
  console.log(`export ${key}="${value}"`);
});