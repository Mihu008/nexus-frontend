import { create } from 'zustand'

// Initial simulated history tasks
const initialTasks = [
  {
    id: 'TX-9048',
    prompt: 'Implement security check rules for Java Maven controller endpoints.',
    status: 'completed',
    timestamp: '2026-05-17 19:42:15',
    agent: 'Sentinel-V4',
    duration: '4.8s'
  },
  {
    id: 'TX-9047',
    prompt: 'Analyze PostgreSQL database index usage and optimize slow joins.',
    status: 'completed',
    timestamp: '2026-05-17 17:15:30',
    agent: 'DB-Optima',
    duration: '12.4s'
  },
  {
    id: 'TX-9046',
    prompt: 'Configure Docker multi-stage build scripts for spring-boot application.',
    status: 'failed',
    timestamp: '2026-05-17 14:02:08',
    agent: 'DevOps-Bot',
    duration: '1.2s'
  },
  {
    id: 'TX-9045',
    prompt: 'Design HSL gradient palette and update component styling token keys.',
    status: 'completed',
    timestamp: '2026-05-16 21:11:59',
    agent: 'Aesthetics-AI',
    duration: '6.1s'
  }
];

// Initial mock artifact
const defaultArtifact = {
  title: 'Nexus System Architecture Report',
  type: 'markdown',
  size: '2.4 KB',
  timestamp: 'Just now',
  markdown: `# NEXUS AI - Core System Verification Report

This report summarizes the initialization state and diagnostic verification results for the **Nexus AI Dashboard Platform**.

## Platform Status
| Module | Build Version | Database Connection | Latency | Status |
| :--- | :---: | :---: | :---: | :---: |
| **nexus-backend** | \`0.0.1-SNAPSHOT\` | PostgreSQL (UP) | 8ms | **ACTIVE** |
| **nexus-ui** | \`1.0.0-BETA\` | REST Gateway (UP) | 12ms | **ACTIVE** |
| **sentinel-core** | \`v4.2.0\` | Redis Cache (UP) | 3ms | **STANDBY** |

---

## Architectural Highlights
1. **Zustand State Store**: High-performance, low-boilerplate reactive state management.
2. **Tailwind CSS Utility Engine**: Dark-mode primary configurations using custom structural and color tokens.
3. **Framer Motion Elements**: Hardware-accelerated GPU micro-animations for high-fidelity interactive elements.

> [!NOTE]
> All systems are operating within nominal parameters. Memory usage is currently stable at **42.8%**.

---

## Technical Recommendations
- **Database Layer**: Enable Connection Pooling on the Postgres driver to handle asynchronous analytics bursts.
- **UI Render Tree**: Cache massive markdown files on the client-side session storage to bypass redundant roundtrips.`,
  code: `// Nexus UI Bootstrapping Configuration
// Transpiled from Nexus AST Core generator

import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import useStore from './store/useStore';
import Dashboard from './views/Dashboard';
import './index.css';

const startPlatformInstance = async (nodeId) => {
  console.log(\`[System] Initializing Nexus Node: \${nodeId}\`);
  const store = useStore.getState();
  
  store.addLog(\`Initializing Node \${nodeId}...\`, 'info');
  await new Promise(resolve => setTimeout(resolve, 800));
  
  store.addLog(\`Node \${nodeId} configured successfully.\`, 'success');
  return true;
};

// Mount node
const rootNode = document.getElementById('root');
if (rootNode) {
  createRoot(rootNode).render(
    <StrictMode>
      <Dashboard />
    </StrictMode>
  );
  startPlatformInstance('NODE-US-EAST-1');
}`
};

