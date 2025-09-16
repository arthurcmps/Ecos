const functions = require("firebase-functions");
const admin = require("firebase-admin");
const Fuse = require("fuse.js");

admin.initializeApp();

exports.searchPoemas = functions.https.onRequest(async (req, res) => {
  // Habilita o CORS para permitir que seu site chame esta função
  res.set("Access-Control-Allow-Origin", "*");

  if (req.method === "OPTIONS") {
    // Lida com a requisição "pre-flight" do CORS
    res.set("Access-Control-Allow-Methods", "GET");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.set("Access-Control-Max-Age", "3600");
    res.status(204).send("");
    return;
  }

  const query = req.query.query;
  if (!query) {
    res.status(400).send("Forneça um termo de busca no parâmetro 'query'.");
    return;
  }

  try {
    const poemasSnapshot = await admin.firestore().collection("poemas").get();
    const poemas = poemasSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Configuração do Fuse.js para buscar pelo título
    const fuseOptions = {
      keys: ["titulo"],
      includeScore: true,
      threshold: 0.4, // Ajuste para mais (1.0) ou menos (0.0) precisão
    };

    const fuse = new Fuse(poemas, fuseOptions);
    const result = fuse.search(query);

    const searchResults = result.map((item) => item.item);

    res.status(200).json(searchResults);
  } catch (error) {
    console.error("Erro ao buscar poemas:", error);
    res.status(500).send("Ocorreu um erro interno ao processar sua busca.");
  }
});
