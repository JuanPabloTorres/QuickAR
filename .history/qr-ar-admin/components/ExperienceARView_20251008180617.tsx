// Integration example - How to add ExperienceCube to an existing page

import { ExperienceCube } from "@/components/ExperienceCube";
import { AssetDto } from "@/types";

interface ExperiencePageProps {
  experience: {
    id: string;
    title: string;
    assets: AssetDto[];
  };
}

export function ExperienceARView({ experience }: ExperiencePageProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">{experience.title}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {experience.assets.map((asset) => {
          // Map AssetDto to ExperienceCube props
          const assetType = asset.kind === "message" ? "text" : asset.kind;
          
          return (
            <ExperienceCube
              key={asset.id}
              assetType={assetType as any}
              assetUrl={asset.url || undefined}
              assetContent={asset.text || undefined}
              alt={asset.name}
              enableAR={true}
              size={300}
              className="mx-auto"
            />
          );
        })}
      </div>
      
      {/* AR Instructions */}
      <div className="mt-12 text-center">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            🥽 Cómo usar la Realidad Aumentada
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <h3 className="font-medium text-blue-600 mb-2">📱 En dispositivos móviles:</h3>
              <ul className="space-y-1 text-left">
                <li>• Busca el botón de cámara 📷</li>
                <li>• Permite el acceso a la cámara</li>
                <li>• Apunta a una superficie plana</li>
                <li>• ¡Disfruta de la experiencia AR!</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-purple-600 mb-2">🖥️ En desktop:</h3>
              <ul className="space-y-1 text-left">
                <li>• Usa gestos táctiles para rotar</li>
                <li>• Botones para resetear vista</li>
                <li>• Zoom con scroll del mouse</li>
                <li>• AR disponible con headsets</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExperienceARView;