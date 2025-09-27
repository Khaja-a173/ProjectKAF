import { FastifyInstance } from "fastify";

export default async function eventsRoutes(fastify: FastifyInstance) {
  // GET /api/events/subscribe (Server-Sent Events)
  fastify.get("/subscribe", async (request, reply) => {
    // tenant_id can come from header or query
    const tenantId =
      (request.headers["x-tenant-id"] as string | undefined) ||
      (request.query as any)?.tenant_id;

    if (!tenantId) {
      return reply.code(400).send({ error: "tenant_id required (header X-Tenant-Id or query ?tenant_id=)" });
    }

    if (!fastify.redis) {
      return reply.code(500).send({ error: "Redis not configured" });
    }

    // Prepare SSE headers
    reply.raw.setHeader("Content-Type", "text/event-stream");
    reply.raw.setHeader("Cache-Control", "no-cache, no-transform");
    reply.raw.setHeader("Connection", "keep-alive");
    reply.raw.setHeader("X-Accel-Buffering", "no"); // for nginx
    reply.raw.flushHeaders?.();
    // keep the socket alive indefinitely for SSE
    (reply.raw as any).setTimeout?.(0);
    request.socket.setKeepAlive?.(true, 15000);

    // Helper to write SSE frames
    const send = (event: string, data: any) => {
      const payload = typeof data === "string" ? data : JSON.stringify(data);
      reply.raw.write(`event: ${event}\n`);
      reply.raw.write(`data: ${payload}\n\n`);
    };

    // Heartbeat to keep the connection alive (every 15s)
    const heartbeat = setInterval(() => {
      // comment frame as heartbeat
      reply.raw.write(`: ping ${Date.now()}\n\n`);
    }, 15000);

    // Create a dedicated subscriber
    const subscriber = fastify.redis.duplicate();
    subscriber.on("error", (err: any) => {
      // Log and keep the SSE alive; Fastify will still clean up on close
      request.log.error({ err }, "Redis subscriber error");
    });
    const channel = `orders:events:${tenantId}`;

    let closed = false;
    const cleanup = async () => {
      if (closed) return;
      closed = true;
      clearInterval(heartbeat);
      try {
        await subscriber.unsubscribe(channel);
        subscriber.removeAllListeners("message");
        subscriber.removeAllListeners("error");
      } catch {}
      try {
        subscriber.disconnect();
      } catch {}
      try {
        // End the reply only if still open
        if (!reply.raw.writableEnded) reply.raw.end();
      } catch {}
    };

    // Handle client disconnects (listen on reply socket only)
    reply.raw.on("close", cleanup);

    // Initial hello
    send("hello", { tenant_id: tenantId, ts: new Date().toISOString() });

    try {
      // Subscribe first; listener is attached via 'message' event
      await subscriber.subscribe(channel);
      subscriber.on("message", (ch: string, message: string) => {
        if (ch !== channel) return;
        try {
          const parsed = JSON.parse(message);
          send(parsed.event || "message", parsed);
        } catch {
          send("message", message);
        }
      });
    } catch (err) {
      request.log.error({ err, channel }, "SSE subscribe failed");
      clearInterval(heartbeat);
      try {
        if (!reply.raw.writableEnded) {
          return reply.code(500).send({ error: "subscribe_failed" });
        }
      } finally {
        await cleanup();
      }
      return;
    }

    // Keep the handler open forever (until 'close' triggers cleanup)
    await new Promise<void>(() => {});
  });
  // POST /api/events/publish
  fastify.post("/publish", async (request, reply) => {
    try {
      const { tenant_id, event, payload } = request.body as {
        tenant_id: string;
        event: string;
        payload: any;
      };

      if (!tenant_id || !event) {
        return reply.code(400).send({ error: "tenant_id and event are required" });
      }

      // Ensure Redis is available
      if (!fastify.redis) {
        return reply.code(500).send({ error: "Redis not configured" });
      }

      const channel = `orders:events:${tenant_id}`;
      const message = JSON.stringify({
        event,
        tenant_id,
        payload,
        ts: new Date().toISOString(),
      });

      await fastify.redis.publish(channel, message);

      return { published: true };
    } catch (err) {
      request.log.error({ err }, "Failed to publish event");
      return reply.code(500).send({ error: "failed_to_publish_event" });
    }
  });
}