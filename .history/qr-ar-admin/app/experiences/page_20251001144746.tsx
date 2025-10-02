"use client";"use client";



import React, { useEffect, useState, useMemo } from "react";import React, { useEffect, useState, useMemo } from "react";

import Link from "next/link";import Link from "next/link";

import { motion, AnimatePresence } from "framer-motion";import { motion, AnimatePresence } from "framer-motion";

import { import { 

  Plus,   Plus, 

  Search,   Search, 

  Filter,   Filter, 

  Eye,   Eye, 

  Edit,   Edit, 

  Trash2,   Trash2, 

  Play,   Play, 

  Pause,   Pause, 

  Calendar,  Calendar,

  Package,  Package,

  Sparkles,  Sparkles,

  Grid,  Grid,

  List,  List,

  SortAsc,  SortAsc,

  SortDesc  SortDesc

} from "lucide-react";} from "lucide-react";



import { PageHeader } from "@/components/page-header";import { PageHeader } from "@/components/page-header";

import { AnimatedCard, AnimatedCardGrid } from "@/components/ui/animated-card";import { AnimatedCard, AnimatedCardGrid } from "@/components/ui/animated-card";

import { AnimatedButton, FloatingActionButton } from "@/components/ui/animated-button";import { AnimatedButton, FloatingActionButton } from "@/components/ui/animated-button";

import { SearchFilterBar } from "@/components/ui/search-filter-bar";import { SearchFilterBar } from "@/components/ui/search-filter-bar";

import { StatusBadge, ToggleStatus } from "@/components/ui/status-badge";import { StatusBadge, ToggleStatus } from "@/components/ui/status-badge";

import { ExperienceCard, ExperienceListItem } from "@/components/experience-components";import { ExperienceCard, ExperienceListItem } from "@/components/experience-components";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { Button } from "@/components/ui/button";import { Button } from "@/components/ui/button";

import { Loader } from "@/components/ui/loader";import { Loader } from "@/components/ui/loader";

import { Alert, AlertDescription } from "@/components/ui/alert";import { Alert, AlertDescription } from "@/components/ui/alert";

import { apiClient } from "@/lib/api";import { apiClient } from "@/lib/api";

import { formatDate, truncateText } from "@/lib/utils";import { formatDate, truncateText } from "@/lib/utils";

import { ExperienceDto } from "@/types";import { ExperienceDto } from "@/types";



