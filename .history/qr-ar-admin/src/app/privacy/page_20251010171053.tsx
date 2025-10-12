"use client";

import { 
  FuturisticCard,
  FuturisticCardContent,
  FuturisticCardHeader,
  FuturisticCardTitle,
} from "@/components/ui/futuristic-card";
import { FuturisticButton } from "@/components/ui/futuristic-button";
import { 
  Download,
  Eye,
  FileText,
  Lock,
  Mail,
  Shield,
  Users,
  UserX
} from "lucide-react";

export default function Privacy() {
  const sections = [
    {
      title: "1. Información que Recopilamos",
      content: [
        "Información de cuenta: nombre, dirección de correo electrónico y preferencias de usuario cuando te registras en QuickAR.",
        "Datos de uso: información sobre cómo usas nuestra plataforma, incluyendo experiencias AR creadas, visualizaciones y tiempo de sesión.",
        "Información técnica: dirección IP, tipo de navegador, sistema operativo y datos de rendimiento para mejorar nuestros servicios.",
        "Contenido generado: modelos 3D, imágenes y otros archivos que subes para crear experiencias AR."
      ]
    },
    {
      title: "2. Cómo Utilizamos tu Información",
      content: [
        "Proporcionar y mantener los servicios de QuickAR, incluyendo la creación y gestión de experiencias AR.",
        "Mejorar y personalizar tu experiencia en la plataforma mediante análisis de uso y retroalimentación.",
        "Comunicarnos contigo sobre actualizaciones del servicio, nuevas funciones y soporte técnico.",
        "Garantizar la seguridad y prevenir el uso no autorizado o fraudulento de nuestros servicios."
      ]
    },
    {
      title: "3. Compartir Información",
      content: [
        "No vendemos, alquilamos ni compartimos tu información personal con terceros para fines comerciales.",
        "Podemos compartir datos agregados y anonimizados para investigación y mejora de productos.",
        "Compartimos información solo cuando es requerido por ley o para proteger nuestros derechos legales.",
        "Los proveedores de servicios de confianza pueden acceder a datos limitados solo para operar nuestros servicios."
      ]
    },
    {
      title: "4. Seguridad de Datos",
      content: [
        "Implementamos medidas de seguridad técnicas y administrativas para proteger tu información personal.",
        "Todos los datos se transmiten usando cifrado TLS/SSL y se almacenan en servidores seguros.",
        "Realizamos auditorías regulares de seguridad y mantenemos copias de seguridad cifradas.",
        "El acceso a datos está limitado al personal autorizado que necesita la información para realizar su trabajo."
      ]
    },
    {
      title: "5. Retención de Datos",
      content: [
        "Conservamos tu información personal solo mientras mantengas una cuenta activa con nosotros.",
        "Los datos de experiencias AR se mantienen durante 7 años después de la eliminación de la cuenta para fines de respaldo.",
        "Los registros de análisis se conservan de forma agregada y anónima durante 3 años para mejorar el servicio.",
        "Puedes solicitar la eliminación completa de tus datos contactando nuestro equipo de soporte."
      ]
    },
    {
      title: "6. Tus Derechos",
      content: [
        "Acceso: puedes solicitar una copia de toda la información personal que tenemos sobre ti.",
        "Corrección: puedes solicitar que corrijamos información incorrecta o desactualizada.",
        "Eliminación: puedes solicitar que eliminemos tu información personal bajo ciertas condiciones.",
        "Portabilidad: puedes solicitar que transfiramos tu información a otro proveedor de servicios."
      ]
    }
  ];

  const handleDownload = () => {
    // TODO: Implement privacy policy download
    console.log("Downloading privacy policy...");
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center shadow-2xl">
            <Shield className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold font-orbitron text-white mb-2">
          Política de{" "}
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Privacidad
          </span>
        </h1>
        <p className="text-slate-300 font-manrope mb-4">
          Tu privacidad es importante para nosotros. Esta política explica cómo recopilamos, usamos y protegemos tu información.
        </p>
        <p className="text-sm text-slate-400 font-manrope">
          Última actualización: 15 de diciembre de 2024
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap justify-center gap-4">
        <FuturisticButton onClick={handleDownload} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Descargar PDF
        </FuturisticButton>
        <FuturisticButton variant="ghost">
          <Mail className="mr-2 h-4 w-4" />
          Contactar sobre Privacidad
        </FuturisticButton>
        <FuturisticButton variant="ghost">
          <UserX className="mr-2 h-4 w-4" />
          Solicitar Eliminación de Datos
        </FuturisticButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Introduction */}
          <FuturisticCard variant="glass" glow>
            <FuturisticCardContent className="p-6">
              <div className="prose prose-invert max-w-none">
                <p className="text-slate-300 font-manrope leading-relaxed">
                  En QuickAR, respetamos tu privacidad y nos comprometemos a proteger tu información personal. 
                  Esta Política de Privacidad describe cómo recopilamos, usamos, almacenamos y compartimos tu 
                  información cuando utilizas nuestra plataforma de realidad aumentada.
                </p>
                <p className="text-slate-300 font-manrope leading-relaxed mt-4">
                  Al usar QuickAR, aceptas las prácticas descritas en esta política. Si no estás de acuerdo 
                  con algún aspecto de esta política, te recomendamos que no uses nuestros servicios.
                </p>
              </div>
            </FuturisticCardContent>
          </FuturisticCard>

          {/* Privacy Sections */}
          {sections.map((section, index) => (
            <FuturisticCard key={index} variant={index % 2 === 0 ? "neon" : "default"}>
              <FuturisticCardHeader>
                <FuturisticCardTitle className="text-lg font-orbitron">
                  {section.title}
                </FuturisticCardTitle>
              </FuturisticCardHeader>
              <FuturisticCardContent>
                <ul className="space-y-3">
                  {section.content.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start">
                      <div className="w-2 h-2 bg-sky-400 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                      <p className="text-slate-300 font-manrope leading-relaxed">
                        {item}
                      </p>
                    </li>
                  ))}
                </ul>
              </FuturisticCardContent>
            </FuturisticCard>
          ))}

          {/* GDPR Compliance */}
          <FuturisticCard variant="glass">
            <FuturisticCardHeader>
              <FuturisticCardTitle className="flex items-center">
                <Lock className="mr-2 h-5 w-5 text-green-400" />
                7. Cumplimiento GDPR y Regulaciones Internacionales
              </FuturisticCardTitle>
            </FuturisticCardHeader>
            <FuturisticCardContent>
              <div className="space-y-4">
                <p className="text-slate-300 font-manrope leading-relaxed">
                  QuickAR cumple con el Reglamento General de Protección de Datos (GDPR) de la Unión Europea 
                  y otras regulaciones de privacidad aplicables a nivel internacional.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                    <div className="flex items-center mb-2">
                      <Shield className="h-5 w-5 text-green-400 mr-2" />
                      <span className="font-medium font-manrope text-green-400">Base Legal</span>
                    </div>
                    <p className="text-sm text-green-300 font-manrope">
                      Procesamos datos basándose en consentimiento legítimo y necesidad contractual.
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                    <div className="flex items-center mb-2">
                      <FileText className="h-5 w-5 text-blue-400 mr-2" />
                      <span className="font-medium font-manrope text-blue-400">Transferencias</span>
                    </div>
                    <p className="text-sm text-blue-300 font-manrope">
                      Todas las transferencias internacionales usan mecanismos de protección adecuados.
                    </p>
                  </div>
                </div>
              </div>
            </FuturisticCardContent>
          </FuturisticCard>

          {/* Contact Information */}
          <FuturisticCard variant="neon">
            <FuturisticCardHeader>
              <FuturisticCardTitle className="flex items-center">
                <Mail className="mr-2 h-5 w-5 text-sky-400" />
                8. Contacto y Actualizaciones
              </FuturisticCardTitle>
            </FuturisticCardHeader>
            <FuturisticCardContent>
              <div className="space-y-4">
                <p className="text-slate-300 font-manrope leading-relaxed">
                  Si tienes preguntas sobre esta Política de Privacidad o deseas ejercer tus derechos de datos, 
                  puedes contactarnos a través de los siguientes medios:
                </p>
                
                <div className="bg-white/5 rounded-lg p-4 space-y-2">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-sky-400 mr-2" />
                    <span className="font-manrope text-white">privacy@quickar.com</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 text-sky-400 mr-2" />
                    <span className="font-manrope text-white">Oficial de Protección de Datos</span>
                  </div>
                </div>
                
                <p className="text-slate-300 font-manrope leading-relaxed">
                  Nos reservamos el derecho de actualizar esta política ocasionalmente. Te notificaremos 
                  de cambios significativos por correo electrónico o mediante un aviso prominente en nuestra plataforma.
                </p>
              </div>
            </FuturisticCardContent>
          </FuturisticCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Links */}
          <FuturisticCard variant="default">
            <FuturisticCardHeader>
              <FuturisticCardTitle>
                Enlaces Rápidos
              </FuturisticCardTitle>
            </FuturisticCardHeader>
            <FuturisticCardContent className="space-y-2">
              {sections.map((section, index) => (
                <button
                  key={index}
                  className="w-full text-left text-sm text-slate-300 hover:text-sky-400 transition-colors font-manrope p-2 rounded hover:bg-white/5"
                >
                  {section.title}
                </button>
              ))}
            </FuturisticCardContent>
          </FuturisticCard>

          {/* Data Rights */}
          <FuturisticCard variant="glass" glow>
            <FuturisticCardHeader>
              <FuturisticCardTitle className="flex items-center">
                <Eye className="mr-2 h-5 w-5 text-sky-400" />
                Tus Derechos
              </FuturisticCardTitle>
            </FuturisticCardHeader>
            <FuturisticCardContent className="space-y-3">
              <FuturisticButton variant="ghost" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Descargar Mis Datos
              </FuturisticButton>
              <FuturisticButton variant="ghost" className="w-full justify-start">
                <Lock className="mr-2 h-4 w-4" />
                Configurar Privacidad
              </FuturisticButton>
              <FuturisticButton variant="ghost" className="w-full justify-start">
                <UserX className="mr-2 h-4 w-4" />
                Eliminar Cuenta
              </FuturisticButton>
              <FuturisticButton variant="ghost" className="w-full justify-start">
                <Mail className="mr-2 h-4 w-4" />
                Contactar DPO
              </FuturisticButton>
            </FuturisticCardContent>
          </FuturisticCard>

          {/* Privacy Summary */}
          <FuturisticCard variant="neon">
            <FuturisticCardHeader>
              <FuturisticCardTitle>
                Resumen de Privacidad
              </FuturisticCardTitle>
            </FuturisticCardHeader>
            <FuturisticCardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <div className="font-bold text-green-400 font-orbitron">0</div>
                  <div className="text-xs text-green-300 font-manrope">Datos Vendidos</div>
                </div>
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <div className="font-bold text-blue-400 font-orbitron">24h</div>
                  <div className="text-xs text-blue-300 font-manrope">Respuesta DPO</div>
                </div>
              </div>
              
              <div className="p-3 rounded-lg bg-purple-500/10">
                <div className="flex items-center justify-center mb-1">
                  <Shield className="h-4 w-4 text-purple-400 mr-1" />
                  <span className="text-sm font-medium font-manrope text-purple-400">
                    Certificación ISO 27001
                  </span>
                </div>
                <p className="text-xs text-purple-300 font-manrope text-center">
                  Cumplimiento verificado de seguridad
                </p>
              </div>
            </FuturisticCardContent>
          </FuturisticCard>
        </div>
      </div>
    </div>
  );
}