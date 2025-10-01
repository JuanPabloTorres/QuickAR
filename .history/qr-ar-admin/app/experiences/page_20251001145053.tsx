"use client";"use client";"use client";



import React, { useEffect, useState, useMemo } from "react";

import Link from "next/link";

import { motion, AnimatePresence } from "framer-motion";import React, { useEffect, useState, useMemo } from "react";import React, { useEffect, useState, useMemo } from "react";

import { 

  Plus, import Link from "next/link";import Link from "next/link";

  Grid,

  List,import { motion, AnimatePresence } from "framer-motion";import { motion, AnimatePresence } from "framer-motion";

  Sparkles

} from "lucide-react";import { import { 



import { PageHeader } from "@/components/page-header";  Plus,   Plus, 

import { AnimatedCardGrid } from "@/components/ui/animated-card";

import { AnimatedButton, FloatingActionButton } from "@/components/ui/animated-button";  Search,   Search, 

import { SearchFilterBar } from "@/components/ui/search-filter-bar";

import { ExperienceCard, ExperienceListItem } from "@/components/experience-components";  Filter,   Filter, 

import { Card, CardContent } from "@/components/ui/card";

import { Button } from "@/components/ui/button";  Eye,   Eye, 

import { Loader } from "@/components/ui/loader";

import { Alert, AlertDescription } from "@/components/ui/alert";  Edit,   Edit, 

import { apiClient } from "@/lib/api";

import { ExperienceDto } from "@/types";  Trash2,   Trash2, 



export default function ExperiencesPage() {  Play,   Play, 

  const [experiences, setExperiences] = useState<ExperienceDto[]>([]);

  const [loading, setLoading] = useState(true);  Pause,   Pause, 

  const [error, setError] = useState<string | null>(null);

  const [searchValue, setSearchValue] = useState("");  Calendar,  Calendar,

  const [sortBy, setSortBy] = useState("createdAt");

  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");  Package,  Package,

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [filterActive, setFilterActive] = useState<boolean | null>(null);  Sparkles,  Sparkles,



  useEffect(() => {  Grid,  Grid,

    loadExperiences();

  }, []);  List,  List,



  const loadExperiences = async () => {  SortAsc,  SortAsc,

    try {

      setLoading(true);  SortDesc  SortDesc

      setError(null);

      const response = await apiClient.getExperiences();} from "lucide-react";} from "lucide-react";



      if (response.success && response.data) {

        setExperiences(response.data);

      } else {import { PageHeader } from "@/components/page-header";import { PageHeader } from "@/components/page-header";

        setError(response.message || "Error al cargar las experiencias");

      }import { AnimatedCard, AnimatedCardGrid } from "@/components/ui/animated-card";import { AnimatedCard, AnimatedCardGrid } from "@/components/ui/animated-card";

    } catch (err) {

      setError("Error de conexión");import { AnimatedButton, FloatingActionButton } from "@/components/ui/animated-button";import { AnimatedButton, FloatingActionButton } from "@/components/ui/animated-button";

    } finally {

      setLoading(false);import { SearchFilterBar } from "@/components/ui/search-filter-bar";import { SearchFilterBar } from "@/components/ui/search-filter-bar";

    }

  };import { StatusBadge, ToggleStatus } from "@/components/ui/status-badge";import { StatusBadge, ToggleStatus } from "@/components/ui/status-badge";



  const filteredAndSortedExperiences = useMemo(() => {import { ExperienceCard, ExperienceListItem } from "@/components/experience-components";import { ExperienceCard, ExperienceListItem } from "@/components/experience-components";

    let filtered = experiences;

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

    // Apply search filter

    if (searchValue) {import { Button } from "@/components/ui/button";import { Button } from "@/components/ui/button";

      filtered = filtered.filter(exp => 

        exp.title.toLowerCase().includes(searchValue.toLowerCase()) ||import { Loader } from "@/components/ui/loader";import { Loader } from "@/components/ui/loader";

        exp.description?.toLowerCase().includes(searchValue.toLowerCase()) ||

        exp.slug.toLowerCase().includes(searchValue.toLowerCase())import { Alert, AlertDescription } from "@/components/ui/alert";import { Alert, AlertDescription } from "@/components/ui/alert";

      );

    }import { apiClient } from "@/lib/api";import { apiClient } from "@/lib/api";



    // Apply status filterimport { formatDate, truncateText } from "@/lib/utils";import { formatDate, truncateText } from "@/lib/utils";

    if (filterActive !== null) {

      filtered = filtered.filter(exp => exp.isActive === filterActive);import { ExperienceDto } from "@/types";import { ExperienceDto } from "@/types";

    }



    // Apply sorting

    filtered.sort((a, b) => {export default function ExperiencesPage() {export default function ExperiencesPage() {

      let aValue: any = a[sortBy as keyof ExperienceDto];

      let bValue: any = b[sortBy as keyof ExperienceDto];  const [experiences, setExperiences] = useState<ExperienceDto[]>([]);  const [experiences, setExperiences] = useState<ExperienceDto[]>([]);



      if (sortBy === "assets") {  const [loading, setLoading] = useState(true);  const [loading, setLoading] = useState(true);

        aValue = a.assets.length;

        bValue = b.assets.length;  const [error, setError] = useState<string | null>(null);  const [error, setError] = useState<string | null>(null);

      }

  const [searchValue, setSearchValue] = useState("");  const [searchValue, setSearchValue] = useState("");

      if (typeof aValue === "string") {

        aValue = aValue.toLowerCase();  const [sortBy, setSortBy] = useState("createdAt");  const [sortBy, setSortBy] = useState("createdAt");

        bValue = bValue.toLowerCase();

      }  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");



      if (sortOrder === "asc") {  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

        return aValue > bValue ? 1 : -1;

      } else {  const [filterActive, setFilterActive] = useState<boolean | null>(null);  const [filterActive, setFilterActive] = useState<boolean | null>(null);

        return aValue < bValue ? 1 : -1;

      }

    });

  useEffect(() => {  useEffect(() => {

    return filtered;

  }, [experiences, searchValue, sortBy, sortOrder, filterActive]);    loadExperiences();    loadExperiences();



  const handleToggleActive = async (id: string) => {  }, []);  }, []);

    try {

      const response = await apiClient.toggleExperienceActive(id);

      if (response.success) {

        setExperiences(prev =>   const loadExperiences = async () => {  const loadExperiences = async () => {

          prev.map(exp => 

            exp.id === id ? { ...exp, isActive: !exp.isActive } : exp    try {    try {

          )

        );      setLoading(true);      setLoading(true);

      } else {

        setError(response.message || "Error al cambiar el estado");      setError(null);      setError(null);

      }

    } catch (err) {      const response = await apiClient.getExperiences();      const response = await apiClient.getExperiences();

      setError("Error al cambiar el estado de la experiencia");

    }

  };

      if (response.success && response.data) {      if (response.success && response.data) {

  const handleDelete = async (id: string, title: string) => {

    if (!confirm(`¿Estás seguro de que quieres eliminar la experiencia "${title}"?`)) {        setExperiences(response.data);        setExperiences(response.data);

      return;

    }      } else {      } else {



    try {        setError(response.message || "Error al cargar las experiencias");        setError(response.message || "Error al cargar las experiencias");

      const response = await apiClient.deleteExperience(id);

      if (response.success) {      }      }

        setExperiences(prev => prev.filter(exp => exp.id !== id));

      } else {    } catch (err) {    } catch (err) {

        setError(response.message || "Error al eliminar la experiencia");

      }      setError("Error de conexión");      setError("Error de conexión");

    } catch (err) {

      setError("Error al eliminar la experiencia");    } finally {    } finally {

    }

  };      setLoading(false);      setLoading(false);



  const filters = [    }    }

    {

      key: "active",  };  };

      label: "Activas",

      active: filterActive === true,

      count: experiences.filter(e => e.isActive).length,

    },  const filteredAndSortedExperiences = useMemo(() => {  const filteredAndSortedExperiences = useMemo(() => {

    {

      key: "inactive",     let filtered = experiences;    let filtered = experiences;

      label: "Inactivas",

      active: filterActive === false,

      count: experiences.filter(e => !e.isActive).length,

    },    // Apply search filter    // Apply search filter

  ];

    if (searchValue) {    if (searchValue) {

  const handleFilterToggle = (key: string) => {

    if (key === "active") {      filtered = filtered.filter(exp =>       filtered = filtered.filter(exp => 

      setFilterActive(filterActive === true ? null : true);

    } else if (key === "inactive") {        exp.title.toLowerCase().includes(searchValue.toLowerCase()) ||        exp.title.toLowerCase().includes(searchValue.toLowerCase()) ||

      setFilterActive(filterActive === false ? null : false);

    }        exp.description?.toLowerCase().includes(searchValue.toLowerCase()) ||        exp.description?.toLowerCase().includes(searchValue.toLowerCase()) ||

  };

        exp.slug.toLowerCase().includes(searchValue.toLowerCase())        exp.slug.toLowerCase().includes(searchValue.toLowerCase())

  if (loading) {

    return (      );      );

      <motion.div 

        className="flex items-center justify-center min-h-[400px]"    }    }

        initial={{ opacity: 0 }}

        animate={{ opacity: 1 }}

        transition={{ duration: 0.5 }}

      >    // Apply status filter    // Apply status filter

        <div className="text-center space-y-4">

          <motion.div    if (filterActive !== null) {    if (filterActive !== null) {

            animate={{ rotate: 360 }}

            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}      filtered = filtered.filter(exp => exp.isActive === filterActive);      filtered = filtered.filter(exp => exp.isActive === filterActive);

          >

            <Loader size="lg" />    }    }

          </motion.div>

          <p className="text-gray-400">Cargando experiencias...</p>

        </div>

      </motion.div>    // Apply sorting    // Apply sorting

    );

  }    filtered.sort((a, b) => {    filtered.sort((a, b) => {



  return (      let aValue: any = a[sortBy as keyof ExperienceDto];      let aValue: any = a[sortBy as keyof ExperienceDto];

    <motion.div

      initial={{ opacity: 0, y: 20 }}      let bValue: any = b[sortBy as keyof ExperienceDto];      let bValue: any = b[sortBy as keyof ExperienceDto];

      animate={{ opacity: 1, y: 0 }}

      transition={{ duration: 0.5 }}

    >

      <motion.div      if (sortBy === "assets") {      if (sortBy === "assets") {

        initial={{ opacity: 0, y: -20 }}

        animate={{ opacity: 1, y: 0 }}        aValue = a.assets.length;        aValue = a.assets.length;

        transition={{ duration: 0.5, delay: 0.1 }}

      >        bValue = b.assets.length;        bValue = b.assets.length;

        <PageHeader

          title="Experiencias AR"      }      }

          description="Gestiona tus experiencias de realidad aumentada"

          action={

            <div className="flex items-center space-x-3">

              {/* View Mode Toggle */}      if (typeof aValue === "string") {      if (typeof aValue === "string") {

              <div className="flex items-center border border-slate-700/50 rounded-lg p-1 bg-slate-800/30">

                <Button        aValue = aValue.toLowerCase();        aValue = aValue.toLowerCase();

                  variant={viewMode === "grid" ? "default" : "ghost"}

                  size="sm"        bValue = bValue.toLowerCase();        bValue = bValue.toLowerCase();

                  onClick={() => setViewMode("grid")}

                  className="px-3"      }      }

                >

                  <Grid className="w-4 h-4" />

                </Button>

                <Button      if (sortOrder === "asc") {      if (sortOrder === "asc") {

                  variant={viewMode === "list" ? "default" : "ghost"}

                  size="sm"        return aValue > bValue ? 1 : -1;        return aValue > bValue ? 1 : -1;

                  onClick={() => setViewMode("list")}

                  className="px-3"      } else {      } else {

                >

                  <List className="w-4 h-4" />        return aValue < bValue ? 1 : -1;        return aValue < bValue ? 1 : -1;

                </Button>

              </div>      }      }



              <Link href="/experiences/new">    });    });

                <AnimatedButton

                  icon={<Plus className="w-4 h-4" />}

                  pulse

                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"    return filtered;    return filtered;

                >

                  Nueva Experiencia  }, [experiences, searchValue, sortBy, sortOrder, filterActive]);  }, [experiences, searchValue, sortBy, sortOrder, filterActive]);

                </AnimatedButton>

              </Link>

            </div>

          }  const handleToggleActive = async (id: string) => {  const handleToggleActive = async (id: string) => {

        />

      </motion.div>    try {    try {



      {/* Search and Filters */}      const response = await apiClient.toggleExperienceActive(id);      const response = await apiClient.toggleExperienceActive(id);

      <motion.div

        initial={{ opacity: 0, y: 20 }}      if (response.success) {      if (response.success) {

        animate={{ opacity: 1, y: 0 }}

        transition={{ duration: 0.5, delay: 0.2 }}        setExperiences(prev =>         setExperiences(prev => 

        className="mb-8"

      >          prev.map(exp =>           prev.map(exp => 

        <SearchFilterBar

          searchValue={searchValue}            exp.id === id ? { ...exp, isActive: !exp.isActive } : exp            exp.id === id ? { ...exp, isActive: !exp.isActive } : exp

          onSearchChange={setSearchValue}

          sortBy={sortBy}          )          )

          sortOrder={sortOrder}

          onSortChange={setSortBy}        );        );

          filters={filters}

          onFilterToggle={handleFilterToggle}      } else {      } else {

          placeholder="Buscar experiencias..."

        />        setError(response.message || "Error al cambiar el estado");        setError(response.message || "Error al cambiar el estado");

      </motion.div>

      }      }

      {error && (

        <motion.div    } catch (err) {    } catch (err) {

          initial={{ opacity: 0, scale: 0.95 }}

          animate={{ opacity: 1, scale: 1 }}      setError("Error al cambiar el estado de la experiencia");      setError("Error al cambiar el estado de la experiencia");

          className="mb-6"

        >    }    }

          <Alert variant="destructive">

            <AlertDescription>{error}</AlertDescription>  };  };

          </Alert>

        </motion.div>

      )}

  const handleDelete = async (id: string, title: string) => {  const handleDelete = async (id: string, title: string) => {

      {/* Results Stats */}

      <motion.div    if (!confirm(`¿Estás seguro de que quieres eliminar la experiencia "${title}"?`)) {    if (!confirm(`¿Estás seguro de que quieres eliminar la experiencia "${title}"?`)) {

        initial={{ opacity: 0 }}

        animate={{ opacity: 1 }}      return;      return;

        transition={{ duration: 0.5, delay: 0.3 }}

        className="mb-6"    }    }

      >

        <div className="flex items-center justify-between text-sm text-gray-400">

          <span>

            {filteredAndSortedExperiences.length} de {experiences.length} experiencias    try {    try {

          </span>

          <span>      const response = await apiClient.deleteExperience(id);      const response = await apiClient.deleteExperience(id);

            Ordenar por {sortBy === "createdAt" ? "fecha de creación" : sortBy} 

            {sortOrder === "desc" ? " (descendente)" : " (ascendente)"}      if (response.success) {      if (response.success) {

          </span>

        </div>        setExperiences(prev => prev.filter(exp => exp.id !== id));        setExperiences(prev => prev.filter(exp => exp.id !== id));

      </motion.div>

      } else {      } else {

      {/* Content */}

      <AnimatePresence mode="wait">        setError(response.message || "Error al eliminar la experiencia");        setError(response.message || "Error al eliminar la experiencia");

        {filteredAndSortedExperiences.length === 0 ? (

          <motion.div      }      }

            key="empty-state"

            initial={{ opacity: 0, scale: 0.95 }}    } catch (err) {    } catch (err) {

            animate={{ opacity: 1, scale: 1 }}

            exit={{ opacity: 0, scale: 0.95 }}      setError("Error al eliminar la experiencia");      setError("Error al eliminar la experiencia");

            transition={{ duration: 0.5 }}

          >    }    }

            <Card className="border-dashed border-slate-600">

              <CardContent className="text-center py-16">  };  };

                <motion.div

                  initial={{ scale: 0 }}

                  animate={{ scale: 1 }}

                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}  const filters = [  const filters = [

                  className="text-8xl mb-6"

                >    {    {

                  ✨

                </motion.div>      key: "active",      key: "active",

                <motion.h3

                  initial={{ opacity: 0, y: 20 }}      label: "Activas",      label: "Activas",

                  animate={{ opacity: 1, y: 0 }}

                  transition={{ delay: 0.3 }}      active: filterActive === true,      active: filterActive === true,

                  className="text-2xl font-semibold text-white mb-3"

                >      count: experiences.filter(e => e.isActive).length,      count: experiences.filter(e => e.isActive).length,

                  {searchValue || filterActive !== null ? "No se encontraron experiencias" : "No hay experiencias aún"}

                </motion.h3>    },    },

                <motion.p

                  initial={{ opacity: 0, y: 20 }}    {    {

                  animate={{ opacity: 1, y: 0 }}

                  transition={{ delay: 0.4 }}      key: "inactive",       key: "inactive", 

                  className="text-blue-200 mb-8 max-w-md mx-auto"

                >      label: "Inactivas",      label: "Inactivas",

                  {searchValue || filterActive !== null 

                    ? "Intenta ajustar tus filtros de búsqueda"      active: filterActive === false,      active: filterActive === false,

                    : "Crea tu primera experiencia AR para comenzar a transformar la realidad"

                  }      count: experiences.filter(e => !e.isActive).length,      count: experiences.filter(e => !e.isActive).length,

                </motion.p>

                {!searchValue && filterActive === null && (    },    },

                  <motion.div

                    initial={{ opacity: 0, y: 20 }}  ];  ];

                    animate={{ opacity: 1, y: 0 }}

                    transition={{ delay: 0.5 }}

                  >

                    <Link href="/experiences/new">  const handleFilterToggle = (key: string) => {  const handleFilterToggle = (key: string) => {

                      <AnimatedButton

                        icon={<Sparkles className="w-5 h-5" />}    if (key === "active") {    if (key === "active") {

                        pulse

                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-8 py-3"      setFilterActive(filterActive === true ? null : true);      setFilterActive(filterActive === true ? null : true);

                      >

                        Crear Primera Experiencia    } else if (key === "inactive") {    } else if (key === "inactive") {

                      </AnimatedButton>

                    </Link>      setFilterActive(filterActive === false ? null : false);      setFilterActive(filterActive === false ? null : false);

                  </motion.div>

                )}    }    }

              </CardContent>

            </Card>  };  };

          </motion.div>

        ) : (

          <motion.div

            key="experiences-list"  if (loading) {  if (loading) {

            initial={{ opacity: 0 }}

            animate={{ opacity: 1 }}    return (    return (

            exit={{ opacity: 0 }}

            transition={{ duration: 0.5 }}      <motion.div       <motion.div 

          >

            {viewMode === "grid" ? (        className="flex items-center justify-center min-h-[400px]"        className="flex items-center justify-center min-h-[400px]"

              <AnimatedCardGrid 

                className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"        initial={{ opacity: 0 }}        initial={{ opacity: 0 }}

                stagger

              >        animate={{ opacity: 1 }}        animate={{ opacity: 1 }}

                {filteredAndSortedExperiences.map((experience, index) => (

                  <ExperienceCard        transition={{ duration: 0.5 }}        transition={{ duration: 0.5 }}

                    key={experience.id}

                    experience={experience}      >      >

                    index={index}

                    onToggleActive={handleToggleActive}        <div className="text-center space-y-4">        <div className="text-center space-y-4">

                    onDelete={handleDelete}

                  />          <motion.div          <motion.div

                ))}

              </AnimatedCardGrid>            animate={{ rotate: 360 }}            animate={{ rotate: 360 }}

            ) : (

              <div className="space-y-4">            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}

                {filteredAndSortedExperiences.map((experience, index) => (

                  <ExperienceListItem          >          >

                    key={experience.id}

                    experience={experience}            <Loader size="lg" />            <Loader size="lg" />

                    index={index}

                    onToggleActive={handleToggleActive}          </motion.div>          </motion.div>

                    onDelete={handleDelete}

                  />          <p className="text-gray-400">Cargando experiencias...</p>          <p className="text-gray-400">Cargando experiencias...</p>

                ))}

              </div>        </div>        </div>

            )}

          </motion.div>      </motion.div>      </motion.div>

        )}

      </AnimatePresence>    );    );



      {/* Floating Action Button */}  }  }

      <FloatingActionButton>

        <Link href="/experiences/new">

          <Plus className="w-6 h-6" />

        </Link>  return (  return (

      </FloatingActionButton>

    </motion.div>    <motion.div    <motion.div

  );

}      initial={{ opacity: 0, y: 20 }}      initial={{ opacity: 0, y: 20 }}

      animate={{ opacity: 1, y: 0 }}      animate={{ opacity: 1, y: 0 }}

      transition={{ duration: 0.5 }}      transition={{ duration: 0.5 }}

    >    >

      <motion.div      <motion.div

        initial={{ opacity: 0, y: -20 }}        initial={{ opacity: 0, y: -20 }}

        animate={{ opacity: 1, y: 0 }}        animate={{ opacity: 1, y: 0 }}

        transition={{ duration: 0.5, delay: 0.1 }}        transition={{ duration: 0.5, delay: 0.1 }}

      >      >

        <PageHeader        <PageHeader

          title="Experiencias AR"          title="Experiencias AR"

          description="Gestiona tus experiencias de realidad aumentada"          description="Gestiona tus experiencias de realidad aumentada"

          action={          action={

            <div className="flex items-center space-x-3">            <div className="flex items-center space-x-3">

              {/* View Mode Toggle */}              {/* View Mode Toggle */}

              <div className="flex items-center border border-slate-700/50 rounded-lg p-1 bg-slate-800/30">              <div className="flex items-center border border-slate-700/50 rounded-lg p-1 bg-slate-800/30">

                <Button                <Button

                  variant={viewMode === "grid" ? "default" : "ghost"}                  variant={viewMode === "grid" ? "default" : "ghost"}

                  size="sm"                  size="sm"

                  onClick={() => setViewMode("grid")}                  onClick={() => setViewMode("grid")}

                  className="px-3"                  className="px-3"

                >                >

                  <Grid className="w-4 h-4" />                  <Grid className="w-4 h-4" />

                </Button>                </Button>

                <Button                <Button

                  variant={viewMode === "list" ? "default" : "ghost"}                  variant={viewMode === "list" ? "default" : "ghost"}

                  size="sm"                  size="sm"

                  onClick={() => setViewMode("list")}                  onClick={() => setViewMode("list")}

                  className="px-3"                  className="px-3"

                >                >

                  <List className="w-4 h-4" />                  <List className="w-4 h-4" />

                </Button>                </Button>

              </div>              </div>



              <Link href="/experiences/new">              <Link href="/experiences/new">

                <AnimatedButton                <AnimatedButton

                  icon={<Plus className="w-4 h-4" />}                  icon={<Plus className="w-4 h-4" />}

                  pulse                  pulse

                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"

                >                >

                  Nueva Experiencia                  Nueva Experiencia

                </AnimatedButton>                </AnimatedButton>

              </Link>              </Link>

            </div>            </div>

          }          }

        />        />

      </motion.div>      </motion.div>



      {/* Search and Filters */}      {/* Search and Filters */}

      <motion.div      <motion.div

        initial={{ opacity: 0, y: 20 }}        initial={{ opacity: 0, y: 20 }}

        animate={{ opacity: 1, y: 0 }}        animate={{ opacity: 1, y: 0 }}

        transition={{ duration: 0.5, delay: 0.2 }}        transition={{ duration: 0.5, delay: 0.2 }}

        className="mb-8"        className="mb-8"

      >      >

        <SearchFilterBar        <SearchFilterBar

          searchValue={searchValue}          searchValue={searchValue}

          onSearchChange={setSearchValue}          onSearchChange={setSearchValue}

          sortBy={sortBy}          sortBy={sortBy}

          sortOrder={sortOrder}          sortOrder={sortOrder}

          onSortChange={setSortBy}          onSortChange={setSortBy}

          filters={filters}          filters={filters}

          onFilterToggle={handleFilterToggle}          onFilterToggle={handleFilterToggle}

          placeholder="Buscar experiencias..."          placeholder="Buscar experiencias..."

        />        />

      </motion.div>      </motion.div>



      {error && (      {error && (

        <motion.div        <motion.div

          initial={{ opacity: 0, scale: 0.95 }}          initial={{ opacity: 0, scale: 0.95 }}

          animate={{ opacity: 1, scale: 1 }}          animate={{ opacity: 1, scale: 1 }}

          className="mb-6"          className="mb-6"

        >        >

          <Alert variant="destructive">          <Alert variant="destructive">

            <AlertDescription>{error}</AlertDescription>            <AlertDescription>{error}</AlertDescription>

          </Alert>          </Alert>

        </motion.div>        </motion.div>

      )}      )}



      {/* Results Stats */}      {/* Results Stats */}

      <motion.div      <motion.div

        initial={{ opacity: 0 }}        initial={{ opacity: 0 }}

        animate={{ opacity: 1 }}        animate={{ opacity: 1 }}

        transition={{ duration: 0.5, delay: 0.3 }}        transition={{ duration: 0.5, delay: 0.3 }}

        className="mb-6"        className="mb-6"

      >      >

        <div className="flex items-center justify-between text-sm text-gray-400">        <div className="flex items-center justify-between text-sm text-gray-400">

          <span>          <span>

            {filteredAndSortedExperiences.length} de {experiences.length} experiencias            {filteredAndSortedExperiences.length} de {experiences.length} experiencias

          </span>          </span>

          <span>          <span>

            Ordenar por {sortBy === "createdAt" ? "fecha de creación" : sortBy}             Ordenar por {sortBy === "createdAt" ? "fecha de creación" : sortBy} 

            {sortOrder === "desc" ? " (descendente)" : " (ascendente)"}            {sortOrder === "desc" ? " (descendente)" : " (ascendente)"}

          </span>          </span>

        </div>        </div>

      </motion.div>      </motion.div>



      {/* Content */}      {/* Content */}

      <AnimatePresence mode="wait">      <AnimatePresence mode="wait">

        {filteredAndSortedExperiences.length === 0 ? (        {filteredAndSortedExperiences.length === 0 ? (

          <motion.div          <motion.div

            key="empty-state"            key="empty-state"

            initial={{ opacity: 0, scale: 0.95 }}            initial={{ opacity: 0, scale: 0.95 }}

            animate={{ opacity: 1, scale: 1 }}            animate={{ opacity: 1, scale: 1 }}

            exit={{ opacity: 0, scale: 0.95 }}            exit={{ opacity: 0, scale: 0.95 }}

            transition={{ duration: 0.5 }}            transition={{ duration: 0.5 }}

          >          >

            <Card className="border-dashed border-slate-600">            <Card className="border-dashed border-slate-600">

              <CardContent className="text-center py-16">              <CardContent className="text-center py-16">

                <motion.div                <motion.div

                  initial={{ scale: 0 }}                  initial={{ scale: 0 }}

                  animate={{ scale: 1 }}                  animate={{ scale: 1 }}

                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}

                  className="text-8xl mb-6"                  className="text-8xl mb-6"

                >                >

                  ✨                  ✨

                </motion.div>                </motion.div>

                <motion.h3                <motion.h3

                  initial={{ opacity: 0, y: 20 }}                  initial={{ opacity: 0, y: 20 }}

                  animate={{ opacity: 1, y: 0 }}                  animate={{ opacity: 1, y: 0 }}

                  transition={{ delay: 0.3 }}                  transition={{ delay: 0.3 }}

                  className="text-2xl font-semibold text-white mb-3"                  className="text-2xl font-semibold text-white mb-3"

                >                >

                  {searchValue || filterActive !== null ? "No se encontraron experiencias" : "No hay experiencias aún"}                  {searchValue || filterActive !== null ? "No se encontraron experiencias" : "No hay experiencias aún"}

                </motion.h3>                </motion.h3>

                <motion.p                <motion.p

                  initial={{ opacity: 0, y: 20 }}                  initial={{ opacity: 0, y: 20 }}

                  animate={{ opacity: 1, y: 0 }}                  animate={{ opacity: 1, y: 0 }}

                  transition={{ delay: 0.4 }}                  transition={{ delay: 0.4 }}

                  className="text-blue-200 mb-8 max-w-md mx-auto"                  className="text-blue-200 mb-8 max-w-md mx-auto"

                >                >

                  {searchValue || filterActive !== null                   {searchValue || filterActive !== null 

                    ? "Intenta ajustar tus filtros de búsqueda"                    ? "Intenta ajustar tus filtros de búsqueda"

                    : "Crea tu primera experiencia AR para comenzar a transformar la realidad"                    : "Crea tu primera experiencia AR para comenzar a transformar la realidad"

                  }                  }

                </motion.p>                </motion.p>

                {!searchValue && filterActive === null && (                {!searchValue && filterActive === null && (

                  <motion.div                  <motion.div

                    initial={{ opacity: 0, y: 20 }}                    initial={{ opacity: 0, y: 20 }}

                    animate={{ opacity: 1, y: 0 }}                    animate={{ opacity: 1, y: 0 }}

                    transition={{ delay: 0.5 }}                    transition={{ delay: 0.5 }}

                  >                  >

                    <Link href="/experiences/new">                    <Link href="/experiences/new">

                      <AnimatedButton                      <AnimatedButton

                        icon={<Sparkles className="w-5 h-5" />}                        icon={<Sparkles className="w-5 h-5" />}

                        pulse                        pulse

                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-8 py-3"                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-8 py-3"

                      >                      >

                        Crear Primera Experiencia                        Crear Primera Experiencia

                      </AnimatedButton>                      </AnimatedButton>

                    </Link>                    </Link>

                  </motion.div>                  </motion.div>

                )}                )}

              </CardContent>              </CardContent>

            </Card>            </Card>

          </motion.div>          </motion.div>

        ) : (        ) : (

          <motion.div          <motion.div

            key="experiences-list"            key="experiences-list"

            initial={{ opacity: 0 }}            initial={{ opacity: 0 }}

            animate={{ opacity: 1 }}            animate={{ opacity: 1 }}

            exit={{ opacity: 0 }}            exit={{ opacity: 0 }}

            transition={{ duration: 0.5 }}            transition={{ duration: 0.5 }}

          >          >

            {viewMode === "grid" ? (            {viewMode === "grid" ? (

              <AnimatedCardGrid               <AnimatedCardGrid 

                className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"                className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"

                stagger                stagger

              >              >

                {filteredAndSortedExperiences.map((experience, index) => (                {filteredAndSortedExperiences.map((experience, index) => (

                  <ExperienceCard                  <ExperienceCard

                    key={experience.id}                    key={experience.id}

                    experience={experience}                    experience={experience}

                    index={index}                    index={index}

                    onToggleActive={handleToggleActive}                    onToggleActive={handleToggleActive}

                    onDelete={handleDelete}                    onDelete={handleDelete}

                  />                  />

                ))}                ))}

              </AnimatedCardGrid>              </AnimatedCardGrid>

            ) : (            ) : (

              <div className="space-y-4">              <div className="space-y-4">

                {filteredAndSortedExperiences.map((experience, index) => (                {filteredAndSortedExperiences.map((experience, index) => (

                  <ExperienceListItem                  <ExperienceListItem

                    key={experience.id}                    key={experience.id}

                    experience={experience}                    experience={experience}

                    index={index}                    index={index}

                    onToggleActive={handleToggleActive}                    onToggleActive={handleToggleActive}

                    onDelete={handleDelete}                    onDelete={handleDelete}

                  />                  />

                ))}                ))}

              </div>              </div>

            )}            )}

          </motion.div>          </motion.div>

        )}        )}

      </AnimatePresence>      </AnimatePresence>



      {/* Floating Action Button */}      {/* Floating Action Button */}

      <FloatingActionButton>      <FloatingActionButton>

        <Link href="/experiences/new">        <Link href="/experiences/new">

          <Plus className="w-6 h-6" />          <Plus className="w-6 h-6" />

        </Link>        </Link>

      </FloatingActionButton>      </FloatingActionButton>

    </motion.div>    </motion.div>

  );  );

}}