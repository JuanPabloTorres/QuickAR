"use client";"use client";"use client";



import { Button } from "@/components/ui/button";

import {

  Card,import { Button } from "@/components/ui/button";import { Button } from "@/components/ui/button";

  CardContent,

  CardDescription,import {import {

  CardHeader,

  CardTitle,  Card,  Card,

} from "@/components/ui/card";

import FileUpload from "@/components/ui/file-upload";  CardContent,  CardContent,

import { createExperience } from "@/lib/api/experiences";

import { Asset, AssetCreateDto, ExperienceCreateDto } from "@/types";  CardDescription,  CardDescription,

import Link from "next/link";

import { useRouter } from "next/navigation";  CardHeader,  CardHeader,

import { useState } from "react";

  CardTitle,  CardTitle,

type AssetType = Asset["assetType"];

} from "@/components/ui/card";} from "@/components/ui/card";

interface FormData {

  title: string;import FileUpload from "@/components/ui/file-upload";import FileUpload from "@/components/ui/file-upload";

  description: string;

  assetType: AssetType;import { createExperience } from "@/lib/api/experiences";import { createExperience } from "@                  )}

  assetUrl?: string;

  assetContent?: string;import { Asset, AssetCreateDto, ExperienceCreateDto } from "@/types";

  file?: File;

}import Link from "next/link";              {/* Status indicator */}



