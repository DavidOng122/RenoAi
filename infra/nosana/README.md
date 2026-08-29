# Nosana role

RenoAI uses Qwen as its online AI provider. Nosana is reserved for the future asynchronous GPU evidence-processing worker: extracting representative frames from uploaded videos and producing evidence metadata before those frames are sent to Qwen.

Do not place Nosana in the synchronous Problem Brief or pricing request path. The worker requires persistent media storage first; current browser-only object URLs cannot be processed by a remote deployment.

Required future server-only secret:

```text
NOSANA_API_KEY
```
