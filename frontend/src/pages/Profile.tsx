import { useState, useEffect } from 'react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Calendar, Shield, ArrowLeft, Save, AlertTriangle } from 'lucide-react';

export default function Profile() {
  const session = useSession();
  const supabase = useSupabaseClient();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [profileData, setProfileData] = useState({
    email: session?.user?.email || '',
    created_at: session?.user?.created_at || '',
    last_sign_in: session?.user?.last_sign_in_at || '',
    role: session?.user?.role || 'authenticated'
  });

  useEffect(() => {
    if (session?.user) {
      setProfileData({
        email: session.user.email || '',
        created_at: session.user.created_at || '',
        last_sign_in: session.user.last_sign_in_at || '',
        role: session.user.role || 'authenticated'
      });
    }
  }, [session]);

  const handleUpdateEmail = async (newEmail: string) => {
    try {
      setLoading(true);
      setMessage(null);

      const { error } = await supabase.auth.updateUser({
        email: newEmail
      });

      if (error) {
        throw error;
      }

      setMessage({
        type: 'success',
        text: 'E-Mail-Adresse erfolgreich aktualisiert! Bitte überprüfe deine E-Mails zur Bestätigung.'
      });
    } catch (error: unknown) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Fehler beim Aktualisieren der E-Mail-Adresse'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (newPassword: string) => {
    try {
      setLoading(true);
      setMessage(null);

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw error;
      }

      setMessage({
        type: 'success',
        text: 'Passwort erfolgreich aktualisiert!'
      });
    } catch (error: unknown) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Fehler beim Aktualisieren des Passworts'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gunmetal-100 via-chinese_violet-100 to-french_mauve-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-gunmetal-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2 text-gunmetal-600 hover:text-gunmetal-800 transition-colors">
                <ArrowLeft className="h-4 w-4" />
                <span>Zurück zum Dashboard</span>
              </Link>
            </div>
            
            <h1 className="text-2xl font-bold bg-gradient-to-r from-chinese_violet-500 to-french_mauve-500 bg-clip-text text-transparent">
              Mein Profil
            </h1>
            
            <div></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center space-x-2">
              {message.type === 'error' && <AlertTriangle className="h-4 w-4" />}
              <span>{message.text}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card className="bg-white/90 backdrop-blur-md border-0 shadow-lg">
              <CardHeader className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-chinese_violet-400 to-french_mauve-400 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
                  {profileData.email[0]?.toUpperCase() || 'U'}
                </div>
                <CardTitle className="text-gunmetal-800">
                  {profileData.email}
                </CardTitle>
                <CardDescription className="flex items-center justify-center space-x-1">
                  <Shield className="h-4 w-4" />
                  <span className="capitalize">{profileData.role}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3 text-sm text-gunmetal-600">
                  <Calendar className="h-4 w-4" />
                  <div>
                    <div className="font-medium">Registriert</div>
                    <div>{profileData.created_at && formatDate(profileData.created_at)}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 text-sm text-gunmetal-600">
                  <User className="h-4 w-4" />
                  <div>
                    <div className="font-medium">Letzter Login</div>
                    <div>{profileData.last_sign_in && formatDate(profileData.last_sign_in)}</div>
                  </div>
                </div>

                <Separator />

                <Button 
                  onClick={handleLogout}
                  variant="outline" 
                  className="w-full text-red-600 border-red-200 hover:bg-red-50"
                >
                  Abmelden
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Profile Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Email Settings */}
            <Card className="bg-white/90 backdrop-blur-md border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="h-5 w-5 text-chinese_violet-500" />
                  <span>E-Mail-Adresse</span>
                </CardTitle>
                <CardDescription>
                  Ändere deine E-Mail-Adresse für dein Konto
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const newEmail = formData.get('email') as string;
                  if (newEmail && newEmail !== profileData.email) {
                    handleUpdateEmail(newEmail);
                  }
                }}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email">Neue E-Mail-Adresse</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        defaultValue={profileData.email}
                        placeholder="neue@email.com"
                        className="mt-1"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      disabled={loading}
                      className="bg-gradient-to-r from-chinese_violet-500 to-french_mauve-500 hover:from-chinese_violet-600 hover:to-french_mauve-600"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {loading ? 'Wird gespeichert...' : 'E-Mail aktualisieren'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Password Settings */}
            <Card className="bg-white/90 backdrop-blur-md border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-chinese_violet-500" />
                  <span>Passwort</span>
                </CardTitle>
                <CardDescription>
                  Ändere dein Passwort für mehr Sicherheit
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const newPassword = formData.get('password') as string;
                  const confirmPassword = formData.get('confirmPassword') as string;
                  
                  if (newPassword !== confirmPassword) {
                    setMessage({
                      type: 'error',
                      text: 'Passwörter stimmen nicht überein'
                    });
                    return;
                  }
                  
                  if (newPassword.length < 6) {
                    setMessage({
                      type: 'error',
                      text: 'Passwort muss mindestens 6 Zeichen lang sein'
                    });
                    return;
                  }
                  
                  handleUpdatePassword(newPassword);
                  e.currentTarget.reset();
                }}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="password">Neues Passwort</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Mindestens 6 Zeichen"
                        className="mt-1"
                        minLength={6}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="Passwort wiederholen"
                        className="mt-1"
                        minLength={6}
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      disabled={loading}
                      className="bg-gradient-to-r from-chinese_violet-500 to-french_mauve-500 hover:from-chinese_violet-600 hover:to-french_mauve-600"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {loading ? 'Wird gespeichert...' : 'Passwort aktualisieren'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card className="bg-white/90 backdrop-blur-md border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-chinese_violet-500" />
                  <span>Kontoinformationen</span>
                </CardTitle>
                <CardDescription>
                  Übersicht über dein Konto
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gunmetal-600">Benutzer-ID</Label>
                    <div className="mt-1 text-sm text-gunmetal-800 font-mono bg-gunmetal-50 p-2 rounded">
                      {session?.user?.id || 'Nicht verfügbar'}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gunmetal-600">Rolle</Label>
                    <div className="mt-1 text-sm text-gunmetal-800 bg-gunmetal-50 p-2 rounded capitalize">
                      {profileData.role}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gunmetal-600">E-Mail verifiziert</Label>
                    <div className="mt-1 text-sm text-gunmetal-800 bg-gunmetal-50 p-2 rounded">
                      {session?.user?.email_confirmed_at ? 'Ja' : 'Nein'}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gunmetal-600">Telefon verifiziert</Label>
                    <div className="mt-1 text-sm text-gunmetal-800 bg-gunmetal-50 p-2 rounded">
                      {session?.user?.phone_confirmed_at ? 'Ja' : 'Nein'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
} 