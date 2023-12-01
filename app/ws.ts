import { createClient } from "graphql-ws";

export const getClient = () =>
  createClient({
    url: "ws://localhost:4000/graphql",
    webSocketImpl: WebSocket,
  });
