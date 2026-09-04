import type { AgentEvent, AgentProfile, ModelConfig } from '@easyai/contracts';
import type { OpcaiTool, ToolPolicy } from '@easyai/tools';
import { summarizeSessionMemory as summarizeSessionMemoryImpl } from './context-compaction.js';

export * from './skills.js';
export * from './mcp-runtime.js';
export * from './skill-runtime.js';
export * from './context-compaction.js';
export * from './search-runtime.js';
export * from './knowledge-runtime.js';
export * from './experience/index.js';
export * from './pi-model.js';
export * from './pi-tools.js';
export * from './pi-skills.js';
export { streamAgentReply, DEFAULT_RUN_TIMEOUT_MS } from './pi-runtime.js';

/**
 * EasyAI agent boundary.
 * Loop: pi-agent-core / pi-ai · Tools: TypeBox AgentTool · Skills: pi-coding-agent
 * Compaction / session memory: pi generateSummary (+ convertToLlm)
 */
export interface AgentRuntime {
  start(input: { profile: AgentProfile; prompt: string; tools: OpcaiTool[] }): AsyncIterable<AgentEvent>;
  cancel(runId: string): void;
}

export class PolicyEngine implements ToolPolicy {
  requiresApproval(risk: OpcaiTool['risk']): boolean {
    return risk !== 'read';
  }
}

export const defaultProfile: AgentProfile = {
  id: 'general',
  name: 'General Assistant',
  instructions: 'You are a helpful assistant.',
  toolIds: [],
};

/** Durable session-memory summarizer (ModelConfig → plain turns) via pi. */
export async function summarizeSessionMemory(input: {
  model: ModelConfig;
  previousSummary?: string;
  turns: Array<{ role: 'user' | 'assistant'; content: string }>;
}): Promise<string | null> {
  return summarizeSessionMemoryImpl(input);
}
