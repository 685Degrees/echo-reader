import { useState, useCallback, useRef } from "react";

interface UseWebRTCReturn {
  isConnected: boolean;
  isConnecting: boolean;
  startSession: () => Promise<void>;
  stopSession: () => void;
  error: string | null;
}

interface BookContextParams {
  text: string;
  currentPosition: number;
  title: string;
}

function createBookContext({
  text,
  currentPosition,
  title,
}: BookContextParams): string {
  // Get the bounds for context
  const prevContextStart = Math.max(0, currentPosition - 1000);
  const nextContextEnd = Math.min(text.length, currentPosition + 200);

  // Extract the context
  const previousContext = text.slice(prevContextStart, currentPosition);
  const nextContext = text.slice(currentPosition, nextContextEnd);

  // Format the prompt with the context
  const prompt = `
Title of the book: ${title}

<previous_context>
${previousContext}
</previous_context>

<current_position> → </current_position>

<upcoming_context>
${nextContext}
</upcoming_context>
`.trim();

  return prompt;
}

function createReadingCompanionPrompt(bookContext: string): string {
  const prompt = `
You are a Literary Companion, an expert facilitator of meaningful discussions about literature. Your role is to engage readers in thoughtful conversation and answer questions.

Key Principles:
- Use the Socratic method to guide discovery rather than lecturing
- Draw connections across literature, philosophy, and personal experience
- Validate multiple interpretations while encouraging textual evidence
- Never reveal or discuss content the reader hasn't reached yet
- Keep your responses to 30 words or less
- Keep your tone conversational, colloquial, and friendly

Please engage with the reader about the text they've completed so far, focusing on:
- Themes and symbolism in the completed text
- Character development and relationships shown
- Literary devices and writing techniques observed
- Relevant historical or philosophical connections
- Thoughtful questions to deepen understanding

Remember to:
- Only discuss content from the previous context
- Use the current position as your reference point
- Never reveal or hint at upcoming content
- Adjust your analysis to the reader's current position in the story

Here's where the reader is in the text:
${bookContext}
`.trim();

  return prompt;
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
        // Send session configuration with server VAD enabled
        if (dataChannel.current?.readyState === "open") {
          const config = {
            type: "session.update",
            session: {
              modalities: ["text", "audio"],
              instructions: createReadingCompanionPrompt(
                createBookContext({
                  text: `CHAPTER ONE
The Sound of the Shell

The boy with fair hair lowered himself down the last few feet of rock and began to pick his way toward the lagoon. Though he had taken off his school sweater and trailed it now from one hand, his grey shirt stuck to him and his hair was plastered to his forehead. All round him the long scar smashed into the jungle was a bath of heat. He was clambering heavily among the creepers and broken trunks when a bird, a vision of red and yellow, flashed upwards with a witch-like cry; and this cry was echoed by another.

"Hi!" it said. "Wait a minute!"

The undergrowth at the side of the scar was shaken and a multitude of raindrops fell pattering.

"Wait a minute," the voice said. "I got caught up."

The fair boy stopped and jerked his stockings with an automatic gesture that made the jungle seem for a moment like the Home Counties. The voice spoke again.

"I can't hardly move with all these creeper things."

The owner of the voice came backing out of the undergrowth so that twigs scratched on a greasy wind-breaker. The naked crooks of his knees were plump, caught and scratched by thorns. He bent down, removed the thorns carefully, and turned around. He was shorter than the fair boy and very fat. He came forward, searching out safe lodgments for his feet, and then looked up through thick spectacles.

"Where's the man with the megaphone?"

The fair boy shook his head. "This is an island. At least I think it's an island. That's a reef out in the sea. Perhaps there aren't any grownups anywhere."

The fat boy looked startled. "There was that pilot. But he wasn't in the passenger cabin, he was up in front."

The fair boy was peering at the reef through screwed-up eyes.

"All them other kids," the fat boy went on. "Some of them must have got out. They must have, mustn't they?"

The fair boy began to pick his way as casually as possible toward the water. He tried to be offhand and not too obviously uninterested, but the fat boy hurried after him.

"Aren't there any grownups at all?"

"I don't think so."

The fair boy said this solemnly; but then the delight of a realized ambition overcame him. In the middle of the scar he stood on his head and grinned at the reversed fat boy.

"No grownups!"

The fat boy thought for a moment. "That pilot."

The fair boy allowed his feet to come down and sat on the steamy earth.

"He must have flown off after he dropped us. He couldn't land here. Not in a place with wheels."

"We was attacked!"

"He'll be back all right."

The fat boy shook his head. "When we was coming down I looked through one of them windows. I saw the other part of the plane. There were flames coming out of it." He looked up and down the scar. "And this is what the cabin done."

The fair boy reached out and touched the jagged end of a trunk. For a moment he looked interested.

"What happened to it?" he asked. "Where's it got to now?"

"That storm dragged it out to sea. It wasn't half dangerous with all them tree trunks falling. There must have been some kids still in it."

He hesitated for a moment, then spoke again. "What's your name?"

"Ralph."

The fat boy waited to be asked his name in turn but this proffer of acquaintance was not made; the fair boy called Ralph smiled vaguely, stood up, and began to make his way once more toward the lagoon. The fat boy hung steadily at his shoulder.

"I expect there's a lot more of us scattered about. You haven't seen any others, have you?"

Ralph shook his head and increased his speed. Then he tripped over a branch and came down with a crash. The fat boy stood by him, breathing hard.

"My auntie told me not to run," he explained, "on account of my asthma."

"Ass-mar?"

"That's right. Can't catch my breath. I was the only boy in our school what had asthma," said the fat boy with a touch of pride. "And I've been wearing specs since I was three."

He took off his glasses and held them out to Ralph, blinking and smiling, and then started to wipe them against his grubby wind-breaker. An expression of pain and inward concentration altered the pale contours of his face. He smeared the sweat from his cheeks and quickly adjusted the spectacles on his nose.

"Them fruit." He glanced round the scar. "Them fruit," he said, "I expect―" He put on his glasses, waded away from Ralph, and crouched down among the tangled foliage.

"I'll be out again in just a minute―" Ralph disentangled himself cautiously and stole away through the branches. In a few seconds the fat boy's grunts were behind him and he was hurrying toward the screen that still lay between him and the lagoon. He climbed over a broken trunk and was out of the jungle. The shore was fledged with palm trees. These stood or leaned or reclined against the light and their green feathers were a hundred feet up in the air. The ground beneath them was a bank covered with coarse grass, torn everywhere by the upheavals of fallen trees, scattered with decaying coconuts and palm saplings. Behind this was the darkness of the forest proper and the open space of the scar. Ralph stood, one hand against a grey trunk, and screwed up his eyes against the shimmering water. Out there, perhaps a mile away, the white surf flinked on a coral reef, and beyond that the open sea was dark blue. Within the irregular arc of coral the lagoon was still as a mountain lake―blue of all shades and shadowy green and purple. The beach between the palm terrace and the water was a thin stick, endless apparently, for to Ralph's left the perspectives of palm and beach and water drew to a point at infinity; and always, almost visible, was the heat. He jumped down from the terrace. The sand was thick over his black shoes and the heat hit him. He became conscious of the weight of clothes, kicked his shoes off fiercely and ripped off each stocking with its elastic garter in a single movement. Then he leapt back on the terrace, pulled off his shirt, and stood there among the skull-like coconuts with green shadows from the palms and the forest sliding over his skin. He undid the snake-clasp of his belt, lugged off his shorts and pants, and stood there naked, looking at the dazzling beach and the water. He was old enough, twelve years and a few months, to have lost the prominent tummy of childhood and not yet old enough for adolescence to have made him awkward. You could see now that he might make a boxer, as far as width and heaviness of shoulders went, but there was a mildness about his mouth and eyes that proclaimed no devil. He patted the palm trunk softly, and, forced at last to believe in the reality of the island laughed delightedly again and stood on his head. He turned neatly on to his feet, jumped down to the beach, knelt and swept a double armful of sand into a pile against his chest. Then he sat back and looked at the water with bright, excited eyes. "Ralph―" The fat boy lowered himself over the terrace and sat down carefully, using the edge as a seat. "I'm sorry I been such a time. Them fruit―" He wiped his glasses and adjusted them on his button nose. The frame had made a deep, pink "V" on the bridge. He looked critically at Ralph's golden body and then down at his own clothes. He laid a hand on the end of a zipper that extended down his chest.`,
                  currentPosition: 200,
                  title: "Lord of the Flies",
                })
              ),
              turn_detection: {
                type: "server_vad",
                threshold: 0.5,
                prefix_padding_ms: 300,
                silence_duration_ms: 500,
                create_response: true,
              },
            },
          };
          console.log("Sending session config:", config);
          dataChannel.current.send(JSON.stringify(config));
        }
      };

      dataChannel.current.onclose = () => {
        console.log("Data channel closed");
        setIsConnected(false);
      };

      dataChannel.current.onerror = (error) => {
        console.error("Data channel error:", error);
        setError("Data channel error occurred");
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

  const stopSession = useCallback(() => {
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    if (dataChannel.current) {
      dataChannel.current.close();
      dataChannel.current = null;
    }
    if (audioElement.current) {
      audioElement.current.srcObject = null;
      audioElement.current = null;
    }
    setIsConnected(false);
  }, []);

  return {
    isConnected,
    isConnecting,
    startSession,
    stopSession,
    error,
  };
};
