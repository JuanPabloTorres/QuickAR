// Example usage of ExperienceCube with AR functionality

import { ExperienceCube } from "./ExperienceCube";

export function ExperienceShowcase() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-2">
          🥽 AR Experience Cubes
        </h1>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Explora contenido multimedia en cubos AR interactivos con wireframes minimalistas y funcionalidades de realidad aumentada.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
      {/* 3D Model with AR */}
      <ExperienceCube
        assetType="model3d"
        assetUrl="https://modelviewer.dev/shared-assets/models/Astronaut.glb"
        alt="Astronauta 3D"
        size={300}
        enableAR={true}
        arScale="auto"
        arPlacement="floor"
        disableModelZoom={false}
        disableModelPan={false}
      />

      {/* Image with AR potential */}
      <ExperienceCube
        assetType="image"
        assetUrl="https://via.placeholder.com/400x400/4A90E2/FFFFFF?text=AR+Image"
        alt="Imagen AR"
        size={300}
        enableAR={true}
      />

      {/* Video with AR potential */}
      <ExperienceCube
        assetType="video"
        assetUrl="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
        alt="Video AR"
        size={300}
        enableAR={true}
      />

      {/* Text content with AR potential */}
      <ExperienceCube
        assetType="text"
        assetContent="¡Bienvenido a la experiencia AR! Este texto puede ser proyectado en realidad aumentada para crear experiencias inmersivas únicas."
        alt="Texto AR"
        size={300}
        enableAR={true}
      />

      {/* Large 3D Model for desktop */}
      <div className="md:col-span-2">
        <ExperienceCube
          assetType="model3d"
          assetUrl="https://modelviewer.dev/shared-assets/models/RobotExpressive.glb"
          alt="Robot Expresivo 3D"
          size={600}
          enableAR={true}
          arScale="1"
          arPlacement="wall"
          disableModelZoom={false}
          disableModelPan={false}
          className="mx-auto"
        />
      </div>
    </div>
  );
}

export default ExperienceShowcase;
