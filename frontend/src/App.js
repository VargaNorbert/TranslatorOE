import React, { useState } from "react";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [lang, setLang] = useState("en");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const backendUrl =
    "https://translator-backend-oe-h9f5g5g0ekdzbrfe.westeurope-01.azurewebsites.net/translate";

  const handleTranslate = async () => {
    setResult("");
    setError("");

    if (!selectedFile) {
      setError("Kérlek válassz ki egy fájlt!");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("lang", lang);

      const res = await fetch(backendUrl, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Fordítás sikertelen");
      }

      setResult(data.translated);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
      <h1>Azure Fordító App</h1>

      <input
        type="file"
        accept=".txt,.json"
        onChange={(e) => setSelectedFile(e.target.files[0])}
      />

      <br /><br />

      <select value={lang} onChange={(e) => setLang(e.target.value)}>
        <option value="en">Angol</option>
        <option value="de">Német</option>
        <option value="fr">Francia</option>
        <option value="es">Spanyol</option>
        <option value="es">Mandarin</option>
      </select>

      <br /><br />

      <button onClick={handleTranslate}>Fordítás</button>

      <h2>Eredmény:</h2>
      <pre>{result}</pre>

      {error && <p style={{ color: "red" }}>Hiba: {error}</p>}
    </div>
  );
}

export default App;
