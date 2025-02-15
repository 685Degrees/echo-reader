import { useState, useCallback, useRef } from "react";

interface UseWebRTCReturn {
  isConnected: boolean;
  isConnecting: boolean;
  startSession: () => Promise<void>;
  sendMessage: (message: string) => void;
  error: string | null;
}

export const useWebRTC = (): UseWebRTCReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const dataChannel = useRef<RTCDataChannel | null>(null);
  const audioElement = useRef<HTMLAudioElement | null>(null);

  const startSession = useCallback(async () => {
    try {
      setIsConnecting(true);
      setError(null);
      console.log("Starting WebRTC session...");

      // Get ephemeral token from our backend
      console.log("Fetching ephemeral token from backend...");
      const tokenResponse = await fetch("http://localhost:3001/session", {
        method: "POST",
      });
      const data = await tokenResponse.json();
      console.log("Received session data from backend");
      const ephemeralKey = data.client_secret.value;

      // Create peer connection
      console.log("Creating RTCPeerConnection...");
      peerConnection.current = new RTCPeerConnection();

      // Set up audio element for remote stream
      audioElement.current = new Audio();
      audioElement.current.autoplay = true;

      // Handle remote audio stream
      peerConnection.current.ontrack = (event) => {
        console.log("Received remote track:", event.track.kind);
        if (audioElement.current) {
          audioElement.current.srcObject = event.streams[0];
        }
      };

      // Connection state changes
      peerConnection.current.onconnectionstatechange = () => {
        console.log(
          "Connection state changed:",
          peerConnection.current?.connectionState
        );
      };

      peerConnection.current.oniceconnectionstatechange = () => {
        console.log(
          "ICE connection state:",
          peerConnection.current?.iceConnectionState
        );
      };

      peerConnection.current.onicegatheringstatechange = () => {
        console.log(
          "ICE gathering state:",
          peerConnection.current?.iceGatheringState
        );
      };

      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          console.log("New ICE candidate:", event.candidate.candidate);
        }
      };

      // Add local audio track
      console.log("Requesting user media...");
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      console.log("Got local media stream");
      mediaStream.getTracks().forEach((track) => {
        if (peerConnection.current) {
          console.log("Adding local track:", track.kind);
          peerConnection.current.addTrack(track, mediaStream);
        }
      });

      // Create data channel
      console.log("Creating data channel...");
      dataChannel.current =
        peerConnection.current.createDataChannel("oai-events");

      dataChannel.current.onopen = () => {
        console.log("Data channel opened");
      };

      dataChannel.current.onclose = () => {
        console.log("Data channel closed");
      };

      dataChannel.current.onerror = (error) => {
        console.error("Data channel error:", error);
      };

      dataChannel.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log("Received message from data channel:", message);
      };

      // Create and set local description
      console.log("Creating offer...");
      const offer = await peerConnection.current.createOffer();
      console.log("Setting local description...");
      await peerConnection.current.setLocalDescription(offer);

      // Get remote description from OpenAI
      console.log("Sending offer to OpenAI...");
      const baseUrl = "https://api.openai.com/v1/realtime";
      const model = "gpt-4o-realtime-preview-2024-12-17";
      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${ephemeralKey}`,
          "Content-Type": "application/sdp",
        },
      });

      const answer = {
        type: "answer" as RTCSdpType,
        sdp: await sdpResponse.text(),
      };
      console.log("Received answer from OpenAI");

      console.log("Setting remote description...");
      await peerConnection.current.setRemoteDescription(answer);
      console.log("Remote description set successfully");

      setIsConnected(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to start WebRTC session"
      );
      console.error("WebRTC connection error:", err);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const sendMessage = useCallback((message: string) => {
    if (dataChannel.current?.readyState === "open") {
      const event = {
        type: "response.create",
        response: {
          modalities: ["audio", "text"],
          instructions: message,
        },
      };
      console.log("Sending message to data channel:", event);
      dataChannel.current.send(JSON.stringify(event));
    } else {
      console.error(
        "Cannot send message - data channel state:",
        dataChannel.current?.readyState
      );
      setError("Data channel is not open");
    }
  }, []);

  return {
    isConnected,
    isConnecting,
    startSession,
    sendMessage,
    error,
  };
};
