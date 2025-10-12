"use client";"use client";"use client";"use client";



import { Button } from "@/components/ui/button";

import {

  Card,import { Button } from "@/components/ui/button";

  CardContent,

  CardDescription,import {

  CardHeader,

  CardTitle,  Card,import { Button } from "@/components/ui/button";import { Button } from "@/components/ui/button";

} from "@/components/ui/card";

import FileUpload from "@/components/ui/file-upload";  CardContent,

import { createExperience } from "@/lib/api/experiences";

import { Asset } from "@/types";  CardDescription,import {import {

import Link from "next/link";

import { useRouter } from "next/navigation";  CardHeader,

import { useState } from "react";

  CardTitle,  Card,  Card,

type AssetType = Asset["assetType"];

} from "@/components/ui/card";

interface FormData {

  title: string;import FileUpload from "@/components/ui/file-upload";  CardContent,  CardContent,

  description: string;

  assetType: AssetType;import { createExperience } from "@/lib/api/experiences";

  assetUrl?: string;

  assetContent?: string;import { Asset } from "@/types";  CardDescription,  CardDescription,

  file?: File;

}import Link from "next/link";



export default function CreateExperiencePage() {import { useRouter } from "next/navigation";  CardHeader,  CardHeader,

  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({import { useState } from "react";

    title: "",

    description: "",  CardTitle,  CardTitle,

    assetType: "image",

  });type AssetType = Asset["assetType"];

  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);} from "@/components/ui/card";} from "@/components/ui/card";



  const handleInputChange = (interface FormData {

    e: React.ChangeEvent<

      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement  title: string;import FileUpload from "@/components/ui/file-upload";import FileUpload from "@/components/ui/file-upload";

    >

  ) => {  description: string;

    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));  assetType: AssetType;import { createExperience } from "@/lib/api/experiences";import { createExperience } from "@/lib/api/experiences";

  };

  assetUrl?: string;

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();  assetContent?: string;import { Asset } from "@/types";import { Asset } from "@/types";

    setIsLoading(true);

    setError(null);  file?: File;



    try {}import Link from "next/link";import Link from "next/link";

      // Validate that we have an asset

      if (formData.assetType !== "message" && !formData.assetUrl) {

        setError("Por favor, sube un archivo o proporciona una URL");

        return;export default function CreateExperiencePage() {import { useRouter } from "next/navigation";import { useRouter } from "next/navigation";

      }

  const router = useRouter();

      if (formData.assetType === "message" && !formData.assetContent) {

        setError("Por favor, proporciona un mensaje de texto");  const [formData, setFormData] = useState<FormData>({import { useState } from "react";import { useState } from "react";

        return;

      }    title: "",



      // Create the asset based on type    description: "",

      const asset = {

        name: formData.title || "Asset sin nombre", // Use title as asset name, with fallback    assetType: "image",

        kind: formData.assetType,

        url: formData.assetType !== "message" ? (formData.assetUrl || undefined) : undefined,  });type AssetType = Asset["assetType"];type AssetType = Asset["assetType"];

        text: formData.assetType === "message" ? formData.assetContent : undefined,

        mimeType: formData.file?.type,  const [isLoading, setIsLoading] = useState(false);

        fileSizeBytes: formData.file?.size,

      };  const [error, setError] = useState<string | null>(null);



      // Prepare experience data with assets array

      const experienceData = {

        title: formData.title,  const handleInputChange = (interface FormData {interface FormData {

        description: formData.description,

        assets: [asset], // Backend expects an array of assets    e: React.ChangeEvent<

      };

      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement  title: string;  title: string;

      console.log("Enviando datos al backend:", experienceData);

    >

      const response = await createExperience(experienceData);

  ) => {  description: string;  description: string;

      if (response.success) {

        router.push("/experiences");    const { name, value } = e.target;

      } else {

        setError(response.message || "Error creando la experiencia");    setFormData((prev) => ({ ...prev, [name]: value }));  assetType: AssetType;  assetType: AssetType;

      }

    } catch (err) {  };

      setError(err instanceof Error ? err.message : "Error inesperado");

    } finally {  assetUrl?: string;  assetUrl?: string;

      setIsLoading(false);

    }  const handleSubmit = async (e: React.FormEvent) => {

  };

    e.preventDefault();  assetContent?: string;  assetContent?: string;

  return (

    <div className="container mx-auto px-4 py-8 max-w-4xl">    setIsLoading(true);

      {/* Header */}

      <div className="mb-8">    setError(null);  file?: File;  file?: File;

        <div className="flex items-center gap-4 mb-4">

          <Link href="/experiences">

            <Button variant="ghost" size="sm">

              ← Volver    try {}}

            </Button>

          </Link>      // Validate that we have an asset

        </div>

        <h1 className="text-3xl font-bold text-white mb-2">      if (formData.assetType !== "message" && !formData.assetUrl) {

          Crear Nueva Experiencia

        </h1>        setError("Por favor, sube un archivo o proporciona una URL");

        <p className="text-blue-200">

          Configura tu experiencia de realidad aumentada        return;export default function CreateExperiencePage() {export default function CreateExperiencePage() {

        </p>

      </div>      }



      {error && (  const router = useRouter();  const router = useRouter();

        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">

          <p className="text-red-400">{error}</p>      if (formData.assetType === "message" && !formData.assetContent) {

        </div>

      )}        setError("Por favor, proporciona un mensaje de texto");  const [formData, setFormData] = useState<FormData>({  const [formData, setFormData] = useState<FormData>({



      <form onSubmit={handleSubmit} className="space-y-8">        return;

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Left Column - Basic Info */}      }    title: "",    title: "",

          <Card className="glass">

            <CardHeader>

              <CardTitle className="text-xl text-white">

                Información Básica      // Create the asset based on type    description: "",    description: "",

              </CardTitle>

              <CardDescription>      const asset = {

                Detalles generales de la experiencia

              </CardDescription>        name: formData.title || "Asset sin nombre", // Use title as asset name, with fallback    assetType: "image",    assetType: "image",

            </CardHeader>

            <CardContent className="space-y-6">        kind: formData.assetType,

              {/* Title */}

              <div>        url: formData.assetType !== "message" ? (formData.assetUrl || undefined) : undefined,  });  });

                <label className="block text-sm font-medium text-blue-200 mb-2">

                  Título *        text: formData.assetType === "message" ? formData.assetContent : undefined,

                </label>

                <input        mimeType: formData.file?.type,  const [isLoading, setIsLoading] = useState(false);  const [isLoading, setIsLoading] = useState(false);

                  type="text"

                  name="title"        fileSizeBytes: formData.file?.size,

                  value={formData.title}

                  onChange={handleInputChange}      };  const [error, setError] = useState<string | null>(null);  const [error, setError] = useState<string | null>(null);

                  required

                  className="w-full px-4 py-3 bg-gray-900/50 backdrop-blur-sm border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all duration-200 hover:border-gray-500/70"

                  placeholder="Ej: Mi primera experiencia AR"

                />      // Prepare experience data with assets array

              </div>

      const experienceData = {

              {/* Description */}

              <div>        title: formData.title,  const handleInputChange = (  const handleInputChange = (

                <label className="block text-sm font-medium text-blue-200 mb-2">

                  Descripción        description: formData.description,

                </label>

                <textarea        assets: [asset], // Backend expects an array of assets    e: React.ChangeEvent<    e: React.ChangeEvent<

                  name="description"

                  value={formData.description}      };

                  onChange={handleInputChange}

                  rows={4}      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement

                  className="w-full px-4 py-3 bg-gray-900/50 backdrop-blur-sm border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all duration-200 hover:border-gray-500/70 resize-none"

                  placeholder="Describe tu experiencia AR..."      console.log("Enviando datos al backend:", experienceData);

                />

              </div>    >    >



              {/* Asset Type */}      const response = await createExperience(experienceData);

              <div>

                <label className="block text-sm font-medium text-blue-200 mb-2">  ) => {  ) => {

                  Tipo de Contenido *

                </label>      if (response.success) {

                <select

                  name="assetType"        router.push("/experiences");    const { name, value } = e.target;    const { name, value } = e.target;

                  value={formData.assetType}

                  onChange={handleInputChange}      } else {

                  required

                  className="w-full px-4 py-3 bg-gray-900/50 backdrop-blur-sm border border-gray-600/50 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all duration-200 hover:border-gray-500/70"        setError(response.message || "Error creando la experiencia");    setFormData((prev) => ({ ...prev, [name]: value }));    setFormData((prev) => ({ ...prev, [name]: value }));

                >

                  <option value="image">Imagen</option>      }

                  <option value="video">Video</option>

                  <option value="model3d">Modelo 3D</option>    } catch (err) {  };  };

                  <option value="message">Mensaje de Texto</option>

                </select>      setError(err instanceof Error ? err.message : "Error inesperado");

              </div>

            </CardContent>    } finally {

          </Card>

      setIsLoading(false);

          {/* Right Column - Asset Content */}

          <Card className="glass">    }  const handleSubmit = async (e: React.FormEvent) => {  const handleSubmit = async (e: React.FormEvent) => {

            <CardHeader>

              <CardTitle className="text-xl text-white">  };

                Contenido del Asset

              </CardTitle>    e.preventDefault();    e.preventDefault();

              <CardDescription>

                Configura el contenido de tu experiencia  return (

              </CardDescription>

            </CardHeader>    <div className="container mx-auto px-4 py-8 max-w-4xl">    setIsLoading(true);    setIsLoading(true);

            <CardContent className="space-y-6">

              {/* Dynamic content based on asset type */}      {/* Header */}

              {formData.assetType === "message" ? (

                <div>      <div className="mb-8">    setError(null);    setError(null);

                  <label className="block text-sm font-medium text-blue-200 mb-2">

                    Mensaje de Texto *        <div className="flex items-center gap-4 mb-4">

                  </label>

                  <textarea          <Link href="/experiences">

                    name="assetContent"

                    value={formData.assetContent || ""}            <Button variant="ghost" size="sm">

                    onChange={handleInputChange}

                    rows={6}              ← Volver    try {    try {

                    required

                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors resize-none"            </Button>

                    placeholder="Escribe tu mensaje aquí..."

                  />          </Link>      // Validate that we have an asset      // Validate that we have an asset

                </div>

              ) : (        </div>

                <FileUpload

                  assetType={formData.assetType}        <h1 className="text-3xl font-bold text-white mb-2">      if (formData.assetType !== "message" && !formData.assetUrl) {      if (formData.assetType !== "message" && !formData.assetUrl) {

                  onUploadComplete={(result) => {

                    if (result.success && result.url) {          Crear Nueva Experiencia

                      setFormData((prev) => ({

                        ...prev,        </h1>        setError("Por favor, sube un archivo o proporciona una URL");        setError("Por favor, sube un archivo o proporciona una URL");

                        assetUrl: result.url,

                        file: undefined, // Clear file since it's uploaded        <p className="text-blue-200">

                      }));

                    } else {          Configura tu experiencia de realidad aumentada        return;        return;

                      setError(result.error || "Error subiendo archivo");

                    }        </p>

                  }}

                  onFileSelect={(file) => {      </div>      }      }

                    setFormData((prev) => ({ ...prev, file }));

                    setError(null); // Clear any previous errors

                  }}

                />      {error && (

              )}

        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">

              {/* URL Option for non-file assets */}

              {formData.assetType !== "message" && (          <p className="text-red-400">{error}</p>      if (formData.assetType === "message" && !formData.assetContent) {      // Prepare data based on asset type

                <div>

                  <label className="block text-sm font-medium text-blue-200 mb-2">        </div>

                    O proporciona una URL

                  </label>      )}        setError("Por favor, proporciona un mensaje de texto");      let experienceData = {

                  <input

                    type="url"

                    name="assetUrl"

                    value={formData.assetUrl || ""}      <form onSubmit={handleSubmit} className="space-y-8">        return;        title: formData.title,

                    onChange={handleInputChange}

                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    placeholder="https://ejemplo.com/archivo..."

                  />          {/* Left Column - Basic Info */}      }        description: formData.description,

                </div>

              )}          <Card className="glass">

            </CardContent>

          </Card>            <CardHeader>        assetType: formData.assetType,

        </div>

              <CardTitle className="text-xl text-white">

        {/* Actions */}

        <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t border-gray-600/30">                Información Básica      // Create the asset based on type        assetUrl: formData.assetUrl || "",

          <Link href="/experiences">

            <Button variant="ghost" className="w-full sm:w-auto">              </CardTitle>

              Cancelar

            </Button>              <CardDescription>      const asset = {        assetContent: formData.assetContent || "",

          </Link>

          <Button                Detalles generales de la experiencia

            type="submit"

            disabled={isLoading}              </CardDescription>        name: formData.title || "Asset sin nombre", // Use title as asset name, with fallback      };

            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"

          >            </CardHeader>

            {isLoading ? "Creando..." : "Crear Experiencia"}

          </Button>            <CardContent className="space-y-6">        kind: formData.assetType,

        </div>

      </form>              {/* Title */}

    </div>

  );              <div>        url: formData.assetType !== "message" ? (formData.assetUrl || undefined) : undefined,      const response = await createExperience(experienceData);

}
                <label className="block text-sm font-medium text-blue-200 mb-2">

                  Título *        text: formData.assetType === "message" ? formData.assetContent : undefined,

                </label>

                <input        mimeType: formData.file?.type,      if (response.success) {

                  type="text"

                  name="title"        fileSizeBytes: formData.file?.size,        router.push("/experiences");

                  value={formData.title}

                  onChange={handleInputChange}      };      } else {

                  required

                  className="w-full px-4 py-3 bg-gray-900/50 backdrop-blur-sm border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all duration-200 hover:border-gray-500/70"        setError(response.message || "Error creando la experiencia");

                  placeholder="Ej: Mi primera experiencia AR"

                />      // Prepare experience data with assets array      }

              </div>

      const experienceData = {    } catch (err) {

              {/* Description */}

              <div>        title: formData.title,      setError(err instanceof Error ? err.message : "Error inesperado");

                <label className="block text-sm font-medium text-blue-200 mb-2">

                  Descripción        description: formData.description,    } finally {

                </label>

                <textarea        assets: [asset], // Backend expects an array of assets      setIsLoading(false);

                  name="description"

                  value={formData.description}      };    }

                  onChange={handleInputChange}

                  rows={4}  };

                  className="w-full px-4 py-3 bg-gray-900/50 backdrop-blur-sm border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all duration-200 hover:border-gray-500/70 resize-none"

                  placeholder="Describe tu experiencia AR..."      console.log("Enviando datos al backend:", experienceData);

                />

              </div>  return (



              {/* Asset Type */}      const response = await createExperience(experienceData);    <div className="container mx-auto px-4 py-8 max-w-4xl">

              <div>

                <label className="block text-sm font-medium text-blue-200 mb-2">      {/* Header */}

                  Tipo de Contenido *

                </label>      if (response.success) {      <div className="mb-8">

                <select

                  name="assetType"        router.push("/experiences");        <div className="flex items-center gap-4 mb-4">

                  value={formData.assetType}

                  onChange={handleInputChange}      } else {          <Link href="/experiences">

                  required

                  className="w-full px-4 py-3 bg-gray-900/50 backdrop-blur-sm border border-gray-600/50 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all duration-200 hover:border-gray-500/70"        setError(response.message || "Error creando la experiencia");            <Button variant="ghost" size="sm">

                >

                  <option value="image">Imagen</option>      }              ← Volver

                  <option value="video">Video</option>

                  <option value="model3d">Modelo 3D</option>    } catch (err) {            </Button>

                  <option value="message">Mensaje de Texto</option>

                </select>      setError(err instanceof Error ? err.message : "Error inesperado");          </Link>

              </div>

            </CardContent>    } finally {        </div>

          </Card>

      setIsLoading(false);        <h1 className="text-3xl font-bold text-white mb-2">

          {/* Right Column - Asset Content */}

          <Card className="glass">    }          Crear Nueva Experiencia

            <CardHeader>

              <CardTitle className="text-xl text-white">  };        </h1>

                Contenido del Asset

              </CardTitle>        <p className="text-blue-200">

              <CardDescription>

                Configura el contenido de tu experiencia  return (          Configura tu experiencia de realidad aumentada

              </CardDescription>

            </CardHeader>    <div className="container mx-auto px-4 py-8 max-w-4xl">        </p>

            <CardContent className="space-y-6">

              {/* Dynamic content based on asset type */}      {/* Header */}      </div>

              {formData.assetType === "message" ? (

                <div>      <div className="mb-8">

                  <label className="block text-sm font-medium text-blue-200 mb-2">

                    Mensaje de Texto *        <div className="flex items-center gap-4 mb-4">      {error && (

                  </label>

                  <textarea          <Link href="/experiences">        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">

                    name="assetContent"

                    value={formData.assetContent || ""}            <Button variant="ghost" size="sm">          <p className="text-red-400">{error}</p>

                    onChange={handleInputChange}

                    rows={6}              ← Volver        </div>

                    required

                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors resize-none"            </Button>      )}

                    placeholder="Escribe tu mensaje aquí..."

                  />          </Link>

                </div>

              ) : (        </div>      <form onSubmit={handleSubmit} className="space-y-8">

                <FileUpload

                  assetType={formData.assetType}        <h1 className="text-3xl font-bold text-white mb-2">        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                  onUploadComplete={(result) => {

                    if (result.success && result.url) {          Crear Nueva Experiencia          {/* Left Column - Basic Info */}

                      setFormData((prev) => ({

                        ...prev,        </h1>          <Card className="glass">

                        assetUrl: result.url,

                        file: undefined, // Clear file since it's uploaded        <p className="text-blue-200">            <CardHeader>

                      }));

                    } else {          Configura tu experiencia de realidad aumentada              <CardTitle className="text-xl text-white">

                      setError(result.error || "Error subiendo archivo");

                    }        </p>                Información Básica

                  }}

                  onFileSelect={(file) => {      </div>              </CardTitle>

                    setFormData((prev) => ({ ...prev, file }));

                    setError(null); // Clear any previous errors              <CardDescription>

                  }}

                />      {error && (                Detalles generales de la experiencia

              )}

        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">              </CardDescription>

              {/* URL Option for non-file assets */}

              {formData.assetType !== "message" && (          <p className="text-red-400">{error}</p>            </CardHeader>

                <div>

                  <label className="block text-sm font-medium text-blue-200 mb-2">        </div>            <CardContent className="space-y-6">

                    O proporciona una URL

                  </label>      )}              {/* Title */}

                  <input

                    type="url"              <div>

                    name="assetUrl"

                    value={formData.assetUrl || ""}      <form onSubmit={handleSubmit} className="space-y-8">                <label className="block text-sm font-medium text-blue-200 mb-2">

                    onChange={handleInputChange}

                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">                  Título *

                    placeholder="https://ejemplo.com/archivo..."

                  />          {/* Left Column - Basic Info */}                </label>

                </div>

              )}          <Card className="glass">                <input

            </CardContent>

          </Card>            <CardHeader>                  type="text"

        </div>

              <CardTitle className="text-xl text-white">                  name="title"

        {/* Actions */}

        <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t border-gray-600/30">                Información Básica                  value={formData.title}

          <Link href="/experiences">

            <Button variant="ghost" className="w-full sm:w-auto">              </CardTitle>                  onChange={handleInputChange}

              Cancelar

            </Button>              <CardDescription>                  required

          </Link>

          <Button                Detalles generales de la experiencia                  className="w-full px-4 py-3 bg-gray-900/50 backdrop-blur-sm border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all duration-200 hover:border-gray-500/70"

            type="submit"

            disabled={isLoading}              </CardDescription>                  placeholder="Ej: Mi primera experiencia AR"

            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"

          >            </CardHeader>                />

            {isLoading ? "Creando..." : "Crear Experiencia"}

          </Button>            <CardContent className="space-y-6">              </div>

        </div>

      </form>              {/* Title */}

    </div>

  );              <div>              {/* Description */}

}
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