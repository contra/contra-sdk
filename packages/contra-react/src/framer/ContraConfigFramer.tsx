import React, { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { addPropertyControls, ControlType } from "framer"

// Global configuration interface
interface ContraConfig {
  apiKey: string;
  programId: string;
  apiBaseUrl: string;
  debugMode: boolean;
  lastUpdated: number;
}

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 400
 * @framerIntrinsicHeight 200
 */
export default function ContraConfigFramer(props: any) {
  const {
    // Theme Colors
    backgroundColor,
    textColor,
    textSecondaryColor,
    borderColor,
    successColor,
    errorColor,

    // API Configuration
    apiKey = '',
    programId = '',
    apiBaseUrl = 'https://contra.com',
    debugMode = false,

    // Display Options
    showStatus = true,
    showTestButton = true,
    title = 'Contra API Configuration',

    // Layout
    padding = '24px',

    // Framer props
    style,
    width,
    height,
    ...otherProps
  } = props;

  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [testResults, setTestResults] = useState<any>(null);

  // Update global configuration whenever props change
  useEffect(() => {
    if (apiKey && programId) {
      const config: ContraConfig = {
        apiKey,
        programId,
        apiBaseUrl,
        debugMode,
        lastUpdated: Date.now()
      };

      // Store in multiple places for maximum compatibility
      // 1. Window global for immediate access
      (window as any).contraConfig = config;
      
      // 2. LocalStorage for persistence
      localStorage.setItem('contraConfig', JSON.stringify(config));
      
      // 3. Custom event for real-time updates
      window.dispatchEvent(new CustomEvent('contraConfigUpdated', {
        detail: config
      }));

      if (debugMode) {
        console.log('[ContraConfig] Configuration updated:', config);
      }
    }
  }, [apiKey, programId, apiBaseUrl, debugMode]);

  // Test API connection
  const testConnection = async () => {
    if (!apiKey || !programId) {
      setConnectionStatus('error');
      setStatusMessage('Please provide API Key and Program ID');
      return;
    }

    setConnectionStatus('testing');
    setStatusMessage('Testing connection...');

    try {
      const endpoint = `${apiBaseUrl}/public-api/programs/${programId}`;
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `${apiKey}`,
          'X-API-Key': `${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const result = await response.json();
      setConnectionStatus('success');
      setStatusMessage(`Connected successfully! Found program: ${result.data?.title || 'Unknown'}`);
      setTestResults(result.data);

      if (debugMode) {
        console.log('[ContraConfig] Connection test successful:', result);
      }
    } catch (error: any) {
      setConnectionStatus('error');
      setStatusMessage(`Connection failed: ${error.message}`);
      setTestResults(null);

      if (debugMode) {
        console.error('[ContraConfig] Connection test failed:', error);
      }
    }
  };

  const containerStyle: CSSProperties = {
    backgroundColor: backgroundColor || '#FFFFFF',
    border: `1px solid ${borderColor || '#E5E7EB'}`,
    borderRadius: '12px',
    padding,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    width: width || '100%',
    height: height || 'auto',
    ...style,
  };

  const titleStyle: CSSProperties = {
    fontSize: '18px',
    fontWeight: '600',
    color: textColor || '#111827',
    margin: '0 0 16px 0',
  };

  const infoStyle: CSSProperties = {
    fontSize: '14px',
    color: textSecondaryColor || '#6B7280',
    marginBottom: '16px',
    lineHeight: '1.5',
  };

  const statusStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    marginTop: '16px',
    backgroundColor: connectionStatus === 'success' 
      ? (successColor || '#F0FDF4') 
      : connectionStatus === 'error' 
      ? (errorColor || '#FEF2F2') 
      : '#F9FAFB',
    color: connectionStatus === 'success' 
      ? '#065F46' 
      : connectionStatus === 'error' 
      ? '#991B1B' 
      : textSecondaryColor || '#6B7280',
  };

  const buttonStyle: CSSProperties = {
    backgroundColor: textColor || '#111827',
    color: backgroundColor || '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 16px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    disabled: connectionStatus === 'testing',
  };

  const configInfoStyle: CSSProperties = {
    backgroundColor: '#F9FAFB',
    border: `1px solid ${borderColor || '#E5E7EB'}`,
    borderRadius: '8px',
    padding: '12px',
    fontSize: '12px',
    color: textSecondaryColor || '#6B7280',
    marginTop: '16px',
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'testing':
        return '🔄';
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '🔧';
    }
  };

  return (
    <div style={containerStyle} {...otherProps}>
      <h2 style={titleStyle}>{title}</h2>
      
      <div style={infoStyle}>
        Configure your Contra API connection once here. All other Contra components will automatically use this configuration.
      </div>

      {/* Configuration Summary */}
      <div style={configInfoStyle}>
        <div><strong>API Key:</strong> {apiKey ? `${apiKey.substring(0, 8)}...` : 'Not set'}</div>
        <div><strong>Program ID:</strong> {programId || 'Not set'}</div>
        <div><strong>Base URL:</strong> {apiBaseUrl}</div>
        <div><strong>Debug Mode:</strong> {debugMode ? 'Enabled' : 'Disabled'}</div>
      </div>

      {/* Test Connection Button */}
      {showTestButton && (
        <button
          style={buttonStyle}
          onClick={testConnection}
          disabled={connectionStatus === 'testing' || !apiKey || !programId}
        >
          {connectionStatus === 'testing' ? 'Testing...' : 'Test Connection'}
        </button>
      )}

      {/* Status Display */}
      {showStatus && statusMessage && (
        <div style={statusStyle}>
          <span>{getStatusIcon()}</span>
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Test Results */}
      {testResults && debugMode && (
        <details style={{ marginTop: '16px', fontSize: '12px' }}>
          <summary style={{ cursor: 'pointer', color: textSecondaryColor }}>
            View API Response
          </summary>
          <pre style={{ 
            backgroundColor: '#F9FAFB',
            padding: '8px',
            borderRadius: '4px',
            overflow: 'auto',
            fontSize: '11px',
            marginTop: '8px'
          }}>
            {JSON.stringify(testResults, null, 2)}
          </pre>
        </details>
      )}

      {/* Usage Instructions */}
      <div style={{
        marginTop: '16px',
        padding: '12px',
        backgroundColor: '#EFF6FF',
        borderRadius: '8px',
        fontSize: '12px',
        color: '#1E40AF'
      }}>
        <strong>✨ Setup Complete!</strong><br />
        Other Contra components (HeroFramer, ExpertGridFramer, etc.) will automatically detect and use this configuration. No need to set API keys in individual components.
      </div>
    </div>
  );
}

// Property Controls
addPropertyControls(ContraConfigFramer, {
  // === COLORS ===
  backgroundColor: { 
    type: ControlType.Color, 
    title: "Background", 
    defaultValue: "#FFFFFF",
    description: "Configuration panel background color"
  },
  textColor: { 
    type: ControlType.Color, 
    title: "Text Color", 
    defaultValue: "#111827",
    description: "Primary text color"
  },
  textSecondaryColor: { 
    type: ControlType.Color, 
    title: "Secondary Text Color", 
    defaultValue: "#6B7280",
    description: "Secondary text and info color"
  },
  borderColor: { 
    type: ControlType.Color, 
    title: "Border Color", 
    defaultValue: "#E5E7EB",
    description: "Border color"
  },
  successColor: { 
    type: ControlType.Color, 
    title: "Success Color", 
    defaultValue: "#F0FDF4",
    description: "Success status background color"
  },
  errorColor: { 
    type: ControlType.Color, 
    title: "Error Color", 
    defaultValue: "#FEF2F2",
    description: "Error status background color"
  },

  // === API CONFIGURATION ===
  apiKey: { 
    type: ControlType.String, 
    title: "API Key", 
    placeholder: "csk_...",
    description: "Your Contra API key (starts with csk_)"
  },
  programId: { 
    type: ControlType.String, 
    title: "Program ID", 
    placeholder: "program_...",
    description: "Your Contra Program ID"
  },
  apiBaseUrl: { 
    type: ControlType.String, 
    title: "API Base URL", 
    defaultValue: "https://contra.com",
    description: "(Advanced) Override API base URL"
  },
  debugMode: { 
    type: ControlType.Boolean, 
    title: "Debug Mode", 
    defaultValue: false,
    description: "Enable console logging and detailed error messages"
  },

  // === DISPLAY OPTIONS ===
  title: { 
    type: ControlType.String, 
    title: "Title", 
    defaultValue: "Contra API Configuration",
    description: "Configuration panel title"
  },
  showStatus: { 
    type: ControlType.Boolean, 
    title: "Show Status", 
    defaultValue: true,
    description: "Show connection status messages"
  },
  showTestButton: { 
    type: ControlType.Boolean, 
    title: "Show Test Button", 
    defaultValue: true,
    description: "Show the test connection button"
  },

  // === LAYOUT ===
  padding: { 
    type: ControlType.String, 
    title: "Padding", 
    defaultValue: "24px",
    description: "Internal padding"
  },
});

// Helper function for other components to get the current configuration
export const getContraConfig = (): ContraConfig | null => {
  try {
    // Try window global first (fastest)
    const windowConfig = (window as any).contraConfig;
    if (windowConfig && windowConfig.apiKey && windowConfig.programId) {
      return windowConfig;
    }

    // Fallback to localStorage
    const storedConfig = localStorage.getItem('contraConfig');
    if (storedConfig) {
      const parsed = JSON.parse(storedConfig);
      if (parsed.apiKey && parsed.programId) {
        return parsed;
      }
    }

    return null;
  } catch (error) {
    console.warn('[ContraConfig] Failed to get configuration:', error);
    return null;
  }
}; 