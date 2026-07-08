const WHISPER_MAX_BYTES = 25 * 1024 * 1024;
const TARGET_SAMPLE_RATE = 16000;

export type WhisperUpload = {
  blob: Blob;
  filename: string;
};

/**
 * Turns an uploaded video into the smallest thing Whisper will accept:
 * decode the audio track in the browser, downmix to 16 kHz mono, and encode
 * a PCM WAV (~1.9 MB/min — a 13-minute video still clears the 25 MB cap).
 * The video itself never leaves the browser. If the browser can't demux the
 * container's audio, fall back to sending the raw file when it's small
 * enough for Whisper to demux server-side.
 */
export async function prepareWhisperAudio(file: File): Promise<WhisperUpload> {
  const decoded = await decodeAudio(file);
  if (decoded) {
    const mono = await downmixTo16kMono(decoded);
    const wav = encodeWavPcm16(mono, TARGET_SAMPLE_RATE);
    if (wav.size <= WHISPER_MAX_BYTES) {
      return { blob: wav, filename: "audio.wav" };
    }
    throw new Error(
      "This video's audio track is too long to transcribe (over ~13 minutes).",
    );
  }
  if (file.size <= WHISPER_MAX_BYTES) {
    return { blob: file, filename: file.name || "video.mp4" };
  }
  throw new Error(
    "Couldn't read this video's audio track in the browser, and the file is over Whisper's 25 MB limit. Try an MP4 or WebM export.",
  );
}

async function decodeAudio(file: File): Promise<AudioBuffer | null> {
  const ctx = new AudioContext();
  try {
    return await ctx.decodeAudioData(await file.arrayBuffer());
  } catch {
    return null;
  } finally {
    void ctx.close();
  }
}

async function downmixTo16kMono(buffer: AudioBuffer): Promise<Float32Array> {
  const length = Math.ceil(buffer.duration * TARGET_SAMPLE_RATE);
  const offline = new OfflineAudioContext(1, length, TARGET_SAMPLE_RATE);
  const source = offline.createBufferSource();
  source.buffer = buffer;
  source.connect(offline.destination);
  source.start();
  const rendered = await offline.startRendering();
  return rendered.getChannelData(0);
}

function encodeWavPcm16(samples: Float32Array, sampleRate: number): Blob {
  const dataBytes = samples.length * 2;
  const buffer = new ArrayBuffer(44 + dataBytes);
  const view = new DataView(buffer);

  writeAscii(view, 0, "RIFF");
  view.setUint32(4, 36 + dataBytes, true);
  writeAscii(view, 8, "WAVE");
  writeAscii(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeAscii(view, 36, "data");
  view.setUint32(40, dataBytes, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i] ?? 0));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }
  return new Blob([buffer], { type: "audio/wav" });
}

function writeAscii(view: DataView, offset: number, text: string): void {
  for (let i = 0; i < text.length; i++) {
    view.setUint8(offset + i, text.charCodeAt(i));
  }
}
