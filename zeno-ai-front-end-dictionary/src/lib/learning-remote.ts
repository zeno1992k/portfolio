import type { LearningRemote, RemoteReply } from './learning-store';

interface Session { user: { id: string }; access_token: string }
interface RpcResult { data: unknown; error: unknown }
interface RpcRequest extends PromiseLike<RpcResult> {
  setHeader(name: string, value: string): RpcRequest;
  abortSignal(signal: AbortSignal): RpcRequest;
}
export interface LearningRpcClient {
  auth: { getSession(): Promise<{ data: { session: Session | null }; error: unknown }> };
  rpc(name: string, args?: Record<string, unknown>): RpcRequest;
}

/** Pin credentials to the expected account; the SDK's shared auth can change mid-request. */
export function createLearningRemote(client: LearningRpcClient): LearningRemote {
  async function call(ownerId: string, name: string, args?: Record<string, unknown>): Promise<RemoteReply> {
    const { data: auth, error: authError } = await client.auth.getSession();
    if (authError || !auth.session || auth.session.user.id !== ownerId) throw new Error('Account changed');
    const bearer = auth.session.access_token;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const { data, error } = await client.rpc(name, args)
        .setHeader('Authorization', `Bearer ${bearer}`)
        .abortSignal(controller.signal);
      if (error) throw error;
      return data as RemoteReply;
    } finally { clearTimeout(timer); }
  }
  return {
    get: ownerId => call(ownerId, 'get_learning_state'),
    push: request => call(request.ownerId, 'push_learning_state', {
      p_expected_revision: request.expectedRevision,
      p_state: request.study,
      p_settings: { ...request.settings, timeZone: 'Asia/Seoul' },
      p_import_id: request.importId,
      p_mutation_id: request.mutationId ?? null,
    }),
  };
}
