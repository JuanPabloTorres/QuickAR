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

import { createExperience } from "@/lib/api/experiences";import { createExperience } from "@/lib/api/experiences";

import { Asset } from "@/types";import { Asset } from "@/types";

import Link from "next/link";import Link from "next/link";

import { useRouter } from "next/navigation";import { useRouter } from "next/navigation";

import { useState } from "react";import { useState } from "react";



type AssetType = Asset["assetType"];type AssetType = Asset["assetType"];



interface FormData {interface FormData {

  title: string;  title: string;

  description: string;  description: string;

  assetType: AssetType;  assetType: AssetType;

  assetUrl?: string;  assetUrl?: string;

  assetContent?: string;  assetContent?: string;

  file?: File;  file?: File;

}}



export default function CreateExperiencePage() {export default function CreateExperiencePage() {

  const router = useRouter();  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({  const [formData, setFormData] = useState<FormData>({

    title: "",    title: "",

    description: "",    description: "",

    assetType: "image",    assetType: "image",

  });  });

  const [isLoading, setIsLoading] = useState(false);  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);  const [error, setError] = useState<string | null>(null);



  const handleInputChange = (  const handleInputChange = (

    e: React.ChangeEvent<    e: React.ChangeEvent<

      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement

    >    >

  ) => {  ) => {

    const { name, value } = e.target;    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));    setFormData((prev) => ({ ...prev, [name]: value }));

  };  };



  const handleSubmit = async (e: React.FormEvent) => {  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();    e.preventDefault();

    setIsLoading(true);    setIsLoading(true);

    setError(null);    setError(null);



    try {    try {

      // Validate that we have an asset      // Validate that we have an asset

      if (formData.assetType !== "message" && !formData.assetUrl) {      if (formData.assetType !== "message" && !formData.assetUrl) {

        setError("Por favor, sube un archivo o proporciona una URL");        setError("Por favor, sube un archivo o proporciona una URL");

        return;        return;

      }      }



      if (formData.assetType === "message" && !formData.assetContent) {      // Prepare data based on asset type

        setError("Por favor, proporciona un mensaje de texto");      let experienceData = {

        return;        title: formData.title,

      }        description: formData.description,

        assetType: formData.assetType,

      // Create the asset based on type        assetUrl: formData.assetUrl || "",

      const asset = {        assetContent: formData.assetContent || "",

        name: formData.title || "Asset sin nombre", // Use title as asset name, with fallback      };

        kind: formData.assetType,

        url: formData.assetType !== "message" ? (formData.assetUrl || undefined) : undefined,      const response = await createExperience(experienceData);

        text: formData.assetType === "message" ? formData.assetContent : undefined,

        mimeType: formData.file?.type,      if (response.success) {

        fileSizeBytes: formData.file?.size,        router.push("/experiences");

      };      } else {

        setError(response.message || "Error creando la experiencia");

      // Prepare experience data with assets array      }

      const experienceData = {    } catch (err) {

        title: formData.title,      setError(err instanceof Error ? err.message : "Error inesperado");

        description: formData.description,    } finally {

        assets: [asset], // Backend expects an array of assets      setIsLoading(false);

      };    }

  };

      console.log("Enviando datos al backend:", experienceData);

  return (

      const response = await createExperience(experienceData);    <div className="container mx-auto px-4 py-8 max-w-4xl">

      {/* Header */}

      if (response.success) {      <div className="mb-8">

        router.push("/experiences");        <div className="flex items-center gap-4 mb-4">

      } else {          <Link href="/experiences">

        setError(response.message || "Error creando la experiencia");            <Button variant="ghost" size="sm">

      }              ← Volver

    } catch (err) {            </Button>

      setError(err instanceof Error ? err.message : "Error inesperado");          </Link>

    } finally {        </div>

      setIsLoading(false);        <h1 className="text-3xl font-bold text-white mb-2">

    }          Crear Nueva Experiencia

  };        </h1>

        <p className="text-blue-200">

  return (          Configura tu experiencia de realidad aumentada

    <div className="container mx-auto px-4 py-8 max-w-4xl">        </p>

      {/* Header */}      </div>

      <div className="mb-8">

        <div className="flex items-center gap-4 mb-4">      {error && (

          <Link href="/experiences">        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">

            <Button variant="ghost" size="sm">          <p className="text-red-400">{error}</p>

              ← Volver        </div>

            </Button>      )}

          </Link>

        </div>      <form onSubmit={handleSubmit} className="space-y-8">

        <h1 className="text-3xl font-bold text-white mb-2">        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          Crear Nueva Experiencia          {/* Left Column - Basic Info */}

        </h1>          <Card className="glass">

        <p className="text-blue-200">            <CardHeader>

          Configura tu experiencia de realidad aumentada              <CardTitle className="text-xl text-white">

        </p>                Información Básica

      </div>              </CardTitle>

              <CardDescription>

      {error && (                Detalles generales de la experiencia

        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">              </CardDescription>

          <p className="text-red-400">{error}</p>            </CardHeader>

        </div>            <CardContent className="space-y-6">

      )}              {/* Title */}

              <div>

      <form onSubmit={handleSubmit} className="space-y-8">                <label className="block text-sm font-medium text-blue-200 mb-2">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">                  Título *

          {/* Left Column - Basic Info */}                </label>

          <Card className="glass">                <input

            <CardHeader>                  type="text"

              <CardTitle className="text-xl text-white">                  name="title"

                Información Básica                  value={formData.title}

              </CardTitle>                  onChange={handleInputChange}

              <CardDescription>                  required

                Detalles generales de la experiencia                  className="w-full px-4 py-3 bg-gray-900/50 backdrop-blur-sm border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all duration-200 hover:border-gray-500/70"

              </CardDescription>                  placeholder="Ej: Mi primera experiencia AR"

            </CardHeader>                />

            <CardContent className="space-y-6">              </div>

              {/* Title */}

              <div>              {/* Description */}

                <label className="block text-sm font-medium text-blue-200 mb-2">              <div>

                  Título *                <label className="block text-sm font-medium text-blue-200 mb-2">

                </label>                  Descripción

                <input                </label>

                  type="text"                <textarea

                  name="title"                  name="description"

                  value={formData.title}                  value={formData.description}

                  onChange={handleInputChange}                  onChange={handleInputChange}

                  required                  rows={4}

                  className="w-full px-4 py-3 bg-gray-900/50 backdrop-blur-sm border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all duration-200 hover:border-gray-500/70"                  className="w-full px-4 py-3 bg-gray-900/50 backdrop-blur-sm border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all duration-200 hover:border-gray-500/70 resize-none"

                  placeholder="Ej: Mi primera experiencia AR"                  placeholder="Describe tu experiencia AR..."

                />                />

              </div>              </div>



              {/* Description */}              {/* Asset Type */}

              <div>              <div>

                <label className="block text-sm font-medium text-blue-200 mb-2">                <label className="block text-sm font-medium text-blue-200 mb-2">

                  Descripción                  Tipo de Contenido *

                </label>                </label>

                <textarea                <select

                  name="description"                  name="assetType"

                  value={formData.description}                  value={formData.assetType}

                  onChange={handleInputChange}                  onChange={handleInputChange}

                  rows={4}                  required

                  className="w-full px-4 py-3 bg-gray-900/50 backdrop-blur-sm border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all duration-200 hover:border-gray-500/70 resize-none"                  className="w-full px-4 py-3 bg-gray-900/50 backdrop-blur-sm border border-gray-600/50 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all duration-200 hover:border-gray-500/70"

                  placeholder="Describe tu experiencia AR..."                >

                />                  <option value="image">Imagen</option>

              </div>                  <option value="video">Video</option>

                  <option value="model3d">Modelo 3D</option>

              {/* Asset Type */}                  <option value="message">Mensaje de Texto</option>

              <div>                </select>

                <label className="block text-sm font-medium text-blue-200 mb-2">              </div>

                  Tipo de Contenido *            </CardContent>

                </label>          </Card>

                <select

                  name="assetType"          {/* Right Column - Asset Content */}

                  value={formData.assetType}          <Card className="glass">

                  onChange={handleInputChange}            <CardHeader>

                  required              <CardTitle className="text-xl text-white">

                  className="w-full px-4 py-3 bg-gray-900/50 backdrop-blur-sm border border-gray-600/50 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all duration-200 hover:border-gray-500/70"                Contenido del Asset

                >              </CardTitle>

                  <option value="image">Imagen</option>              <CardDescription>

                  <option value="video">Video</option>                Configura el contenido de tu experiencia

                  <option value="model3d">Modelo 3D</option>              </CardDescription>

                  <option value="message">Mensaje de Texto</option>            </CardHeader>

                </select>            <CardContent className="space-y-6">

              </div>              {/* Dynamic content based on asset type */}

            </CardContent>              {formData.assetType === "message" ? (

          </Card>                <div>

                  <label className="block text-sm font-medium text-blue-200 mb-2">

          {/* Right Column - Asset Content */}                    Mensaje de Texto *

          <Card className="glass">                  </label>

            <CardHeader>                  <textarea

              <CardTitle className="text-xl text-white">                    name="assetContent"

                Contenido del Asset                    value={formData.assetContent || ""}

              </CardTitle>                    onChange={handleInputChange}

              <CardDescription>                    rows={6}

                Configura el contenido de tu experiencia                    required

              </CardDescription>                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors resize-none"

            </CardHeader>                    placeholder="Escribe tu mensaje aquí..."

            <CardContent className="space-y-6">                  />

              {/* Dynamic content based on asset type */}                </div>

              {formData.assetType === "message" ? (              ) : (

                <div>                <FileUpload

                  <label className="block text-sm font-medium text-blue-200 mb-2">                  assetType={formData.assetType}

                    Mensaje de Texto *                  onUploadComplete={(result) => {

                  </label>                    if (result.success && result.url) {

                  <textarea                      setFormData((prev) => ({

                    name="assetContent"                        ...prev,

                    value={formData.assetContent || ""}                        assetUrl: result.url,

                    onChange={handleInputChange}                        file: undefined, // Clear file since it's uploaded

                    rows={6}                      }));

                    required                    } else {

                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors resize-none"                      setError(result.error || "Error subiendo archivo");

                    placeholder="Escribe tu mensaje aquí..."                    }

                  />                  }}

                </div>                  onFileSelect={(file) => {

              ) : (                    setFormData((prev) => ({ ...prev, file }));

                <FileUpload                    setError(null); // Clear any previous errors

                  assetType={formData.assetType}                  }}

                  onUploadComplete={(result) => {                />

                    if (result.success && result.url) {              )}

                      setFormData((prev) => ({

                        ...prev,              {/* URL Option for non-file assets */}

                        assetUrl: result.url,              {formData.assetType !== "message" && (

                        file: undefined, // Clear file since it's uploaded                <div>

                      }));                  <label className="block text-sm font-medium text-blue-200 mb-2">

                    } else {                    O proporciona una URL

                      setError(result.error || "Error subiendo archivo");                  </label>

                    }                  <input

                  }}                    type="url"

                  onFileSelect={(file) => {                    name="assetUrl"

                    setFormData((prev) => ({ ...prev, file }));                    value={formData.assetUrl || ""}

                    setError(null); // Clear any previous errors                    onChange={handleInputChange}

                  }}                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"

                />                    placeholder="https://ejemplo.com/archivo..."

              )}                  />

                </div>

              {/* URL Option for non-file assets */}              )}

              {formData.assetType !== "message" && (            </CardContent>

                <div>          </Card>

                  <label className="block text-sm font-medium text-blue-200 mb-2">        </div>

                    O proporciona una URL

                  </label>        {/* Actions */}

                  <input        <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t border-gray-600/30">

                    type="url"          <Link href="/experiences">

                    name="assetUrl"            <Button variant="ghost" className="w-full sm:w-auto">

                    value={formData.assetUrl || ""}              Cancelar

                    onChange={handleInputChange}            </Button>

                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"          </Link>

                    placeholder="https://ejemplo.com/archivo..."          <Button

                  />            type="submit"

                </div>            disabled={isLoading}

              )}            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"

            </CardContent>          >

          </Card>            {isLoading ? "Creando..." : "Crear Experiencia"}

        </div>          </Button>

        </div>

        {/* Actions */}      </form>

        <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t border-gray-600/30">    </div>

          <Link href="/experiences">  );

            <Button variant="ghost" className="w-full sm:w-auto">}

              Cancelar
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? "Creando..." : "Crear Experiencia"}
          </Button>
        </div>
      </form>
    </div>
  );
}