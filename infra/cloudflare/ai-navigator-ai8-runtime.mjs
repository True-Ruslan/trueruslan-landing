import acceptedCorpus from '../../data/ai-index-accepted/ai5/chunks.json' with {type: 'json'};
import {handleRequest as handleRuntimeRequest} from './ai-navigator-runtime.mjs';

const AI8_RUNTIME_OPTIONS = Object.freeze({canonicalCorpus: acceptedCorpus});

export async function handleRequest(request, env, fetchImpl = globalThis.fetch) {
  return handleRuntimeRequest(request, env, fetchImpl, AI8_RUNTIME_OPTIONS);
}

export default {
  fetch(request, env) {
    return handleRequest(request, env, globalThis.fetch);
  },
};
