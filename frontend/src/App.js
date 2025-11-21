import React, { useState } from "react";

function App() {
  const [text, setText] = useState("");
  const [lang, setLang] = useState("en");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const handleTranslate = async () => {
    setResult("");
    setError("");

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, lang }),
      });

      const contentType = res.headers.get("content-type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        throw new Error("Server returned invalid response");
      }

      if (!res.ok) {
        throw new Error(data.error || "Translation failed");
      }

      setResult(data.translated);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
      <h1>Azure Fordító App</h1>

      <textarea
        rows="6"
        style={{ width: "100%" }}
        placeholder="Írd be a szöveget…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <br /><br />

      <select value={lang} onChange={(e) => setLang(e.target.value)}>
        <option value="en">Angol</option>
        <option value="de">Német</option>
        <option value="fr">Francia</option>
        <option value="es">Spanyol</option>
      </select>

      <br /><br />

      <button onClick={handleTranslate}>Fordítás</button>

      <h2>Eredmény:</h2>
      <pre>{result}</pre>

      {error && (
        <p style={{ color: "red" }}>
          Hiba: {error}
        </p>
      )}
    </div>
  );
}

export default App;
