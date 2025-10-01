import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HomePage() {
  return (
    <div>
      <PageHeader
        title="Panel de Administración QR AR"
        description="Gestiona tus experiencias de realidad aumentada"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="mr-2">✨</span>
              Experiencias AR
            </CardTitle>
            <CardDescription>
              Crea experiencias inmersivas con modelos 3D, imágenes y videos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-blue-100 text-sm mb-4">
              Diseña experiencias de realidad aumentada que se activan mediante
              códigos QR. Sube modelos 3D, imágenes, videos o crea mensajes
              interactivos.
            </p>
            <Link href="/experiences">
              <Button>Ver Experiencias</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="mr-2">🎯</span>
              Códigos QR
            </CardTitle>
            <CardDescription>
              Genera códigos QR únicos para cada experiencia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-blue-100 text-sm mb-4">
              Cada experiencia genera automáticamente un código QR que los
              usuarios pueden escanear para acceder a la experiencia AR.
            </p>
            <Link href="/experiences/new">
              <Button>Crear Nueva</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="mr-2">📊</span>
              Analytics
            </CardTitle>
            <CardDescription>
              Monitorea el uso y engagement de tus experiencias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-blue-100 text-sm mb-4">
              Obtén insights sobre cómo los usuarios interactúan con tus
              experiencias, incluyendo visualizaciones, interacciones y
              duración.
            </p>
            <Link href="/analytics">
              <Button>Ver Analytics</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="mr-2">☁️</span>
              Gestión de Archivos
            </CardTitle>
            <CardDescription>
              Almacena modelos 3D y multimedia en la nube
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-blue-100 text-sm mb-4">
              Sistema de almacenamiento optimizado para modelos 3D (.glb/.gltf),
              imágenes, videos y otros recursos multimedia.
            </p>
            <Link href="/files">
              <Button>Gestionar Archivos</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>🚀 Comenzar</CardTitle>
          <CardDescription>
            Guía rápida para crear tu primera experiencia AR
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div>
                <h4 className="font-semibold text-white">
                  Crear una experiencia
                </h4>
                <p className="text-blue-200 text-sm">
                  Da un título y descripción a tu experiencia AR
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div>
                <h4 className="font-semibold text-white">Agregar contenido</h4>
                <p className="text-blue-200 text-sm">
                  Sube modelos 3D, imágenes, videos o crea mensajes de texto
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div>
                <h4 className="font-semibold text-white">Compartir QR</h4>
                <p className="text-blue-200 text-sm">
                  Descarga el código QR generado y compártelo con tus usuarios
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Link href="/experiences/new">
              <Button size="lg">Crear Mi Primera Experiencia AR</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
