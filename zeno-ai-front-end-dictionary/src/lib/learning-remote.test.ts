import test from 'node:test';
import assert from 'node:assert/strict';
import { createLearningRemote, type LearningRpcClient } from './learning-remote';
import { emptyState } from './study';
import { readCommutePlan } from './review-plan';

function clientRace() {
  let account = 'A'; let rpcCalls = 0;
  const sent: { name: string; ownerAtDispatch: string; authorization: string; args: Record<string, unknown> | undefined }[] = [];
  const client = {
    auth: { async getSession() { return { data: { session: { user: { id: account }, access_token: `test-token-${account}` } }, error: null }; } },
    rpc(name: string, args?: Record<string, unknown>) {
      rpcCalls++; account = 'B';
      const headers = new Map<string, string>();
      const builder = {
        setHeader(name: string, value: string) { headers.set(name, value); return builder; },
        abortSignal(_signal: AbortSignal) { return builder; },
        then<TResult1 = { data: unknown; error: unknown }, TResult2 = never>(yes?: ((value: { data: unknown; error: unknown }) => TResult1 | PromiseLike<TResult1>) | null, no?: ((error: unknown) => TResult2 | PromiseLike<TResult2>) | null) {
          sent.push({ name, ownerAtDispatch: account, authorization: headers.get('Authorization') ?? `Bearer test-token-${account}`, args });
          return Promise.resolve({ data: { ok: true, revision: 1, state: emptyState(), settings: readCommutePlan(null) }, error: null }).then(yes, no);
        },
      };
      return builder;
    },
  } satisfies LearningRpcClient;
  return { client, sent, calls: () => rpcCalls, setAccount: (owner: string) => { account = owner; } };
}

test('read RPC stays bound to A bearer when auth changes to B before dispatch', async () => {
  const fixture = clientRace(); await createLearningRemote(fixture.client).get('A');
  assert.equal(fixture.sent[0].ownerAtDispatch, 'B'); assert.equal(fixture.sent[0].authorization, 'Bearer test-token-A'); assert.equal(fixture.sent[0].name, 'get_learning_state');
});
test('write RPC pins A bearer and canonical Seoul settings across auth token races', async () => {
  const fixture = clientRace(); await createLearningRemote(fixture.client).push({ ownerId: 'A', expectedRevision: 5, study: emptyState(), settings: readCommutePlan(null), importId: null, mutationId: '00000000-0000-4000-8000-000000000001' });
  assert.equal(fixture.sent[0].authorization, 'Bearer test-token-A'); assert.equal(fixture.sent[0].args?.p_expected_revision, 5); assert.deepEqual(fixture.sent[0].args?.p_settings, { ...readCommutePlan(null), timeZone: 'Asia/Seoul' });
  assert.equal(fixture.sent[0].args?.p_mutation_id, '00000000-0000-4000-8000-000000000001'); assert.equal(fixture.sent[0].args?.p_import_id, null);
});
test('identity mismatch refuses both RPCs before constructing any request', async () => {
  const fixture = clientRace(); fixture.setAccount('B'); const remote = createLearningRemote(fixture.client);
  await assert.rejects(remote.get('A'), /Account changed/);
  await assert.rejects(remote.push({ ownerId: 'A', expectedRevision: 0, study: emptyState(), settings: readCommutePlan(null), importId: null }), /Account changed/);
  assert.equal(fixture.calls(), 0);
});
