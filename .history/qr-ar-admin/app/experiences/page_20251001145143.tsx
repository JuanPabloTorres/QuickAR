"use client";"use client";"use client";"use client";



import React, { useEffect, useState, useMemo } from "react";

import Link from "next/link";

import { motion, AnimatePresence } from "framer-motion";import React, { useEffect, useState, useMemo } from "react";

import { Plus, Grid, List, Sparkles } from "lucide-react";

import Link from "next/link";

import { PageHeader } from "@/components/page-header";

import { AnimatedCardGrid } from "@/components/ui/animated-card";import { motion, AnimatePresence } from "framer-motion";import React, { useEffect, useState, useMemo } from "react";import React, { useEffect, useState, useMemo } from "react";

import { AnimatedButton, FloatingActionButton } from "@/components/ui/animated-button";

import { SearchFilterBar } from "@/components/ui/search-filter-bar";import { 

import { ExperienceCard, ExperienceListItem } from "@/components/experience-components";

import { Card, CardContent } from "@/components/ui/card";  Plus, import Link from "next/link";import Link from "next/link";

import { Button } from "@/components/ui/button";

import { Loader } from "@/components/ui/loader";  Grid,

import { Alert, AlertDescription } from "@/components/ui/alert";

import { apiClient } from "@/lib/api";  List,import { motion, AnimatePresence } from "framer-motion";import { motion, AnimatePresence } from "framer-motion";

import { ExperienceDto } from "@/types";

  Sparkles

export default function ExperiencesPage() {

  const [experiences, setExperiences] = useState<ExperienceDto[]>([]);} from "lucide-react";import { import { 

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [searchValue, setSearchValue] = useState("");

  const [sortBy, setSortBy] = useState("createdAt");import { PageHeader } from "@/components/page-header";  Plus,   Plus, 

  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");import { AnimatedCardGrid } from "@/components/ui/animated-card";

  const [filterActive, setFilterActive] = useState<boolean | null>(null);

import { AnimatedButton, FloatingActionButton } from "@/components/ui/animated-button";  Search,   Search, 

  useEffect(() => {

    loadExperiences();import { SearchFilterBar } from "@/components/ui/search-filter-bar";

  }, []);

import { ExperienceCard, ExperienceListItem } from "@/components/experience-components";  Filter,   Filter, 

  const loadExperiences = async () => {

    try {import { Card, CardContent } from "@/components/ui/card";

      setLoading(true);

      setError(null);import { Button } from "@/components/ui/button";  Eye,   Eye, 

      const response = await apiClient.getExperiences();

import { Loader } from "@/components/ui/loader";

      if (response.success && response.data) {

        setExperiences(response.data);import { Alert, AlertDescription } from "@/components/ui/alert";  Edit,   Edit, 

      } else {

        setError(response.message || "Error al cargar las experiencias");import { apiClient } from "@/lib/api";

      }

    } catch (err) {import { ExperienceDto } from "@/types";  Trash2,   Trash2, 

      setError("Error de conexión");

    } finally {

      setLoading(false);

    }export default function ExperiencesPage() {  Play,   Play, 

  };

  const [experiences, setExperiences] = useState<ExperienceDto[]>([]);

  const filteredAndSortedExperiences = useMemo(() => {

    let filtered = experiences;  const [loading, setLoading] = useState(true);  Pause,   Pause, 



    if (searchValue) {  const [error, setError] = useState<string | null>(null);

      filtered = filtered.filter(exp => 

        exp.title.toLowerCase().includes(searchValue.toLowerCase()) ||  const [searchValue, setSearchValue] = useState("");  Calendar,  Calendar,

        exp.description?.toLowerCase().includes(searchValue.toLowerCase()) ||

        exp.slug.toLowerCase().includes(searchValue.toLowerCase())  const [sortBy, setSortBy] = useState("createdAt");

      );

    }  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");  Package,  Package,



    if (filterActive !== null) {  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

      filtered = filtered.filter(exp => exp.isActive === filterActive);

    }  const [filterActive, setFilterActive] = useState<boolean | null>(null);  Sparkles,  Sparkles,



    filtered.sort((a, b) => {

      let aValue: any = a[sortBy as keyof ExperienceDto];

      let bValue: any = b[sortBy as keyof ExperienceDto];  useEffect(() => {  Grid,  Grid,



      if (sortBy === "assets") {    loadExperiences();

        aValue = a.assets.length;

        bValue = b.assets.length;  }, []);  List,  List,

      }



      if (typeof aValue === "string") {

        aValue = aValue.toLowerCase();  const loadExperiences = async () => {  SortAsc,  SortAsc,

        bValue = bValue.toLowerCase();

      }    try {



      if (sortOrder === "asc") {      setLoading(true);  SortDesc  SortDesc

        return aValue > bValue ? 1 : -1;

      } else {      setError(null);

        return aValue < bValue ? 1 : -1;

      }      const response = await apiClient.getExperiences();} from "lucide-react";} from "lucide-react";

    });



    return filtered;

  }, [experiences, searchValue, sortBy, sortOrder, filterActive]);      if (response.success && response.data) {



  const handleToggleActive = async (id: string) => {        setExperiences(response.data);

    try {

      const response = await apiClient.toggleExperienceActive(id);      } else {import { PageHeader } from "@/components/page-header";import { PageHeader } from "@/components/page-header";

      if (response.success) {

        setExperiences(prev =>         setError(response.message || "Error al cargar las experiencias");

          prev.map(exp => 

            exp.id === id ? { ...exp, isActive: !exp.isActive } : exp      }import { AnimatedCard, AnimatedCardGrid } from "@/components/ui/animated-card";import { AnimatedCard, AnimatedCardGrid } from "@/components/ui/animated-card";

          )

        );    } catch (err) {

      } else {

        setError(response.message || "Error al cambiar el estado");      setError("Error de conexión");import { AnimatedButton, FloatingActionButton } from "@/components/ui/animated-button";import { AnimatedButton, FloatingActionButton } from "@/components/ui/animated-button";

      }

    } catch (err) {    } finally {

      setError("Error al cambiar el estado de la experiencia");

    }      setLoading(false);import { SearchFilterBar } from "@/components/ui/search-filter-bar";import { SearchFilterBar } from "@/components/ui/search-filter-bar";

  };

    }

  const handleDelete = async (id: string, title: string) => {

    if (!confirm(`¿Estás seguro de que quieres eliminar la experiencia "${title}"?`)) {  };import { StatusBadge, ToggleStatus } from "@/components/ui/status-badge";import { StatusBadge, ToggleStatus } from "@/components/ui/status-badge";

      return;

    }



    try {  const filteredAndSortedExperiences = useMemo(() => {import { ExperienceCard, ExperienceListItem } from "@/components/experience-components";import { ExperienceCard, ExperienceListItem } from "@/components/experience-components";

      const response = await apiClient.deleteExperience(id);

      if (response.success) {    let filtered = experiences;

        setExperiences(prev => prev.filter(exp => exp.id !== id));

      } else {import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

        setError(response.message || "Error al eliminar la experiencia");

      }    // Apply search filter

    } catch (err) {

      setError("Error al eliminar la experiencia");    if (searchValue) {import { Button } from "@/components/ui/button";import { Button } from "@/components/ui/button";

    }

  };      filtered = filtered.filter(exp => 



  const filters = [        exp.title.toLowerCase().includes(searchValue.toLowerCase()) ||import { Loader } from "@/components/ui/loader";import { Loader } from "@/components/ui/loader";

    {

      key: "active",        exp.description?.toLowerCase().includes(searchValue.toLowerCase()) ||

      label: "Activas",

      active: filterActive === true,        exp.slug.toLowerCase().includes(searchValue.toLowerCase())import { Alert, AlertDescription } from "@/components/ui/alert";import { Alert, AlertDescription } from "@/components/ui/alert";

      count: experiences.filter(e => e.isActive).length,

    },      );

    {

      key: "inactive",     }import { apiClient } from "@/lib/api";import { apiClient } from "@/lib/api";

      label: "Inactivas",

      active: filterActive === false,

      count: experiences.filter(e => !e.isActive).length,

    },    // Apply status filterimport { formatDate, truncateText } from "@/lib/utils";import { formatDate, truncateText } from "@/lib/utils";

  ];

    if (filterActive !== null) {

  const handleFilterToggle = (key: string) => {

    if (key === "active") {      filtered = filtered.filter(exp => exp.isActive === filterActive);import { ExperienceDto } from "@/types";import { ExperienceDto } from "@/types";

      setFilterActive(filterActive === true ? null : true);

    } else if (key === "inactive") {    }

      setFilterActive(filterActive === false ? null : false);

    }

  };

    // Apply sorting

  if (loading) {

    return (    filtered.sort((a, b) => {export default function ExperiencesPage() {export default function ExperiencesPage() {

      <motion.div 

        className="flex items-center justify-center min-h-[400px]"      let aValue: any = a[sortBy as keyof ExperienceDto];

        initial={{ opacity: 0 }}

        animate={{ opacity: 1 }}      let bValue: any = b[sortBy as keyof ExperienceDto];  const [experiences, setExperiences] = useState<ExperienceDto[]>([]);  const [experiences, setExperiences] = useState<ExperienceDto[]>([]);

        transition={{ duration: 0.5 }}

      >

        <div className="text-center space-y-4">

          <motion.div      if (sortBy === "assets") {  const [loading, setLoading] = useState(true);  const [loading, setLoading] = useState(true);

            animate={{ rotate: 360 }}

            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}        aValue = a.assets.length;

          >

            <Loader size="lg" />        bValue = b.assets.length;  const [error, setError] = useState<string | null>(null);  const [error, setError] = useState<string | null>(null);

          </motion.div>

          <p className="text-gray-400">Cargando experiencias...</p>      }

        </div>

      </motion.div>  const [searchValue, setSearchValue] = useState("");  const [searchValue, setSearchValue] = useState("");

    );

  }      if (typeof aValue === "string") {



  return (        aValue = aValue.toLowerCase();  const [sortBy, setSortBy] = useState("createdAt");  const [sortBy, setSortBy] = useState("createdAt");

    <motion.div

      initial={{ opacity: 0, y: 20 }}        bValue = bValue.toLowerCase();

      animate={{ opacity: 1, y: 0 }}

      transition={{ duration: 0.5 }}      }  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    >

      <motion.div

        initial={{ opacity: 0, y: -20 }}

        animate={{ opacity: 1, y: 0 }}      if (sortOrder === "asc") {  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

        transition={{ duration: 0.5, delay: 0.1 }}

      >        return aValue > bValue ? 1 : -1;

        <PageHeader

          title="Experiencias AR"      } else {  const [filterActive, setFilterActive] = useState<boolean | null>(null);  const [filterActive, setFilterActive] = useState<boolean | null>(null);

          description="Gestiona tus experiencias de realidad aumentada"

          action={        return aValue < bValue ? 1 : -1;

            <div className="flex items-center space-x-3">

              <div className="flex items-center border border-slate-700/50 rounded-lg p-1 bg-slate-800/30">      }

                <Button

                  variant={viewMode === "grid" ? "default" : "ghost"}    });

                  size="sm"

                  onClick={() => setViewMode("grid")}  useEffect(() => {  useEffect(() => {

                  className="px-3"

                >    return filtered;

                  <Grid className="w-4 h-4" />

                </Button>  }, [experiences, searchValue, sortBy, sortOrder, filterActive]);    loadExperiences();    loadExperiences();

                <Button

                  variant={viewMode === "list" ? "default" : "ghost"}

                  size="sm"

                  onClick={() => setViewMode("list")}  const handleToggleActive = async (id: string) => {  }, []);  }, []);

                  className="px-3"

                >    try {

                  <List className="w-4 h-4" />

                </Button>      const response = await apiClient.toggleExperienceActive(id);

              </div>

      if (response.success) {

              <Link href="/experiences/new">

                <AnimatedButton        setExperiences(prev =>   const loadExperiences = async () => {  const loadExperiences = async () => {

                  icon={<Plus className="w-4 h-4" />}

                  pulse          prev.map(exp => 

                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"

                >            exp.id === id ? { ...exp, isActive: !exp.isActive } : exp    try {    try {

                  Nueva Experiencia

                </AnimatedButton>          )

              </Link>

            </div>        );      setLoading(true);      setLoading(true);

          }

        />      } else {

      </motion.div>

        setError(response.message || "Error al cambiar el estado");      setError(null);      setError(null);

      <motion.div

        initial={{ opacity: 0, y: 20 }}      }

        animate={{ opacity: 1, y: 0 }}

        transition={{ duration: 0.5, delay: 0.2 }}    } catch (err) {      const response = await apiClient.getExperiences();      const response = await apiClient.getExperiences();

        className="mb-8"

      >      setError("Error al cambiar el estado de la experiencia");

        <SearchFilterBar

          searchValue={searchValue}    }

          onSearchChange={setSearchValue}

          sortBy={sortBy}  };

          sortOrder={sortOrder}

          onSortChange={setSortBy}      if (response.success && response.data) {      if (response.success && response.data) {

          filters={filters}

          onFilterToggle={handleFilterToggle}  const handleDelete = async (id: string, title: string) => {

          placeholder="Buscar experiencias..."

        />    if (!confirm(`¿Estás seguro de que quieres eliminar la experiencia "${title}"?`)) {        setExperiences(response.data);        setExperiences(response.data);

      </motion.div>

      return;

      {error && (

        <motion.div    }      } else {      } else {

          initial={{ opacity: 0, scale: 0.95 }}

          animate={{ opacity: 1, scale: 1 }}

          className="mb-6"

        >    try {        setError(response.message || "Error al cargar las experiencias");        setError(response.message || "Error al cargar las experiencias");

          <Alert variant="destructive">

            <AlertDescription>{error}</AlertDescription>      const response = await apiClient.deleteExperience(id);

          </Alert>

        </motion.div>      if (response.success) {      }      }

      )}

        setExperiences(prev => prev.filter(exp => exp.id !== id));

      <motion.div

        initial={{ opacity: 0 }}      } else {    } catch (err) {    } catch (err) {

        animate={{ opacity: 1 }}

        transition={{ duration: 0.5, delay: 0.3 }}        setError(response.message || "Error al eliminar la experiencia");

        className="mb-6"

      >      }      setError("Error de conexión");      setError("Error de conexión");

        <div className="flex items-center justify-between text-sm text-gray-400">

          <span>    } catch (err) {

            {filteredAndSortedExperiences.length} de {experiences.length} experiencias

          </span>      setError("Error al eliminar la experiencia");    } finally {    } finally {

          <span>

            Ordenar por {sortBy === "createdAt" ? "fecha de creación" : sortBy}     }

            {sortOrder === "desc" ? " (descendente)" : " (ascendente)"}

          </span>  };      setLoading(false);      setLoading(false);

        </div>

      </motion.div>



      <AnimatePresence mode="wait">  const filters = [    }    }

        {filteredAndSortedExperiences.length === 0 ? (

          <motion.div    {

            key="empty-state"

            initial={{ opacity: 0, scale: 0.95 }}      key: "active",  };  };

            animate={{ opacity: 1, scale: 1 }}

            exit={{ opacity: 0, scale: 0.95 }}      label: "Activas",

            transition={{ duration: 0.5 }}

          >      active: filterActive === true,

            <Card className="border-dashed border-slate-600">

              <CardContent className="text-center py-16">      count: experiences.filter(e => e.isActive).length,

                <motion.div

                  initial={{ scale: 0 }}    },  const filteredAndSortedExperiences = useMemo(() => {  const filteredAndSortedExperiences = useMemo(() => {

                  animate={{ scale: 1 }}

                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}    {

                  className="text-8xl mb-6"

                >      key: "inactive",     let filtered = experiences;    let filtered = experiences;

                  ✨

                </motion.div>      label: "Inactivas",

                <motion.h3

                  initial={{ opacity: 0, y: 20 }}      active: filterActive === false,

                  animate={{ opacity: 1, y: 0 }}

                  transition={{ delay: 0.3 }}      count: experiences.filter(e => !e.isActive).length,

                  className="text-2xl font-semibold text-white mb-3"

                >    },    // Apply search filter    // Apply search filter

                  {searchValue || filterActive !== null ? "No se encontraron experiencias" : "No hay experiencias aún"}

                </motion.h3>  ];

                <motion.p

                  initial={{ opacity: 0, y: 20 }}    if (searchValue) {    if (searchValue) {

                  animate={{ opacity: 1, y: 0 }}

                  transition={{ delay: 0.4 }}  const handleFilterToggle = (key: string) => {

                  className="text-blue-200 mb-8 max-w-md mx-auto"

                >    if (key === "active") {      filtered = filtered.filter(exp =>       filtered = filtered.filter(exp => 

                  {searchValue || filterActive !== null 

                    ? "Intenta ajustar tus filtros de búsqueda"      setFilterActive(filterActive === true ? null : true);

                    : "Crea tu primera experiencia AR para comenzar a transformar la realidad"

                  }    } else if (key === "inactive") {        exp.title.toLowerCase().includes(searchValue.toLowerCase()) ||        exp.title.toLowerCase().includes(searchValue.toLowerCase()) ||

                </motion.p>

                {!searchValue && filterActive === null && (      setFilterActive(filterActive === false ? null : false);

                  <motion.div

                    initial={{ opacity: 0, y: 20 }}    }        exp.description?.toLowerCase().includes(searchValue.toLowerCase()) ||        exp.description?.toLowerCase().includes(searchValue.toLowerCase()) ||

                    animate={{ opacity: 1, y: 0 }}

                    transition={{ delay: 0.5 }}  };

                  >

                    <Link href="/experiences/new">        exp.slug.toLowerCase().includes(searchValue.toLowerCase())        exp.slug.toLowerCase().includes(searchValue.toLowerCase())

                      <AnimatedButton

                        icon={<Sparkles className="w-5 h-5" />}  if (loading) {

                        pulse

                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-8 py-3"    return (      );      );

                      >

                        Crear Primera Experiencia      <motion.div 

                      </AnimatedButton>

                    </Link>        className="flex items-center justify-center min-h-[400px]"    }    }

                  </motion.div>

                )}        initial={{ opacity: 0 }}

              </CardContent>

            </Card>        animate={{ opacity: 1 }}

          </motion.div>

        ) : (        transition={{ duration: 0.5 }}

          <motion.div

            key="experiences-list"      >    // Apply status filter    // Apply status filter

            initial={{ opacity: 0 }}

            animate={{ opacity: 1 }}        <div className="text-center space-y-4">

            exit={{ opacity: 0 }}

            transition={{ duration: 0.5 }}          <motion.div    if (filterActive !== null) {    if (filterActive !== null) {

          >

            {viewMode === "grid" ? (            animate={{ rotate: 360 }}

              <AnimatedCardGrid 

                className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}      filtered = filtered.filter(exp => exp.isActive === filterActive);      filtered = filtered.filter(exp => exp.isActive === filterActive);

                stagger

              >          >

                {filteredAndSortedExperiences.map((experience, index) => (

                  <ExperienceCard            <Loader size="lg" />    }    }

                    key={experience.id}

                    experience={experience}          </motion.div>

                    index={index}

                    onToggleActive={handleToggleActive}          <p className="text-gray-400">Cargando experiencias...</p>

                    onDelete={handleDelete}

                  />        </div>

                ))}

              </AnimatedCardGrid>      </motion.div>    // Apply sorting    // Apply sorting

            ) : (

              <div className="space-y-4">    );

                {filteredAndSortedExperiences.map((experience, index) => (

                  <ExperienceListItem  }    filtered.sort((a, b) => {    filtered.sort((a, b) => {

                    key={experience.id}

                    experience={experience}

                    index={index}

                    onToggleActive={handleToggleActive}  return (      let aValue: any = a[sortBy as keyof ExperienceDto];      let aValue: any = a[sortBy as keyof ExperienceDto];

                    onDelete={handleDelete}

                  />    <motion.div

                ))}

              </div>      initial={{ opacity: 0, y: 20 }}      let bValue: any = b[sortBy as keyof ExperienceDto];      let bValue: any = b[sortBy as keyof ExperienceDto];

            )}

          </motion.div>      animate={{ opacity: 1, y: 0 }}

        )}

      </AnimatePresence>      transition={{ duration: 0.5 }}



      <FloatingActionButton>    >

        <Link href="/experiences/new">

          <Plus className="w-6 h-6" />      <motion.div      if (sortBy === "assets") {      if (sortBy === "assets") {

        </Link>

      </FloatingActionButton>        initial={{ opacity: 0, y: -20 }}

    </motion.div>

  );        animate={{ opacity: 1, y: 0 }}        aValue = a.assets.length;        aValue = a.assets.length;

}
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