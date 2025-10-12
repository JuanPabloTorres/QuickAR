"use client";"use client";



import { Button } from "@/components/ui/button";import { Button } from "@/components/ui/button";

import {import {

  Card,  Card,

  CardContent,  CardContent,

  CardDescription,  CardDescription,

  CardHeader,  CardHeader,

  CardTitle,  CardTitle,

} from "@/components/ui/card";} from "@/components/ui/card";

import FileUpload from "@/components/ui/file-upload";import FileUpload from "@/components/ui/file-upload";

import { createExperience } from "@/lib/api/experiences";import { createExperience } from "@                  )}

import { Asset, AssetCreateDto, ExperienceCreateDto } from "@/types";

import Link from "next/link";              {/* Status indicator */}

import { useRouter } from "next/navigation";              <div className="mt-4 p-3 bg-gray-800/20 rounded-lg">

import { useState } from "react";                <div className="text-sm text-gray-400">

                  <div className="flex items-center justify-between">

type AssetType = Asset["assetType"];                    <span>Estado del asset:</span>

                    <span className={`font-medium ${

interface FormData {                      (formData.assetType === "message" && formData.assetContent) ||

  title: string;                      (formData.assetType !== "message" && formData.assetUrl)

  description: string;                        ? "text-green-400" 

  assetType: AssetType;                        : "text-yellow-400"

  assetUrl?: string;                    }`}>

  assetContent?: string;                      {(formData.assetType === "message" && formData.assetContent) ||

  file?: File;                       (formData.assetType !== "message" && formData.assetUrl)

}                        ? "✓ Listo"

                        : "⏳ Pendiente"}

