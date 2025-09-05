import Vapi from "@vapi-ai/web";

const vapi = new Vapi("5b0c88e0-042c-44a9-a890-df75e96273fe");

// Start voice conversation
vapi.start("ca5f245a-378d-41d2-8eaa-1bd835f16ac6");

// Listen for events
vapi.on("call-start", () => console.log("Call started"));
vapi.on("call-end", () => console.log("Call ended"));
vapi.on("message", (message) => {
  if (message.type === "transcript") {
    console.log(`${message.role}: ${message.transcript}`);
  }
});
