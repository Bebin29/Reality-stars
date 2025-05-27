import { useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Database, Loader2 } from 'lucide-react';

export default function StorageSetup() {
  const supabase = useSupabaseClient();
  const [status, setStatus] = useState<'idle' | 'checking' | 'creating' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');

  const setupStorage = async () => {
    try {
      setStatus('checking');
      setMessage('Überprüfe Storage-Bucket...');

      // First check if bucket exists
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        throw new Error(`Fehler beim Abrufen der Buckets: ${listError.message}`);
      }

      const personalitiesBucket = buckets?.find(bucket => bucket.name === 'personalities');

      if (personalitiesBucket) {
        setStatus('success');
        setMessage('Storage-Bucket "personalities" existiert bereits und ist bereit!');
        return;
      }

      // Create bucket if it doesn't exist
      setStatus('creating');
      setMessage('Erstelle Storage-Bucket...');

      const { data: bucket, error: bucketError } = await supabase.storage
        .createBucket('personalities', {
          public: true,
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
          fileSizeLimit: 5242880 // 5MB
        });

      if (bucketError) {
        throw new Error(`Fehler beim Erstellen des Buckets: ${bucketError.message}`);
      }

      setStatus('success');
      setMessage('Storage-Bucket "personalities" wurde erfolgreich erstellt!');

    } catch (error) {
      console.error('Storage setup error:', error);
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten');
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'checking':
      case 'creating':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Database className="h-5 w-5 text-gunmetal-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'error':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'checking':
      case 'creating':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      default:
        return 'text-gunmetal-700 bg-gunmetal-50 border-gunmetal-200';
    }
  };

  return (
    <Card className="bg-white/90 backdrop-blur-md border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Database className="h-5 w-5" />
          <span>Storage Setup</span>
        </CardTitle>
        <CardDescription>
          Richte den Supabase Storage-Bucket für Avatar-Bilder ein
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gunmetal-600">
          <p className="mb-2">
            Für die Avatar-Funktionalität wird ein Supabase Storage-Bucket namens "personalities" benötigt.
          </p>
          <p>
            Klicken Sie auf den Button unten, um den Bucket automatisch zu erstellen.
          </p>
        </div>

        <Button
          onClick={setupStorage}
          disabled={status === 'checking' || status === 'creating'}
          className="w-full bg-gradient-to-r from-chinese_violet-500 to-french_mauve-500 hover:from-chinese_violet-600 hover:to-french_mauve-600"
        >
          {status === 'checking' && (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Überprüfe...
            </>
          )}
          {status === 'creating' && (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Erstelle Bucket...
            </>
          )}
          {(status === 'idle' || status === 'error') && (
            <>
              <Database className="h-4 w-4 mr-2" />
              Storage einrichten
            </>
          )}
          {status === 'success' && (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Erneut prüfen
            </>
          )}
        </Button>

        {message && (
          <div className={`p-3 rounded-lg border text-sm flex items-center space-x-2 ${getStatusColor()}`}>
            {getStatusIcon()}
            <span>{message}</span>
          </div>
        )}

        {status === 'success' && (
          <div className="text-xs text-gunmetal-500 space-y-1 mt-4 p-3 bg-gunmetal-50 rounded-lg">
            <p><strong>✓ Bucket erstellt:</strong> personalities</p>
            <p><strong>✓ Öffentlicher Zugriff:</strong> Aktiviert</p>
            <p><strong>✓ Erlaubte Dateitypen:</strong> JPEG, PNG, WebP</p>
            <p><strong>✓ Maximale Dateigröße:</strong> 5MB</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 