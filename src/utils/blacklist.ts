import fs from 'fs';

// Fonction pour vérifier si un utilisateur est blacklisté
export function isBlacklisted(userId: string): boolean {
  const blacklist = loadBlacklist();  // Charger la blacklist à chaque vérification
  return blacklist.includes(userId);
}

// Fonction pour charger la liste noire à partir du fichier JSON
export function loadBlacklist(): string[] {
  try {
    const data = fs.readFileSync("../blacklist.json", "utf8");
    const json = JSON.parse(data);
    return json.blacklist || [];
  } catch (err) {
    console.error("Erreur de chargement de la blacklist : ", err);
    return [];
  }
}

// Fonction pour sauvegarder la liste noire dans le fichier JSON
export function saveBlacklist(blacklist: string[]): void {
  const jsonData = JSON.stringify({ blacklist }, null, 2);
  fs.writeFileSync("../blacklist.json", jsonData, "utf8");
}