export default function CreateExperiencePage() {import { useRouter } from "next/navigation";              <div className="mt-4 p-3 bg-gray-800/20 rounded-lg">

  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({import { useState } from "react";                <div className="text-sm text-gray-400">

    title: "",

    description: "",                  <div className="flex items-center justify-between">

    assetType: "image",

  });type AssetType = Asset["assetType"];                    <span>Estado del asset:</span>

  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);                    <span className={`font-medium ${



  const handleInputChange = (interface FormData {                      (formData.assetType === "message" && formData.assetContent) ||

    e: React.ChangeEvent<

      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement  title: string;                      (formData.assetType !== "message" && formData.assetUrl)

    >

  ) => {  description: string;                        ? "text-green-400" 

    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));  assetType: AssetType;                        : "text-yellow-400"

  };

  assetUrl?: string;                    }`}>

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();  assetContent?: string;                      {(formData.assetType === "message" && formData.assetContent) ||

    setIsLoading(true);

    setError(null);  file?: File;                       (formData.assetType !== "message" && formData.assetUrl)



    try {}                        ? "✓ Listo"

      // Validate that we have an asset

      if (formData.assetType === "message" && !formData.assetContent?.trim()) {                        : "⏳ Pendiente"}

        setError("Por favor, proporciona un mensaje de texto");

        return;export default function CreateExperiencePage() {                    </span>

      }

  const router = useRouter();                  </div>

      if (formData.assetType !== "message" && !formData.assetUrl?.trim()) {

        setError("Por favor, sube un archivo o proporciona una URL");  const [formData, setFormData] = useState<FormData>({                  

        return;

      }    title: "",                  {formData.assetUrl && formData.assetType !== "message" && (



      // Prepare asset based on asset type    description: "",                    <div className="mt-2 text-xs text-blue-300 break-all">

      let asset: AssetCreateDto = {

        name: formData.title,    assetType: "image",                      URL: {formData.assetUrl}

        kind: formData.assetType,

      };  });                    </div>



      if (formData.assetType === "message") {  const [isLoading, setIsLoading] = useState(false);                  )}

        asset.text = formData.assetContent;

      } else {  const [error, setError] = useState<string | null>(null);                </div>

        asset.url = formData.assetUrl;

        if (formData.assetUrl) {              </div>

          const extension = formData.assetUrl.split('.').pop()?.toLowerCase();

          if (formData.assetType === "image") {  const handleInputChange = (            </CardContent>

            asset.mimeType = extension === "jpg" || extension === "jpeg" ? "image/jpeg" : 

                            extension === "png" ? "image/png" :     e: React.ChangeEvent<          </Card>

                            extension === "gif" ? "image/gif" : 

                            "image/*";      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement        </div>pi/experiences";

          } else if (formData.assetType === "video") {

            asset.mimeType = extension === "mp4" ? "video/mp4" :     >import { Asset, AssetCreateDto, ExperienceCreateDto } from "@/types";

                            extension === "webm" ? "video/webm" : 

                            extension === "mov" ? "video/quicktime" :  ) => {import Link from "next/link";

                            "video/*";

          } else if (formData.assetType === "model3d") {    const { name, value } = e.target;import { useRouter } from "next/navigation";

            asset.mimeType = extension === "glb" ? "model/gltf-binary" : 

                            extension === "gltf" ? "model/gltf+json" :    setFormData((prev) => ({ ...prev, [name]: value }));import { useState } from "react";

                            "model/*";

          }  };

        }

      }type AssetType = Asset["assetType"];



      const experienceData: ExperienceCreateDto = {  const handleSubmit = async (e: React.FormEvent) => {

        title: formData.title,

        description: formData.description || undefined,    e.preventDefault();interface FormData {

        assets: [asset]

      };    setIsLoading(true);  title: string;



      console.log('Sending experience data:', experienceData);    setError(null);  description: string;



      const response = await createExperience(experienceData);  assetType: AssetType;



      if (response.success) {    try {  assetUrl?: string;

        router.push("/experiences");

      } else {      // Validate that we have an asset  assetContent?: string;

        setError(response.message || "Error creando la experiencia");

      }      if (formData.assetType === "message" && !formData.assetContent?.trim()) {  file?: File;

    } catch (err) {

      setError(err instanceof Error ? err.message : "Error inesperado");        setError("Por favor, proporciona un mensaje de texto");}

    } finally {

      setIsLoading(false);        return;

    }

  };      }export default function CreateExperiencePage() {



  const hasValidAsset = (formData.assetType === "message" && formData.assetContent) ||  const router = useRouter();

                       (formData.assetType !== "message" && formData.assetUrl);

      if (formData.assetType !== "message" && !formData.assetUrl?.trim()) {  const [formData, setFormData] = useState<FormData>({

  return (

    <div className="container mx-auto px-4 py-8 max-w-4xl">        setError("Por favor, sube un archivo o proporciona una URL");    title: "",

      <div className="mb-8">

        <div className="flex items-center gap-4 mb-4">        return;    description: "",

          <Link href="/experiences">

            <Button variant="ghost" size="sm">      }    assetType: "image",

              ← Volver

            </Button>  });

          </Link>

        </div>      // Prepare asset based on asset type  const [isLoading, setIsLoading] = useState(false);

        <h1 className="text-3xl font-bold text-white mb-2">

          Crear Nueva Experiencia      let asset: AssetCreateDto = {  const [error, setError] = useState<string | null>(null);

        </h1>

        <p className="text-blue-200">        name: formData.title, // Use title as asset name

          Configura tu experiencia de realidad aumentada

        </p>        kind: formData.assetType,  const handleInputChange = (

      </div>

      };    e: React.ChangeEvent<

      {error && (

        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement

          <p className="text-red-400">{error}</p>

        </div>      if (formData.assetType === "message") {    >

      )}

        asset.text = formData.assetContent;  ) => {

      <form onSubmit={handleSubmit} className="space-y-8">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">      } else {    const { name, value } = e.target;

          <Card className="glass">

            <CardHeader>        asset.url = formData.assetUrl;    setFormData((prev) => ({ ...prev, [name]: value }));

              <CardTitle className="text-xl text-white">

                Información Básica        // Set MIME type based on asset type and URL  };

              </CardTitle>

              <CardDescription>        if (formData.assetUrl) {

                Detalles generales de la experiencia

              </CardDescription>          const extension = formData.assetUrl.split('.').pop()?.toLowerCase();  const handleSubmit = async (e: React.FormEvent) => {

            </CardHeader>

            <CardContent className="space-y-6">          if (formData.assetType === "image") {    e.preventDefault();

              <div>

                <label className="block text-sm font-medium text-blue-200 mb-2">            asset.mimeType = extension === "jpg" || extension === "jpeg" ? "image/jpeg" :     setIsLoading(true);

                  Título *

                </label>                            extension === "png" ? "image/png" :     setError(null);

                <input

                  type="text"                            extension === "gif" ? "image/gif" : 

                  name="title"

                  value={formData.title}                            "image/*";    try {

                  onChange={handleInputChange}

                  required          } else if (formData.assetType === "video") {      // Validate that we have an asset

                  className="w-full px-4 py-3 bg-gray-900/50 backdrop-blur-sm border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all duration-200 hover:border-gray-500/70"

                  placeholder="Ej: Mi primera experiencia AR"            asset.mimeType = extension === "mp4" ? "video/mp4" :       if (formData.assetType === "message" && !formData.assetContent?.trim()) {

                />

              </div>                            extension === "webm" ? "video/webm" :         setError("Por favor, proporciona un mensaje de texto");



              <div>                            extension === "mov" ? "video/quicktime" :        return;

                <label className="block text-sm font-medium text-blue-200 mb-2">

                  Descripción                            "video/*";      }

                </label>

                <textarea          } else if (formData.assetType === "model3d") {

                  name="description"

                  value={formData.description}            asset.mimeType = extension === "glb" ? "model/gltf-binary" :       if (formData.assetType !== "message" && !formData.assetUrl?.trim()) {

                  onChange={handleInputChange}

                  rows={4}                            extension === "gltf" ? "model/gltf+json" :        setError("Por favor, sube un archivo o proporciona una URL");

                  className="w-full px-4 py-3 bg-gray-900/50 backdrop-blur-sm border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all duration-200 hover:border-gray-500/70 resize-none"

                  placeholder="Describe tu experiencia AR..."                            "model/*";        return;

                />

              </div>          }      }



              <div>        }

                <label className="block text-sm font-medium text-blue-200 mb-2">

                  Tipo de Contenido *      }      // Prepare asset based on asset type

                </label>

                <select      let asset: AssetCreateDto = {

                  name="assetType"

                  value={formData.assetType}      // Create experience data in the correct format for the backend        name: formData.title, // Use title as asset name

                  onChange={handleInputChange}

                  required      const experienceData: ExperienceCreateDto = {        kind: formData.assetType,

                  className="w-full px-4 py-3 bg-gray-900/50 backdrop-blur-sm border border-gray-600/50 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all duration-200 hover:border-gray-500/70"

                >        title: formData.title,      };

                  <option value="image">Imagen</option>

                  <option value="video">Video</option>        description: formData.description || undefined,

                  <option value="model3d">Modelo 3D</option>

                  <option value="message">Mensaje de Texto</option>        assets: [asset] // Backend expects an array of assets      if (formData.assetType === "message") {

                </select>

              </div>      };        asset.text = formData.assetContent;

            </CardContent>

          </Card>      } else {



          <Card className="glass">      console.log('Sending experience data:', experienceData);        asset.url = formData.assetUrl;

            <CardHeader>

              <CardTitle className="text-xl text-white">        // Set MIME type based on asset type and URL

                Contenido del Asset

              </CardTitle>      const response = await createExperience(experienceData);        if (formData.assetUrl) {

              <CardDescription>

                Configura el contenido de tu experiencia          const extension = formData.assetUrl.split('.').pop()?.toLowerCase();

              </CardDescription>

            </CardHeader>      if (response.success) {          if (formData.assetType === "image") {

            <CardContent className="space-y-6">

              {formData.assetType === "message" ? (        router.push("/experiences");            asset.mimeType = extension === "jpg" || extension === "jpeg" ? "image/jpeg" : 

                <div>

                  <label className="block text-sm font-medium text-blue-200 mb-2">      } else {                            extension === "png" ? "image/png" : 

                    Mensaje de Texto *

                  </label>        setError(response.message || "Error creando la experiencia");                            extension === "gif" ? "image/gif" : 

                  <textarea

                    name="assetContent"      }                            "image/*";

                    value={formData.assetContent || ""}

                    onChange={handleInputChange}    } catch (err) {          } else if (formData.assetType === "video") {

                    rows={6}

                    required      setError(err instanceof Error ? err.message : "Error inesperado");            asset.mimeType = extension === "mp4" ? "video/mp4" : 

                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors resize-none"

                    placeholder="Escribe tu mensaje aquí..."    } finally {                            extension === "webm" ? "video/webm" : 

                  />

                </div>      setIsLoading(false);                            extension === "mov" ? "video/quicktime" :

              ) : (

                <FileUpload    }                            "video/*";

                  assetType={formData.assetType}

                  onUploadComplete={(result) => {  };          } else if (formData.assetType === "model3d") {

                    console.log('File upload result:', result);

                    if (result.success && result.url) {            asset.mimeType = extension === "glb" ? "model/gltf-binary" : 

                      console.log('Setting asset URL:', result.url);

                      setFormData((prev) => ({  return (                            extension === "gltf" ? "model/gltf+json" :

                        ...prev,

                        assetUrl: result.url,    <div className="container mx-auto px-4 py-8 max-w-4xl">                            "model/*";

                        file: undefined,

                      }));      {/* Header */}          }

                    } else {

                      console.error('Upload failed:', result.error);      <div className="mb-8">        }

                      setError(result.error || "Error subiendo archivo");

                    }        <div className="flex items-center gap-4 mb-4">      }

                  }}

                  onFileSelect={(file) => {          <Link href="/experiences">

                    console.log('File selected:', file.name);

                    setFormData((prev) => ({ ...prev, file }));            <Button variant="ghost" size="sm">      // Create experience data in the correct format for the backend

                    setError(null);

                  }}              ← Volver      const experienceData: ExperienceCreateDto = {

                />

              )}            </Button>        title: formData.title,



              {formData.assetType !== "message" && (          </Link>        description: formData.description || undefined,

                <div>

                  <label className="block text-sm font-medium text-blue-200 mb-2">        </div>        assets: [asset] // Backend expects an array of assets

                    O proporciona una URL

                  </label>        <h1 className="text-3xl font-bold text-white mb-2">      };

                  <input

                    type="url"          Crear Nueva Experiencia

                    name="assetUrl"

                    value={formData.assetUrl || ""}        </h1>      console.log('Sending experience data:', experienceData);

                    onChange={handleInputChange}

                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"        <p className="text-blue-200">

                    placeholder="https://ejemplo.com/archivo..."

                  />          Configura tu experiencia de realidad aumentada      const response = await createExperience(experienceData);

                </div>

              )}        </p>



              <div className="mt-4 p-3 bg-gray-800/20 rounded-lg">      </div>      if (response.success) {

                <div className="text-sm text-gray-400">

                  <div className="flex items-center justify-between">        router.push("/experiences");

                    <span>Estado del asset:</span>

                    <span className={`font-medium ${      {error && (      } else {

                      hasValidAsset ? "text-green-400" : "text-yellow-400"

                    }`}>        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">        setError(response.message || "Error creando la experiencia");

                      {hasValidAsset ? "✓ Listo" : "⏳ Pendiente"}

                    </span>          <p className="text-red-400">{error}</p>      }

                  </div>

                          </div>    } catch (err) {

                  {formData.assetUrl && formData.assetType !== "message" && (

                    <div className="mt-2 text-xs text-blue-300 break-all">      )}      setError(err instanceof Error ? err.message : "Error inesperado");

                      URL: {formData.assetUrl}

                    </div>    } finally {

                  )}

                </div>      <form onSubmit={handleSubmit} className="space-y-8">      setIsLoading(false);

              </div>

            </CardContent>        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">    }

          </Card>

        </div>          {/* Left Column - Basic Info */}  };



        <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t border-gray-600/30">          <Card className="glass">

          <Link href="/experiences">

            <Button variant="ghost" className="w-full sm:w-auto">            <CardHeader>  return (

              Cancelar

            </Button>              <CardTitle className="text-xl text-white">    <div className="container mx-auto px-4 py-8 max-w-4xl">

          </Link>

          <Button                Información Básica      {/* Header */}

            type="submit"

            disabled={isLoading || !hasValidAsset}              </CardTitle>      <div className="mb-8">

            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed"

          >              <CardDescription>        <div className="flex items-center gap-4 mb-4">

            {isLoading ? "Creando..." : "Crear Experiencia"}

          </Button>                Detalles generales de la experiencia          <Link href="/experiences">

        </div>

      </form>              </CardDescription>            <Button variant="ghost" size="sm">

    </div>

  );            </CardHeader>              ← Volver

}
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