export const useStore = create((set, get) => ({
  activeTab: 'agent-control',
  prompt: 'Generate an executive security analysis report for public REST API endpoints.',
  isExecuting: false,
  logs: [
    { id: 'l1', text: 'System terminal initialized.', type: 'info', timestamp: '21:59:40' },
    { id: 'l2', text: 'Ready for prompt instruction input.', type: 'success', timestamp: '21:59:41' }
  ],
  tasks: initialTasks,
  artifact: defaultArtifact,
  systemMetrics: {
    cpu: 24,
    memory: 42.8,
    dbConnections: 14,
    latency: 12,
    tokenThroughput: 350,
    rateLimitActive: false,
    rateLimitCountdown: 0
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  setPrompt: (prompt) => set({ prompt }),
  clearLogs: () => set({ logs: [] }),
  addLog: (text, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    set((state) => ({
      logs: [...state.logs, { id: Math.random().toString(), text, type, timestamp }]
    }));
  },

  executeAgentPrompt: async () => {
    const { prompt, isExecuting, addLog } = get();
    if (isExecuting || !prompt.trim()) return;

    set({ isExecuting: true });
    addLog(`Initiating prompt execution: "${prompt}"`, 'input');

    const steps = [
      { text: 'Spinning up sandbox runtime environment...', type: 'info', delay: 400 },
      { text: 'Connecting to semantic inference engine (Gemini Flash)...', type: 'info', delay: 600 },
      { text: 'Analyzing active directory code structures in d:/Nexus...', type: 'info', delay: 700 },
      { text: 'Retrieved spring-boot metadata from Maven pom.xml (Active Document)', type: 'success', delay: 500 },
      { text: 'Running AST parser on endpoint security structures...', type: 'info', delay: 800 },
      { text: 'Warning: 2 controllers lack explicit CORS policy authorization blocks.', type: 'warning', delay: 900 },
      { text: 'Synthesizing recommendations and remediation scripts...', type: 'info', delay: 800 },
      { text: 'Compiling executive Markdown report and Code templates...', type: 'info', delay: 600 },
      { text: 'Finalizing security checklist and pipeline schemas...', type: 'success', delay: 500 }
    ];

    for (const step of steps) {
      await new Promise((resolve) => setTimeout(resolve, step.delay));
      addLog(step.text, step.type);
      
      // Randomize metrics slightly during execution
      set((state) => ({
        systemMetrics: {
          ...state.systemMetrics,
          cpu: Math.floor(Math.random() * 40) + 50, // 50% - 90%
          memory: parseFloat((42.8 + Math.random() * 5).toFixed(1)),
          dbConnections: Math.floor(Math.random() * 5) + 15,
          latency: Math.floor(Math.random() * 15) + 20,
          tokenThroughput: state.systemMetrics.rateLimitActive ? 0 : Math.floor(Math.random() * 150) + 500
        }
      }));
    }

    // Set finalized generated artifact based on custom prompt
    const generatedMarkdown = `# Executive Security Remediation Report
Generated on **${new Date().toLocaleDateString()}** in response to prompt:
> *"${prompt}"*

## Summary of Findings
During the static AST code scan, **2 endpoints** in \`nexus-backend\` were found to have overly permissive CORS policies:
1. \`@CrossOrigin("*")\` found on \`ChecklistController.java\`
2. \`@CrossOrigin("*")\` found on \`DelegationController.java\`

## Required Actions
- [x] Restrict allowed origins to trusted domain registry.
- [ ] Implement JWT credential verification interceptors.
- [ ] Add rate-limiting guards to prevent DDOS spikes.

> [!WARNING]
> Permissive CORS declarations allow cross-domain credential leaks and are blocked by secure browsers.

---

## Remediation Configurations (Spring Boot)
\`\`\`java
@Configuration
public class WebSecurityConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("https://nexus.yourdomain.com")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
\`\`\``;

    const generatedCode = `package com.nexus.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class SecurityConfiguration {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/v1/**")
                    .allowedOrigins("https://nexus-app.internal")
                    .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                    .allowedHeaders("Authorization", "Content-Type")
                    .allowCredentials(true)
                    .maxAge(3600);
            }
        };
    }
}`;

    const newTask = {
      id: `TX-${Math.floor(Math.random() * 1000) + 9100}`,
      prompt: prompt,
      status: 'completed',
      timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
      agent: 'Sentinel-V4',
      duration: '5.8s'
    };

    set((state) => ({
      isExecuting: false,
      tasks: [newTask, ...state.tasks],
      artifact: {
        title: `Security Report: ${prompt.slice(0, 30)}${prompt.length > 30 ? '...' : ''}`,
        type: 'markdown',
        size: '1.9 KB',
        timestamp: 'Just now',
        markdown: generatedMarkdown,
        code: generatedCode
      },
      systemMetrics: {
        ...state.systemMetrics,
        cpu: 18,
        memory: 43.1,
        dbConnections: 14,
        latency: 10,
        tokenThroughput: state.systemMetrics.rateLimitActive ? 0 : 350
      }
    }));

    addLog('Execution completed successfully. Vault artifact synchronized.', 'success');
  },

  oscillateMetrics: () => {
    set((state) => {
      if (state.isExecuting) return {}; // Skip during heavy agent run
      
      const cpuDelta = Math.floor(Math.random() * 7) - 3; // -3% to +3%
      const newCpu = Math.max(10, Math.min(85, state.systemMetrics.cpu + cpuDelta));

      const memDelta = parseFloat((Math.random() * 0.4 - 0.2).toFixed(1)); // -0.2% to +0.2%
      const newMem = Math.max(30, Math.min(90, parseFloat((state.systemMetrics.memory + memDelta).toFixed(1))));

      const latDelta = Math.floor(Math.random() * 5) - 2; // -2ms to +2ms
      const newLat = Math.max(5, Math.min(50, state.systemMetrics.latency + latDelta));

      // Handle Rate Limit Countdown and Throughput Oscillation
      let rateLimitCountdown = state.systemMetrics.rateLimitCountdown || 0;
      let rateLimitActive = state.systemMetrics.rateLimitActive || false;
      if (rateLimitActive && rateLimitCountdown > 0) {
        rateLimitCountdown -= 1;
        if (rateLimitCountdown === 0) {
          rateLimitActive = false;
        }
      }

      const tpDelta = Math.floor(Math.random() * 40) - 20; // -20 to +20
      const currentTp = state.systemMetrics.tokenThroughput ?? 350;
      const newTp = rateLimitActive ? 0 : Math.max(100, Math.min(800, currentTp + tpDelta));

      return {
        systemMetrics: {
          cpu: newCpu,
          memory: newMem,
          dbConnections: state.systemMetrics.dbConnections,
          latency: newLat,
          tokenThroughput: newTp,
          rateLimitActive,
          rateLimitCountdown
        }
      };
    });
  },

  setRateLimit: (active, countdown = 15) => {
    set((state) => ({
      systemMetrics: {
        ...state.systemMetrics,
        rateLimitActive: active,
        rateLimitCountdown: active ? countdown : 0,
        tokenThroughput: active ? 0 : 350
      }
    }));
  },

  resetMetrics: () => {
    set((state) => ({
      systemMetrics: {
        cpu: 24,
        memory: 42.8,
        dbConnections: 14,
        latency: 12,
        tokenThroughput: 350,
        rateLimitActive: false,
        rateLimitCountdown: 0
      }
    }));
  }
}));

export default useStore;
