import { getDB, saveDB } from '../db.js';

const agents = {
  'summarizer-v1': () => import('../agents/summarizer.js'),
  'code-reviewer-v1': () => import('../agents/codeReviewer.js'),
  'data-extractor-v1': () => import('../agents/dataExtractor.js')
};

export async function runAgentTask(sessionId, serviceId, buyerInput) {
  const db = getDB();
  console.log(`[AgentRunner] Starting task for ${sessionId}...`);

  try {
    const agentLoader = agents[serviceId];
    if (!agentLoader) throw new Error(`No agent found for service: ${serviceId}`);

    const agent = await agentLoader();
    const result = await agent.run(buyerInput);

    db.run('UPDATE orders SET status = ?, result = ? WHERE session_id = ?',
      ['completed', JSON.stringify(result), sessionId]);
    saveDB();
    console.log(`[AgentRunner] Task completed for order ${sessionId}`);
    return result;
  } catch (error) {
    console.error(`[AgentRunner] Task failed for order ${sessionId}:`, error);
    db.run('UPDATE orders SET status = ?, result = ? WHERE session_id = ?',
      ['failed', JSON.stringify({ error: error.message }), sessionId]);
    saveDB();
    throw error;
  }
}