export default function ExperiencesPage() {export default function ExperiencesPage() {

  const [experiences, setExperiences] = useState<ExperienceDto[]>([]);  const [experiences, setExperiences] = useState<ExperienceDto[]>([]);

  const [loading, setLoading] = useState(true);  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);  const [error, setError] = useState<string | null>(null);

  const [searchValue, setSearchValue] = useState("");  const [searchValue, setSearchValue] = useState("");

  const [sortBy, setSortBy] = useState("createdAt");  const [sortBy, setSortBy] = useState("createdAt");

  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [filterActive, setFilterActive] = useState<boolean | null>(null);  const [filterActive, setFilterActive] = useState<boolean | null>(null);



  useEffect(() => {  useEffect(() => {

    loadExperiences();    loadExperiences();

  }, []);  }, []);



  const loadExperiences = async () => {  const loadExperiences = async () => {

    try {    try {

      setLoading(true);      setLoading(true);

      setError(null);      setError(null);

      const response = await apiClient.getExperiences();      const response = await apiClient.getExperiences();



      if (response.success && response.data) {      if (response.success && response.data) {

        setExperiences(response.data);        setExperiences(response.data);

      } else {      } else {

        setError(response.message || "Error al cargar las experiencias");        setError(response.message || "Error al cargar las experiencias");

      }      }

    } catch (err) {    } catch (err) {

      setError("Error de conexión");      setError("Error de conexión");

    } finally {    } finally {

      setLoading(false);      setLoading(false);

    }    }

  };  };



  const filteredAndSortedExperiences = useMemo(() => {  const filteredAndSortedExperiences = useMemo(() => {

    let filtered = experiences;    let filtered = experiences;



    // Apply search filter    // Apply search filter

    if (searchValue) {    if (searchValue) {

      filtered = filtered.filter(exp =>       filtered = filtered.filter(exp => 

        exp.title.toLowerCase().includes(searchValue.toLowerCase()) ||        exp.title.toLowerCase().includes(searchValue.toLowerCase()) ||

        exp.description?.toLowerCase().includes(searchValue.toLowerCase()) ||        exp.description?.toLowerCase().includes(searchValue.toLowerCase()) ||

        exp.slug.toLowerCase().includes(searchValue.toLowerCase())        exp.slug.toLowerCase().includes(searchValue.toLowerCase())

      );      );

    }    }



    // Apply status filter    // Apply status filter

    if (filterActive !== null) {    if (filterActive !== null) {

      filtered = filtered.filter(exp => exp.isActive === filterActive);      filtered = filtered.filter(exp => exp.isActive === filterActive);

    }    }



    // Apply sorting    // Apply sorting

    filtered.sort((a, b) => {    filtered.sort((a, b) => {

      let aValue: any = a[sortBy as keyof ExperienceDto];      let aValue: any = a[sortBy as keyof ExperienceDto];

      let bValue: any = b[sortBy as keyof ExperienceDto];      let bValue: any = b[sortBy as keyof ExperienceDto];



      if (sortBy === "assets") {      if (sortBy === "assets") {

        aValue = a.assets.length;        aValue = a.assets.length;

        bValue = b.assets.length;        bValue = b.assets.length;

      }      }



      if (typeof aValue === "string") {      if (typeof aValue === "string") {

        aValue = aValue.toLowerCase();        aValue = aValue.toLowerCase();

        bValue = bValue.toLowerCase();        bValue = bValue.toLowerCase();

      }      }



      if (sortOrder === "asc") {      if (sortOrder === "asc") {

        return aValue > bValue ? 1 : -1;        return aValue > bValue ? 1 : -1;

      } else {      } else {

        return aValue < bValue ? 1 : -1;        return aValue < bValue ? 1 : -1;

      }      }

    });    });



    return filtered;    return filtered;

  }, [experiences, searchValue, sortBy, sortOrder, filterActive]);  }, [experiences, searchValue, sortBy, sortOrder, filterActive]);



  const handleToggleActive = async (id: string) => {  const handleToggleActive = async (id: string) => {

    try {    try {

      const response = await apiClient.toggleExperienceActive(id);      const response = await apiClient.toggleExperienceActive(id);

      if (response.success) {      if (response.success) {

        setExperiences(prev =>         setExperiences(prev => 

          prev.map(exp =>           prev.map(exp => 

            exp.id === id ? { ...exp, isActive: !exp.isActive } : exp            exp.id === id ? { ...exp, isActive: !exp.isActive } : exp

          )          )

        );        );

      } else {      } else {

        setError(response.message || "Error al cambiar el estado");        setError(response.message || "Error al cambiar el estado");

      }      }

    } catch (err) {    } catch (err) {

      setError("Error al cambiar el estado de la experiencia");      setError("Error al cambiar el estado de la experiencia");

    }    }

  };  };



  const handleDelete = async (id: string, title: string) => {  const handleDelete = async (id: string, title: string) => {

    if (!confirm(`¿Estás seguro de que quieres eliminar la experiencia "${title}"?`)) {    if (!confirm(`¿Estás seguro de que quieres eliminar la experiencia "${title}"?`)) {

      return;      return;

    }    }



    try {    try {

      const response = await apiClient.deleteExperience(id);      const response = await apiClient.deleteExperience(id);

      if (response.success) {      if (response.success) {

        setExperiences(prev => prev.filter(exp => exp.id !== id));        setExperiences(prev => prev.filter(exp => exp.id !== id));

      } else {      } else {

        setError(response.message || "Error al eliminar la experiencia");        setError(response.message || "Error al eliminar la experiencia");

      }      }

    } catch (err) {    } catch (err) {

      setError("Error al eliminar la experiencia");      setError("Error al eliminar la experiencia");

    }    }

  };  };



  const filters = [  const filters = [

    {    {

      key: "active",      key: "active",

      label: "Activas",      label: "Activas",

      active: filterActive === true,      active: filterActive === true,

      count: experiences.filter(e => e.isActive).length,      count: experiences.filter(e => e.isActive).length,

    },    },

    {    {

      key: "inactive",       key: "inactive", 

      label: "Inactivas",      label: "Inactivas",

      active: filterActive === false,      active: filterActive === false,

      count: experiences.filter(e => !e.isActive).length,      count: experiences.filter(e => !e.isActive).length,

    },    },

  ];  ];



  const handleFilterToggle = (key: string) => {  const handleFilterToggle = (key: string) => {

    if (key === "active") {    if (key === "active") {

      setFilterActive(filterActive === true ? null : true);      setFilterActive(filterActive === true ? null : true);

    } else if (key === "inactive") {    } else if (key === "inactive") {

      setFilterActive(filterActive === false ? null : false);      setFilterActive(filterActive === false ? null : false);

    }    }

  };  };



  if (loading) {  if (loading) {

    return (    return (

      <motion.div       <motion.div 

        className="flex items-center justify-center min-h-[400px]"        className="flex items-center justify-center min-h-[400px]"

        initial={{ opacity: 0 }}        initial={{ opacity: 0 }}

        animate={{ opacity: 1 }}        animate={{ opacity: 1 }}

        transition={{ duration: 0.5 }}        transition={{ duration: 0.5 }}

      >      >

        <div className="text-center space-y-4">        <div className="text-center space-y-4">

          <motion.div          <motion.div

            animate={{ rotate: 360 }}            animate={{ rotate: 360 }}

            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}

          >          >

            <Loader size="lg" />            <Loader size="lg" />

          </motion.div>          </motion.div>

          <p className="text-gray-400">Cargando experiencias...</p>          <p className="text-gray-400">Cargando experiencias...</p>

        </div>        </div>

      </motion.div>      </motion.div>

    );    );

  }  }



  return (  return (

    <motion.div    <motion.div

      initial={{ opacity: 0, y: 20 }}      initial={{ opacity: 0, y: 20 }}

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