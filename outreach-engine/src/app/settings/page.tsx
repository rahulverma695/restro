import { 
  Settings, 
  CheckCircle2, 
  XCircle, 
  HelpCircle,
  Database,
  Cpu,
  Mail
} from 'lucide-react';

interface EnvCheck {
  key: string;
  name: string;
  description: string;
  isSet: boolean;
  category: 'database' | 'ai' | 'oauth';
}

export default async function SettingsPage() {
  // Read environments on server side
  const envs: EnvCheck[] = [
    {
      key: 'DATABASE_URL',
      name: 'Neon Database URL',
      description: 'The connection string for your Serverless PostgreSQL database on Neon.',
      isSet: !!process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('REPLACE_WITH_YOUR'),
      category: 'database'
    },
    {
      key: 'GOOGLE_GENAI_USE_VERTEXAI',
      name: 'Enable Vertex AI mode',
      description: 'Set to "true" to use Google Cloud Vertex AI instead of Google AI Studio.',
      isSet: process.env.GOOGLE_GENAI_USE_VERTEXAI === 'true',
      category: 'ai'
    },
    {
      key: 'GOOGLE_CLOUD_PROJECT',
      name: 'Google Cloud Project ID',
      description: 'The ID of your GCP project used to call Vertex AI API.',
      isSet: !!process.env.GOOGLE_CLOUD_PROJECT,
      category: 'ai'
    },
    {
      key: 'GOOGLE_SERVICE_ACCOUNT_JSON',
      name: 'GCP Service Account Credentials',
      description: 'The Service Account JSON credentials to authenticate GCP requests.',
      isSet: !!process.env.GOOGLE_SERVICE_ACCOUNT_JSON,
      category: 'ai'
    },
    {
      key: 'GEMINI_API_KEY',
      name: 'Gemini API Key (Studio Fallback)',
      description: 'Fallback Google AI Studio API key if Vertex AI mode is disabled.',
      isSet: !!process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('REPLACE_WITH_YOUR'),
      category: 'ai'
    },
    {
      key: 'GOOGLE_OAUTH_CLIENT_ID',
      name: 'Google OAuth Client ID',
      description: 'OAuth Client ID from Google Cloud Console to connect sender Gmail inboxes.',
      isSet: !!process.env.GOOGLE_OAUTH_CLIENT_ID,
      category: 'oauth'
    },
    {
      key: 'GOOGLE_OAUTH_CLIENT_SECRET',
      name: 'Google OAuth Client Secret',
      description: 'OAuth Client Secret from Google Cloud Console.',
      isSet: !!process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      category: 'oauth'
    },
    {
      key: 'MICROSOFT_OAUTH_CLIENT_ID',
      name: 'Microsoft OAuth Client ID',
      description: 'Application Client ID from Azure Portal to connect Microsoft Outlook senders.',
      isSet: !!process.env.MICROSOFT_OAUTH_CLIENT_ID,
      category: 'oauth'
    },
    {
      key: 'MICROSOFT_OAUTH_CLIENT_SECRET',
      name: 'Microsoft OAuth Client Secret',
      description: 'Application Secret value from Azure Portal.',
      isSet: !!process.env.MICROSOFT_OAUTH_CLIENT_SECRET,
      category: 'oauth'
    }
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Configuration Settings</h2>
        <p className="text-sm text-[#94A3B8]">Review environment diagnoses, API connectors, and credentials status.</p>
      </div>

      {/* Main Settings Grid */}
      <div className="space-y-6">
        
        {/* Category: Database */}
        <div className="bg-[#090D1A] border border-[#1E293B] rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-indigo-400">
            <Database className="h-5 w-5" />
            <h3 className="text-md font-bold text-white">Database Credentials</h3>
          </div>
          <div className="divide-y divide-[#1E293B]/40">
            {envs.filter(e => e.category === 'database').map((env) => (
              <div key={env.key} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 first:pt-0 last:pb-0">
                <div className="space-y-0.5 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-white">{env.name}</span>
                    <code className="text-[10px] text-[#6366F1] font-mono bg-[#6366F1]/5 px-1.5 py-0.5 rounded">{env.key}</code>
                  </div>
                  <p className="text-xs text-[#94A3B8]">{env.description}</p>
                </div>
                <div>
                  {env.isSet ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-400/5 border border-emerald-400/20 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Configured
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-semibold text-rose-400 bg-rose-400/5 border border-rose-400/20 px-2.5 py-1 rounded-full">
                      <XCircle className="h-3.5 w-3.5" /> Unconfigured
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category: AI Engine */}
        <div className="bg-[#090D1A] border border-[#1E293B] rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-violet-400">
            <Cpu className="h-5 w-5" />
            <h3 className="text-md font-bold text-white">Google Vertex AI Engine</h3>
          </div>
          <div className="divide-y divide-[#1E293B]/40">
            {envs.filter(e => e.category === 'ai').map((env) => (
              <div key={env.key} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 first:pt-0 last:pb-0">
                <div className="space-y-0.5 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-white">{env.name}</span>
                    <code className="text-[10px] text-[#6366F1] font-mono bg-[#6366F1]/5 px-1.5 py-0.5 rounded">{env.key}</code>
                  </div>
                  <p className="text-xs text-[#94A3B8]">{env.description}</p>
                </div>
                <div>
                  {env.isSet ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-400/5 border border-emerald-400/20 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Configured
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-semibold text-rose-400 bg-rose-400/5 border border-rose-400/20 px-2.5 py-1 rounded-full">
                      <XCircle className="h-3.5 w-3.5" /> Unconfigured
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category: OAuth Client */}
        <div className="bg-[#090D1A] border border-[#1E293B] rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-sky-400">
            <Mail className="h-5 w-5" />
            <h3 className="text-md font-bold text-white">OAuth Integrations (Google & Microsoft)</h3>
          </div>
          <div className="divide-y divide-[#1E293B]/40">
            {envs.filter(e => e.category === 'oauth').map((env) => (
              <div key={env.key} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 first:pt-0 last:pb-0">
                <div className="space-y-0.5 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-white">{env.name}</span>
                    <code className="text-[10px] text-[#6366F1] font-mono bg-[#6366F1]/5 px-1.5 py-0.5 rounded">{env.key}</code>
                  </div>
                  <p className="text-xs text-[#94A3B8]">{env.description}</p>
                </div>
                <div>
                  {env.isSet ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-400/5 border border-emerald-400/20 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Configured
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-semibold text-rose-400 bg-rose-400/5 border border-rose-400/20 px-2.5 py-1 rounded-full">
                      <XCircle className="h-3.5 w-3.5" /> Unconfigured
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Help Panel */}
        <div className="bg-[#0E1527] border border-[#1E293B] rounded-xl p-5 flex gap-4">
          <HelpCircle className="h-5 w-5 text-[#6366F1] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-white">Need help getting credentials?</h4>
            <p className="text-[11px] text-[#94A3B8]">
              Create Google client secrets in the <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" className="text-[#6366F1] hover:underline">Google Cloud Console API Credentials page</a>, 
              and Microsoft application secrets in the <a href="https://portal.azure.com" target="_blank" rel="noreferrer" className="text-[#6366F1] hover:underline">Microsoft Entra App Registrations page</a>. 
              Be sure to register your app's callback URI under redirect settings.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