export default function CreateExperiencePage() {                    </span>

  const router = useRouter();                  </div>

  const [formData, setFormData] = useState<FormData>({                  

    title: "",                  {formData.assetUrl && formData.assetType !== "message" && (

    description: "",                    <div className="mt-2 text-xs text-blue-300 break-all">

    assetType: "image",                      URL: {formData.assetUrl}

  });                    </div>

  const [isLoading, setIsLoading] = useState(false);                  )}

  const [error, setError] = useState<string | null>(null);                </div>

              </div>

  const handleInputChange = (            </CardContent>

    e: React.ChangeEvent<          </Card>

      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement        </div>pi/experiences";

    >import { Asset, AssetCreateDto, ExperienceCreateDto } from "@/types";

  ) => {import Link from "next/link";

    const { name, value } = e.target;import { useRouter } from "next/navigation";

    setFormData((prev) => ({ ...prev, [name]: value }));import { useState } from "react";

  };

type AssetType = Asset["assetType"];

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();interface FormData {

    setIsLoading(true);  title: string;

    setError(null);  description: string;

  assetType: AssetType;

    try {  assetUrl?: string;

      // Validate that we have an asset  assetContent?: string;

      if (formData.assetType === "message" && !formData.assetContent?.trim()) {  file?: File;

        setError("Por favor, proporciona un mensaje de texto");}

        return;

      }export default function CreateExperiencePage() {

  const router = useRouter();

      if (formData.assetType !== "message" && !formData.assetUrl?.trim()) {  const [formData, setFormData] = useState<FormData>({

        setError("Por favor, sube un archivo o proporciona una URL");    title: "",

        return;    description: "",

      }    assetType: "image",

  });

      // Prepare asset based on asset type  const [isLoading, setIsLoading] = useState(false);

      let asset: AssetCreateDto = {  const [error, setError] = useState<string | null>(null);

        name: formData.title, // Use title as asset name

        kind: formData.assetType,  const handleInputChange = (

      };    e: React.ChangeEvent<

      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement

      if (formData.assetType === "message") {    >

        asset.text = formData.assetContent;  ) => {

      } else {    const { name, value } = e.target;

        asset.url = formData.assetUrl;    setFormData((prev) => ({ ...prev, [name]: value }));

        // Set MIME type based on asset type and URL  };

        if (formData.assetUrl) {

          const extension = formData.assetUrl.split('.').pop()?.toLowerCase();  const handleSubmit = async (e: React.FormEvent) => {

          if (formData.assetType === "image") {    e.preventDefault();

            asset.mimeType = extension === "jpg" || extension === "jpeg" ? "image/jpeg" :     setIsLoading(true);

                            extension === "png" ? "image/png" :     setError(null);

                            extension === "gif" ? "image/gif" : 

                            "image/*";    try {

          } else if (formData.assetType === "video") {      // Validate that we have an asset

            asset.mimeType = extension === "mp4" ? "video/mp4" :       if (formData.assetType === "message" && !formData.assetContent?.trim()) {

                            extension === "webm" ? "video/webm" :         setError("Por favor, proporciona un mensaje de texto");

                            extension === "mov" ? "video/quicktime" :        return;

                            "video/*";      }

          } else if (formData.assetType === "model3d") {

            asset.mimeType = extension === "glb" ? "model/gltf-binary" :       if (formData.assetType !== "message" && !formData.assetUrl?.trim()) {

                            extension === "gltf" ? "model/gltf+json" :        setError("Por favor, sube un archivo o proporciona una URL");

                            "model/*";        return;

          }      }

        }

      }      // Prepare asset based on asset type

      let asset: AssetCreateDto = {

      // Create experience data in the correct format for the backend        name: formData.title, // Use title as asset name

      const experienceData: ExperienceCreateDto = {        kind: formData.assetType,

        title: formData.title,      };

        description: formData.description || undefined,

        assets: [asset] // Backend expects an array of assets      if (formData.assetType === "message") {

      };        asset.text = formData.assetContent;

      } else {

      console.log('Sending experience data:', experienceData);        asset.url = formData.assetUrl;

        // Set MIME type based on asset type and URL

      const response = await createExperience(experienceData);        if (formData.assetUrl) {

          const extension = formData.assetUrl.split('.').pop()?.toLowerCase();

      if (response.success) {          if (formData.assetType === "image") {

        router.push("/experiences");            asset.mimeType = extension === "jpg" || extension === "jpeg" ? "image/jpeg" : 

      } else {                            extension === "png" ? "image/png" : 

        setError(response.message || "Error creando la experiencia");                            extension === "gif" ? "image/gif" : 

      }                            "image/*";

    } catch (err) {          } else if (formData.assetType === "video") {

      setError(err instanceof Error ? err.message : "Error inesperado");            asset.mimeType = extension === "mp4" ? "video/mp4" : 

    } finally {                            extension === "webm" ? "video/webm" : 

      setIsLoading(false);                            extension === "mov" ? "video/quicktime" :

    }                            "video/*";

  };          } else if (formData.assetType === "model3d") {

            asset.mimeType = extension === "glb" ? "model/gltf-binary" : 

  return (                            extension === "gltf" ? "model/gltf+json" :

    <div className="container mx-auto px-4 py-8 max-w-4xl">                            "model/*";

      {/* Header */}          }

      <div className="mb-8">        }

        <div className="flex items-center gap-4 mb-4">      }

          <Link href="/experiences">

            <Button variant="ghost" size="sm">      // Create experience data in the correct format for the backend

              ← Volver      const experienceData: ExperienceCreateDto = {

            </Button>        title: formData.title,

          </Link>        description: formData.description || undefined,

        </div>        assets: [asset] // Backend expects an array of assets

        <h1 className="text-3xl font-bold text-white mb-2">      };

          Crear Nueva Experiencia

        </h1>      console.log('Sending experience data:', experienceData);

        <p className="text-blue-200">

          Configura tu experiencia de realidad aumentada      const response = await createExperience(experienceData);

        </p>

      </div>      if (response.success) {

        router.push("/experiences");

      {error && (      } else {

        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">        setError(response.message || "Error creando la experiencia");

          <p className="text-red-400">{error}</p>      }

        </div>    } catch (err) {

      )}      setError(err instanceof Error ? err.message : "Error inesperado");

    } finally {

      <form onSubmit={handleSubmit} className="space-y-8">      setIsLoading(false);

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">    }

          {/* Left Column - Basic Info */}  };

          <Card className="glass">

            <CardHeader>  return (

              <CardTitle className="text-xl text-white">    <div className="container mx-auto px-4 py-8 max-w-4xl">

                Información Básica      {/* Header */}

              </CardTitle>      <div className="mb-8">

              <CardDescription>        <div className="flex items-center gap-4 mb-4">

                Detalles generales de la experiencia          <Link href="/experiences">

              </CardDescription>            <Button variant="ghost" size="sm">

            </CardHeader>              ← Volver

            <CardContent className="space-y-6">            </Button>

              {/* Title */}          </Link>

              <div>        </div>

                <label className="block text-sm font-medium text-blue-200 mb-2">        <h1 className="text-3xl font-bold text-white mb-2">

                  Título *          Crear Nueva Experiencia

                </label>        </h1>

                <input        <p className="text-blue-200">

                  type="text"          Configura tu experiencia de realidad aumentada

                  name="title"        </p>

                  value={formData.title}      </div>

                  onChange={handleInputChange}

                  required      {error && (

                  className="w-full px-4 py-3 bg-gray-900/50 backdrop-blur-sm border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all duration-200 hover:border-gray-500/70"        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">

                  placeholder="Ej: Mi primera experiencia AR"          <p className="text-red-400">{error}</p>

                />        </div>

              </div>      )}



              {/* Description */}      <form onSubmit={handleSubmit} className="space-y-8">

              <div>        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                <label className="block text-sm font-medium text-blue-200 mb-2">          {/* Left Column - Basic Info */}

                  Descripción          <Card className="glass">

                </label>            <CardHeader>

                <textarea              <CardTitle className="text-xl text-white">

                  name="description"                Información Básica

                  value={formData.description}              </CardTitle>

                  onChange={handleInputChange}              <CardDescription>

                  rows={4}                Detalles generales de la experiencia

                  className="w-full px-4 py-3 bg-gray-900/50 backdrop-blur-sm border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all duration-200 hover:border-gray-500/70 resize-none"              </CardDescription>

                  placeholder="Describe tu experiencia AR..."            </CardHeader>

                />            <CardContent className="space-y-6">

              </div>              {/* Title */}

              <div>

              {/* Asset Type */}                <label className="block text-sm font-medium text-blue-200 mb-2">

              <div>                  Título *

                <label className="block text-sm font-medium text-blue-200 mb-2">                </label>

                  Tipo de Contenido *                <input

                </label>                  type="text"

                <select                  name="title"

                  name="assetType"                  value={formData.title}

                  value={formData.assetType}                  onChange={handleInputChange}

                  onChange={handleInputChange}                  required

                  required                  className="w-full px-4 py-3 bg-gray-900/50 backdrop-blur-sm border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all duration-200 hover:border-gray-500/70"

                  className="w-full px-4 py-3 bg-gray-900/50 backdrop-blur-sm border border-gray-600/50 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all duration-200 hover:border-gray-500/70"                  placeholder="Ej: Mi primera experiencia AR"

                >                />

                  <option value="image">Imagen</option>              </div>

                  <option value="video">Video</option>

                  <option value="model3d">Modelo 3D</option>              {/* Description */}

                  <option value="message">Mensaje de Texto</option>              <div>

                </select>                <label className="block text-sm font-medium text-blue-200 mb-2">

              </div>                  Descripción

            </CardContent>                </label>

          </Card>                <textarea

                  name="description"

          {/* Right Column - Asset Content */}                  value={formData.description}

          <Card className="glass">                  onChange={handleInputChange}

            <CardHeader>                  rows={4}

              <CardTitle className="text-xl text-white">                  className="w-full px-4 py-3 bg-gray-900/50 backdrop-blur-sm border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all duration-200 hover:border-gray-500/70 resize-none"

                Contenido del Asset                  placeholder="Describe tu experiencia AR..."

              </CardTitle>                />

              <CardDescription>              </div>

                Configura el contenido de tu experiencia

              </CardDescription>              {/* Asset Type */}

            </CardHeader>              <div>

            <CardContent className="space-y-6">                <label className="block text-sm font-medium text-blue-200 mb-2">

              {/* Dynamic content based on asset type */}                  Tipo de Contenido *

              {formData.assetType === "message" ? (                </label>

                <div>                <select

                  <label className="block text-sm font-medium text-blue-200 mb-2">                  name="assetType"

                    Mensaje de Texto *                  value={formData.assetType}

                  </label>                  onChange={handleInputChange}

                  <textarea                  required

                    name="assetContent"                  className="w-full px-4 py-3 bg-gray-900/50 backdrop-blur-sm border border-gray-600/50 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all duration-200 hover:border-gray-500/70"

                    value={formData.assetContent || ""}                >

                    onChange={handleInputChange}                  <option value="image">Imagen</option>

                    rows={6}                  <option value="video">Video</option>

                    required                  <option value="model3d">Modelo 3D</option>

                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors resize-none"                  <option value="message">Mensaje de Texto</option>

                    placeholder="Escribe tu mensaje aquí..."                </select>

                  />              </div>

                </div>            </CardContent>

              ) : (          </Card>

                <FileUpload

                  assetType={formData.assetType}          {/* Right Column - Asset Content */}

                  onUploadComplete={(result) => {          <Card className="glass">

                    console.log('File upload result:', result);            <CardHeader>

                    if (result.success && result.url) {              <CardTitle className="text-xl text-white">

                      console.log('Setting asset URL:', result.url);                Contenido del Asset

                      setFormData((prev) => ({              </CardTitle>

                        ...prev,              <CardDescription>

                        assetUrl: result.url,                Configura el contenido de tu experiencia

                        file: undefined, // Clear file since it's uploaded              </CardDescription>

                      }));            </CardHeader>

                    } else {            <CardContent className="space-y-6">

                      console.error('Upload failed:', result.error);              {/* Dynamic content based on asset type */}

                      setError(result.error || "Error subiendo archivo");              {formData.assetType === "message" ? (

                    }                <div>

                  }}                  <label className="block text-sm font-medium text-blue-200 mb-2">

                  onFileSelect={(file) => {                    Mensaje de Texto *

                    console.log('File selected:', file.name);                  </label>

                    setFormData((prev) => ({ ...prev, file }));                  <textarea

                    setError(null); // Clear any previous errors                    name="assetContent"

                  }}                    value={formData.assetContent || ""}

                />                    onChange={handleInputChange}

              )}                    rows={6}

                    required

              {/* URL Option for non-file assets */}                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors resize-none"

              {formData.assetType !== "message" && (                    placeholder="Escribe tu mensaje aquí..."

                <div>                  />

                  <label className="block text-sm font-medium text-blue-200 mb-2">                </div>

                    O proporciona una URL              ) : (

                  </label>                <FileUpload

                  <input                  assetType={formData.assetType}

                    type="url"                  onUploadComplete={(result) => {

                    name="assetUrl"                    console.log('File upload result:', result);

                    value={formData.assetUrl || ""}                    if (result.success && result.url) {

                    onChange={handleInputChange}                      console.log('Setting asset URL:', result.url);

                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"                      setFormData((prev) => ({

                    placeholder="https://ejemplo.com/archivo..."                        ...prev,

                  />                        assetUrl: result.url,

                </div>                        file: undefined, // Clear file since it's uploaded

              )}                      }));

                    } else {

              {/* Status indicator */}                      console.error('Upload failed:', result.error);

              <div className="mt-4 p-3 bg-gray-800/20 rounded-lg">                      setError(result.error || "Error subiendo archivo");

                <div className="text-sm text-gray-400">                    }

                  <div className="flex items-center justify-between">                  }}

                    <span>Estado del asset:</span>                  onFileSelect={(file) => {

                    <span className={`font-medium ${                    console.log('File selected:', file.name);

                      (formData.assetType === "message" && formData.assetContent) ||                    setFormData((prev) => ({ ...prev, file }));

                      (formData.assetType !== "message" && formData.assetUrl)                    setError(null); // Clear any previous errors

                        ? "text-green-400"                   }}

                        : "text-yellow-400"                />

                    }`}>              )}

                      {(formData.assetType === "message" && formData.assetContent) ||

                       (formData.assetType !== "message" && formData.assetUrl)              {/* URL Option for non-file assets */}

                        ? "✓ Listo"              {formData.assetType !== "message" && (

                        : "⏳ Pendiente"}                <div>

                    </span>                  <label className="block text-sm font-medium text-blue-200 mb-2">

                  </div>                    O proporciona una URL

                                    </label>

                  {formData.assetUrl && formData.assetType !== "message" && (                  <input

                    <div className="mt-2 text-xs text-blue-300 break-all">                    type="url"

                      URL: {formData.assetUrl}                    name="assetUrl"

                    </div>                    value={formData.assetUrl || ""}

                  )}                    onChange={handleInputChange}

                </div>                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"

              </div>                    placeholder="https://ejemplo.com/archivo..."

            </CardContent>                  />

          </Card>                </div>

        </div>              )}

            </CardContent>

        {/* Actions */}          </Card>

        <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t border-gray-600/30">        </div>

          <Link href="/experiences">

            <Button variant="ghost" className="w-full sm:w-auto">        {/* Actions */}

              Cancelar        <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t border-gray-600/30">

            </Button>          <Link href="/experiences">

          </Link>            <Button variant="ghost" className="w-full sm:w-auto">

          <Button              Cancelar

            type="submit"            </Button>

            disabled={isLoading}          </Link>

            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"          <Button

          >            type="submit"

            {isLoading ? "Creando..." : "Crear Experiencia"}            disabled={isLoading}

          </Button>            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"

        </div>          >

      </form>            {isLoading ? "Creando..." : "Crear Experiencia"}

    </div>          </Button>

  );        </div>

}      </form>
    </div>
  );
}
