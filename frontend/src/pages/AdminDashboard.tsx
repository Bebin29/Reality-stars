import { useState, useEffect, useCallback } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiService, type Personality } from '@/lib/api';
import { Users, Search, Plus, TrendingUp, Star, Calendar, Settings, Image } from 'lucide-react';

export default function AdminDashboard() {
  const supabase = useSupabaseClient();
  const [personalities, setPersonalities] = useState<Personality[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Personality[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPersonalities: 0,
    recentAdditions: 0,
    popularPersonalities: 0
  });

  const handleSearch = useCallback(async () => {
    try {
      const response = await apiService.searchPersonalities(searchTerm, 5);
      if (response.success && response.data) {
        setSearchResults(response.data);
      }
    } catch (error) {
      console.error('Error searching personalities:', error);
    }
  }, [searchTerm]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load recent personalities
      const response = await apiService.getPersonalities({
        limit: 6,
        sort_by: 'created_at',
        sort_order: 'desc'
      });

      if (response.success && response.data) {
        setPersonalities(response.data);
        setStats({
          totalPersonalities: response.pagination?.total || 0,
          recentAdditions: response.data.length,
          popularPersonalities: Math.floor((response.pagination?.total || 0) * 0.1)
        });
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (searchTerm.length > 2) {
      handleSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, handleSearch]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gunmetal-100 via-chinese_violet-100 to-french_mauve-100">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-chinese_violet-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gunmetal-100 via-chinese_violet-100 to-french_mauve-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-gunmetal-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-chinese_violet-500 to-french_mauve-500 bg-clip-text text-transparent">
                Reality Stars
              </h1>
              <span className="text-gunmetal-600">Admin Dashboard</span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Admin
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gunmetal-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Suche nach Persönlichkeiten..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64 bg-white/80"
                />
                
                {/* Search Results Dropdown */}
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gunmetal-200 z-50">
                    {searchResults.map((personality) => (
                      <Link
                        key={personality.personality_id}
                        to={`/personality/${personality.personality_id}`}
                        className="block px-4 py-2 hover:bg-gunmetal-50 border-b border-gunmetal-100 last:border-b-0"
                        onClick={() => setSearchTerm('')}
                      >
                        <div className="font-medium text-gunmetal-800">
                          {personality.first_name} {personality.last_name}
                        </div>
                        {personality.nationality && (
                          <div className="text-sm text-gunmetal-600">{personality.nationality}</div>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              
              <Link to="/profile">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Profil
                </Button>
              </Link>
              
              <Button onClick={handleLogout} variant="outline" size="sm">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gunmetal-800 mb-2">
            Admin Dashboard 👋
          </h2>
          <p className="text-gunmetal-600 text-lg">
            Verwalte und überwache die Reality Stars Datenbank
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/90 backdrop-blur-md border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gunmetal-600">
                Gesamt Persönlichkeiten
              </CardTitle>
              <Users className="h-4 w-4 text-chinese_violet-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gunmetal-800">{stats.totalPersonalities}</div>
              <p className="text-xs text-gunmetal-600">
                +{stats.recentAdditions} diese Woche
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-md border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gunmetal-600">
                Beliebte Stars
              </CardTitle>
              <Star className="h-4 w-4 text-french_mauve-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gunmetal-800">{stats.popularPersonalities}</div>
              <p className="text-xs text-gunmetal-600">
                Top 10% der Datenbank
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-md border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gunmetal-600">
                Aktivität
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gunmetal-800">+12%</div>
              <p className="text-xs text-gunmetal-600">
                vs. letzter Monat
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Personalities */}
          <div className="lg:col-span-2">
            <Card className="bg-white/90 backdrop-blur-md border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-chinese_violet-500" />
                  <span>Neueste Persönlichkeiten</span>
                </CardTitle>
                <CardDescription>
                  Die zuletzt hinzugefügten Reality Stars
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {personalities.map((personality) => (
                    <Link
                      key={personality.personality_id}
                      to={`/personality/${personality.personality_id}`}
                      className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gunmetal-50 transition-colors duration-200"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-chinese_violet-400 to-french_mauve-400 rounded-full flex items-center justify-center text-white font-bold">
                        {personality.first_name[0]}{personality.last_name[0]}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gunmetal-800">
                          {personality.first_name} {personality.last_name}
                        </h3>
                        <p className="text-sm text-gunmetal-600">
                          {personality.nationality || 'Unbekannte Nationalität'}
                          {personality.gender && ` • ${personality.gender}`}
                        </p>
                      </div>
                      <div className="text-xs text-gunmetal-500">
                        {personality.created_at && new Date(personality.created_at).toLocaleDateString('de-DE')}
                      </div>
                    </Link>
                  ))}
                </div>
                
                <div className="mt-6 pt-4 border-t border-gunmetal-200">
                  <Link to="/personalities">
                    <Button className="w-full bg-gradient-to-r from-chinese_violet-500 to-french_mauve-500 hover:from-chinese_violet-600 hover:to-french_mauve-600">
                      Alle Persönlichkeiten anzeigen
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <Card className="bg-white/90 backdrop-blur-md border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="h-5 w-5 text-chinese_violet-500" />
                  <span>Admin Aktionen</span>
                </CardTitle>
                <CardDescription>
                  Verwaltungsfunktionen
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link to="/personalities/new">
                  <Button className="w-full bg-gradient-to-r from-chinese_violet-500 to-french_mauve-500 hover:from-chinese_violet-600 hover:to-french_mauve-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Neue Persönlichkeit
                  </Button>
                </Link>
                
                <Link to="/personalities">
                  <Button variant="outline" className="w-full">
                    <Users className="h-4 w-4 mr-2" />
                    Alle verwalten
                  </Button>
                </Link>
                
                <Link to="/admin/avatars">
                  <Button variant="outline" className="w-full">
                    <Image className="h-4 w-4 mr-2" />
                    Avatar-Verwaltung
                  </Button>
                </Link>
                
                <Link to="/admin/statistics">
                  <Button variant="outline" className="w-full">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Erweiterte Statistiken
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
} 