'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { KeyIcon, AlertCircle, CheckCircle } from 'lucide-react';
import { validateAdminApiKey } from '@/actions/admin/api-keys';

interface ApiKeyPromptProps {
  isOpen: boolean;
  onSuccess: (apiKeyData: any) => void;
  onCancel: () => void;
}

export function ApiKeyPrompt({ isOpen, onSuccess, onCancel }: ApiKeyPromptProps) {
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      setError('Please enter an API key');
      return;
    }

    setIsValidating(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await validateAdminApiKey({ apiKey: apiKey.trim() });

      if (result.success && result.valid) {
        setSuccess(`Valid admin API key (${result.source})`);
        
        // Store API key validation in sessionStorage for the session
        sessionStorage.setItem('admin_api_access', JSON.stringify({
          validated: true,
          expiresAt: Date.now() + (60 * 60 * 1000), // 1 hour
          source: result.source,
          keyData: result.data,
        }));

        setTimeout(() => {
          onSuccess(result.data);
          setApiKey('');
          setSuccess(null);
        }, 1000);
      } else if (result.success && !result.valid) {
        setError('Invalid API key. Please check your key and try again.');
      } else {
        setError(result.error || 'Failed to validate API key');
      }
    } catch (error) {
      console.error('API key validation error:', error);
      setError('Failed to validate API key. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleCancel = () => {
    setApiKey('');
    setError(null);
    setSuccess(null);
    onCancel();
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => !isValidating && handleCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyIcon className="h-5 w-5" />
            Admin Access Required
          </DialogTitle>
          <DialogDescription>
            Please enter your admin API key to access the admin panel. Your session will be valid for 1 hour.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">Admin API Key</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="doulitsa_admin_..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              disabled={isValidating}
              className="font-mono text-sm"
              autoComplete="off"
              autoFocus
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isValidating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isValidating || !apiKey.trim()}
            >
              {isValidating ? 'Validating...' : 'Validate Key'}
            </Button>
          </DialogFooter>
        </form>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="text-xs text-blue-800">
            <p className="font-medium mb-1">Security Notes:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>API keys are validated securely on the server</li>
              <li>Your session will expire after 1 hour of inactivity</li>
              <li>Keys are never stored in browser storage permanently</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}