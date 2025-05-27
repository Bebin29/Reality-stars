import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiService, type Personality, type PersonalityQueryParams } from '@/lib/api';
import { Users, Search, Filter, Plus, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Personalities() {
  const [personalities, setPersonalities] = useState<Personality[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<PersonalityQueryParams>({
    page: 1,
    limit: 12,
    sort_by: 'created_at',
    sort_order: 'desc'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });
  const [showFilters, setShowFilters] = useState(false);

  const loadPersonalities = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.getPersonalities(filters);
      
      if (response.success && response.data) {
        setPersonalities(response.data);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      }
    } catch (error) {
      console.error('Error loading personalities:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadPersonalities();
  }, [loadPersonalities]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchTerm !== filters.search) {
        setFilters(prev => ({
          ...prev,
          search: searchTerm || undefined,
          page: 1
        }));
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, filters.search]);

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleFilterChange = (key: keyof PersonalityQueryParams, value: string | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filtering
    }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      page: 1,
      limit: 12,
      sort_by: 'created_at',
      sort_order: 'desc'
    });
  };

  const getPersonalityInitials = (personality: Personality) => {
    return `${personality.first_name[0]}${personality.last_name[0]}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unbekannt';
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gunmetal-100 via-chinese_violet-100 to-french_mauve-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-gunmetal-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2 text-gunmetal-600 hover:text-gunmetal-800 transition-colors">
                <ArrowLeft className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              <div className="h-6 w-px bg-gunmetal-300"></div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-chinese_violet-500 to-french_mauve-500 bg-clip-text text-transparent">
                Persönlichkeiten
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gunmetal-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Suche nach Namen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64 bg-white/80"
                />
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? 'bg-chinese_violet-50 border-chinese_violet-200' : ''}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              
              <Link to="/personalities/new">
                <Button size="sm" className="bg-gradient-to-r from-chinese_violet-500 to-french_mauve-500 hover:from-chinese_violet-600 hover:to-french_mauve-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Hinzufügen
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white/90 backdrop-blur-md border-b border-gunmetal-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="gender" className="text-sm font-medium text-gunmetal-700">Geschlecht</Label>
                <select
                  id="gender"
                  value={filters.gender || ''}
                  onChange={(e) => handleFilterChange('gender', e.target.value || undefined)}
                  className="mt-1 block w-full rounded-md border border-gunmetal-300 bg-white px-3 py-2 text-sm focus:border-chinese_violet-500 focus:outline-none focus:ring-1 focus:ring-chinese_violet-500"
                >
                  <option value="">Alle</option>
                  <option value="männlich">Männlich</option>
                  <option value="weiblich">Weiblich</option>
                  <option value="divers">Divers</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="nationality" className="text-sm font-medium text-gunmetal-700">Nationalität</Label>
                <Input
                  id="nationality"
                  type="text"
                  placeholder="z.B. Deutsch"
                  value={filters.nationality || ''}
                  onChange={(e) => handleFilterChange('nationality', e.target.value || undefined)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="sortBy" className="text-sm font-medium text-gunmetal-700">Sortieren nach</Label>
                <select
                  id="sortBy"
                  value={filters.sort_by || 'created_at'}
                  onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gunmetal-300 bg-white px-3 py-2 text-sm focus:border-chinese_violet-500 focus:outline-none focus:ring-1 focus:ring-chinese_violet-500"
                >
                  <option value="created_at">Erstellungsdatum</option>
                  <option value="first_name">Vorname</option>
                  <option value="last_name">Nachname</option>
                  <option value="birth_date">Geburtsdatum</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="sortOrder" className="text-sm font-medium text-gunmetal-700">Reihenfolge</Label>
                <select
                  id="sortOrder"
                  value={filters.sort_order || 'desc'}
                  onChange={(e) => handleFilterChange('sort_order', e.target.value as 'asc' | 'desc')}
                  className="mt-1 block w-full rounded-md border border-gunmetal-300 bg-white px-3 py-2 text-sm focus:border-chinese_violet-500 focus:outline-none focus:ring-1 focus:ring-chinese_violet-500"
                >
                  <option value="desc">Absteigend</option>
                  <option value="asc">Aufsteigend</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Filter zurücksetzen
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-gunmetal-600">
              <Users className="h-5 w-5" />
              <span className="font-medium">
                {pagination.total} Persönlichkeit{pagination.total !== 1 ? 'en' : ''}
              </span>
            </div>
            {filters.search && (
              <div className="text-sm text-gunmetal-500">
                Suche nach "{filters.search}"
              </div>
            )}
          </div>
          
          <div className="text-sm text-gunmetal-500">
            Seite {pagination.page} von {pagination.totalPages}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-chinese_violet-500 border-t-transparent"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && personalities.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gunmetal-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gunmetal-800 mb-2">
              Keine Persönlichkeiten gefunden
            </h3>
            <p className="text-gunmetal-600 mb-6">
              {filters.search ? 'Versuche andere Suchbegriffe oder' : 'Beginne damit,'} eine neue Persönlichkeit hinzuzufügen.
            </p>
            <Link to="/personalities/new">
              <Button className="bg-gradient-to-r from-chinese_violet-500 to-french_mauve-500 hover:from-chinese_violet-600 hover:to-french_mauve-600">
                <Plus className="h-4 w-4 mr-2" />
                Erste Persönlichkeit hinzufügen
              </Button>
            </Link>
          </div>
        )}

        {/* Personalities Grid */}
        {!loading && personalities.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {personalities.map((personality) => (
                <Link
                  key={personality.personality_id}
                  to={`/personality/${personality.personality_id}`}
                  className="group"
                >
                  <Card className="bg-white/90 backdrop-blur-md border-0 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                    <CardHeader className="text-center pb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-chinese_violet-400 to-french_mauve-400 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-3">
                        {getPersonalityInitials(personality)}
                      </div>
                      <CardTitle className="text-lg text-gunmetal-800 group-hover:text-chinese_violet-600 transition-colors">
                        {personality.first_name} {personality.last_name}
                      </CardTitle>
                      <CardDescription className="text-gunmetal-600">
                        {personality.nationality || 'Unbekannte Nationalität'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2 text-sm text-gunmetal-600">
                        {personality.gender && (
                          <div className="flex justify-between">
                            <span>Geschlecht:</span>
                            <span className="capitalize">{personality.gender}</span>
                          </div>
                        )}
                        {personality.birth_date && (
                          <div className="flex justify-between">
                            <span>Geboren:</span>
                            <span>{formatDate(personality.birth_date)}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Hinzugefügt:</span>
                          <span>{formatDate(personality.created_at)}</span>
                        </div>
                      </div>
                      
                      {personality.bio && (
                        <div className="mt-3 pt-3 border-t border-gunmetal-200">
                          <p className="text-sm text-gunmetal-600 line-clamp-2">
                            {personality.bio}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Zurück
                </Button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, pagination.page - 2) + i;
                    if (pageNum > pagination.totalPages) return null;
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === pagination.page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className={pageNum === pagination.page ? 
                          "bg-gradient-to-r from-chinese_violet-500 to-french_mauve-500" : 
                          ""
                        }
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  Weiter
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
} 