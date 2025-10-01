"use client";

import React, { useState, useEffect } from "react";

export default function DebugARPage() {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  
  const imageUrl = "http://localhost:5000/uploads/images/1759288718_803ef988.jpg";

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-8">Debug AR - Prueba de Imagen</h1>
        
        <div className="space-y-4">
          {/* Test directo de imagen */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-white font-semibold mb-4">Prueba de imagen directa:</h2>
            <img
              src={imageUrl}
              alt="Test"
              className="w-full max-w-md mx-auto block border-2 border-blue-500 rounded"
              onLoad={() => {
                console.log("✅ Imagen cargada exitosamente");
                setImageLoaded(true);
              }}
              onError={(e) => {
                console.error("❌ Error al cargar imagen:", e);
                setImageError("Error al cargar imagen");
              }}
            />
          </div>

          {/* Estado de carga */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-white font-semibold mb-2">Estado:</h2>
            <p className="text-white">URL: {imageUrl}</p>
            <p className={`${imageLoaded ? 'text-green-400' : 'text-yellow-400'}`}>
              Imagen cargada: {imageLoaded ? "✅ Sí" : "⏳ Cargando..."}
            </p>
            {imageError && (
              <p className="text-red-400">Error: {imageError}</p>
            )}
          </div>

          {/* Test de fetch */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-white font-semibold mb-2">Test de Fetch API:</h2>
            <button
              onClick={async () => {
                try {
                  console.log("🔄 Probando fetch...");
                  const response = await fetch(imageUrl);
                  console.log("📊 Response status:", response.status);
                  console.log("📊 Response headers:", response.headers);
                  
                  if (response.ok) {
                    console.log("✅ Fetch exitoso");
                    alert("✅ Fetch exitoso");
                  } else {
                    console.error("❌ Fetch falló:", response.status);
                    alert(`❌ Fetch falló: ${response.status}`);
                  }
                } catch (error) {
                  console.error("❌ Error en fetch:", error);
                  alert(`❌ Error en fetch: ${error}`);
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Probar Fetch
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}