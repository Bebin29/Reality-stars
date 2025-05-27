import { useState, useEffect, useCallback } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiService, type Personality } from '@/lib/api';
import { Users, Search, Star, TrendingUp, Heart, Eye, Settings, LogOut } from 'lucide-react';

export default function UserDashboard() {
  const supabase = useSupabaseClient();
  const [personalities, setPersonalities] = useState<Personality[]>([]);
  const [popularPersonalities, setPopularPersonalities] = useState<Personality[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Personality[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPersonalities: 0,
    newThisWeek: 0
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
      const recentResponse = await apiService.getPersonalities({
        limit: 8,
        sort_by: 'created_at',
        sort_order: 'desc'
      });

      // Load popular personalities (sorted by name for now, could be by views/likes later)
      const popularResponse = await apiService.getPersonalities({
        limit: 6,
        sort_by: 'first_name',
        sort_order: 'asc'
      });

      if (recentResponse.success && recentResponse.data) {
        setPersonalities(recentResponse.data);
        setStats({
          totalPersonalities: recentResponse.pagination?.total || 0,
          newThisWeek: recentResponse.data.length
        });
      }

      if (popularResponse.success && popularResponse.data) {
        setPopularPersonalities(popularResponse.data);
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

  const getPersonalityInitials = (personality: Personality) => {
    return `${personality.first_name[0]}${personality.last_name[0]}`;
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
              <span className="text-gunmetal-600">Entdecke deine Lieblingsstars</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gunmetal-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Suche nach Reality Stars..."
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
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gunmetal-800 mb-4">
            Willkommen in der Welt der Reality Stars! 🌟
          </h2>
          <p className="text-xl text-gunmetal-600 mb-8 max-w-3xl mx-auto">
            Entdecke deine Lieblings-Reality-TV-Persönlichkeiten, erfahre mehr über ihre Geschichten 
            und bleibe auf dem Laufenden über die neuesten Stars der Szene.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/personalities">
              <Button size="lg" className="bg-gradient-to-r from-chinese_violet-500 to-french_mauve-500 hover:from-chinese_violet-600 hover:to-french_mauve-600">
                <Users className="h-5 w-5 mr-2" />
                Alle Stars entdecken
              </Button>
            </Link>
            <Link to="/personalities?sort_by=created_at&sort_order=desc">
              <Button variant="outline" size="lg">
                <TrendingUp className="h-5 w-5 mr-2" />
                Neueste Stars
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card className="bg-white/90 backdrop-blur-md border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium text-gunmetal-600">
                Reality Stars in der Datenbank
              </CardTitle>
              <Users className="h-6 w-6 text-chinese_violet-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gunmetal-800 mb-2">{stats.totalPersonalities}</div>
              <p className="text-sm text-gunmetal-600">
                Persönlichkeiten aus verschiedenen Reality-TV-Shows
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-md border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium text-gunmetal-600">
                Neue Stars diese Woche
              </CardTitle>
              <Star className="h-6 w-6 text-french_mauve-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gunmetal-800 mb-2">+{stats.newThisWeek}</div>
              <p className="text-sm text-gunmetal-600">
                Frisch hinzugefügte Persönlichkeiten
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Featured/Popular Stars */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gunmetal-800">Beliebte Stars</h3>
            <Link to="/personalities?sort_by=first_name">
              <Button variant="outline">
                Alle anzeigen
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularPersonalities.map((personality) => (
              <Link
                key={personality.personality_id}
                to={`/personality/${personality.personality_id}`}
                className="group"
              >
                <Card className="bg-white/90 backdrop-blur-md border-0 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <CardHeader className="text-center pb-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-chinese_violet-400 to-french_mauve-400 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                      {getPersonalityInitials(personality)}
                    </div>
                    <CardTitle className="text-xl text-gunmetal-800 group-hover:text-chinese_violet-600 transition-colors">
                      {personality.first_name} {personality.last_name}
                    </CardTitle>
                    <CardDescription className="text-gunmetal-600">
                      {personality.nationality || 'Reality TV Star'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {personality.bio && (
                      <p className="text-sm text-gunmetal-600 line-clamp-3 mb-4">
                        {personality.bio}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-sm text-gunmetal-500">
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>Profil ansehen</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Heart className="h-4 w-4" />
                        <span>Favorit</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Additions */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gunmetal-800">Neueste Hinzufügungen</h3>
            <Link to="/personalities?sort_by=created_at&sort_order=desc">
              <Button variant="outline">
                Alle neuen Stars
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {personalities.map((personality) => (
              <Link
                key={personality.personality_id}
                to={`/personality/${personality.personality_id}`}
                className="group"
              >
                <Card className="bg-white/90 backdrop-blur-md border-0 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <CardHeader className="text-center pb-2">
                    <div className="w-16 h-16 bg-gradient-to-br from-chinese_violet-400 to-french_mauve-400 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-3">
                      {getPersonalityInitials(personality)}
                    </div>
                    <CardTitle className="text-lg text-gunmetal-800 group-hover:text-chinese_violet-600 transition-colors">
                      {personality.first_name} {personality.last_name}
                    </CardTitle>
                    <CardDescription className="text-sm text-gunmetal-600">
                      {personality.nationality || 'Reality TV Star'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-chinese_violet-100 text-chinese_violet-800">
                        Neu
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-chinese_violet-500 to-french_mauve-500 border-0 shadow-xl">
            <CardContent className="py-12">
              <h3 className="text-3xl font-bold text-white mb-4">
                Entdecke noch mehr Reality Stars!
              </h3>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Durchstöbere unsere komplette Sammlung von Reality-TV-Persönlichkeiten 
                und finde deine neuen Lieblingsstars.
              </p>
              <Link to="/personalities">
                <Button size="lg" variant="secondary" className="bg-white text-chinese_violet-600 hover:bg-white/90">
                  <Users className="h-5 w-5 mr-2" />
                  Zur vollständigen Übersicht
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
} 