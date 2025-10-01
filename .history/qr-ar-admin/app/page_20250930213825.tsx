export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            QR AR Admin Panel
          </h1>
          <p className="text-xl text-blue-200 mb-8">
            Gestiona tus experiencias de realidad aumentada
          </p>
          
          <div className="glass rounded-xl p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-white mb-6">
              Bienvenido al Panel de Administración
            </h2>
            <p className="text-blue-100 mb-6">
              Desde aquí puedes crear, editar y gestionar experiencias de realidad aumentada 
              que se pueden activar mediante códigos QR.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass-dark rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">
                  📱 Experiencias AR
                </h3>
                <p className="text-blue-200 text-sm">
                  Crea experiencias inmersivas con modelos 3D, imágenes y videos
                </p>
              </div>
              
              <div className="glass-dark rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">
                  🎯 Códigos QR
                </h3>
                <p className="text-blue-200 text-sm">
                  Genera códigos QR únicos para cada experiencia
                </p>
              </div>
              
              <div className="glass-dark rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">
                  📊 Analytics
                </h3>
                <p className="text-blue-200 text-sm">
                  Monitorea el uso y engagement de tus experiencias
                </p>
              </div>
              
              <div className="glass-dark rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">
                  ☁️ Cloud Storage
                </h3>
                <p className="text-blue-200 text-sm">
                  Almacena modelos 3D y multimedia en la nube
                </p>
              </div>
            </div>
            
            <div className="mt-8">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
                Comenzar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}