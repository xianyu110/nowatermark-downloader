export const LOCAL_TRANSCRIPTION_PREPROCESS_THRESHOLD = 24 * 1024 * 1024;
export const TRANSCRIPTION_PROVIDER_MAX_BYTES = 25 * 1024 * 1024;

const TRANSCRIPTION_AUDIO_BITRATE = 48_000;

export class LocalMediaPreparationError extends Error {
  code: 'unsupported' | 'too_large' | 'failed';

  constructor(code: LocalMediaPreparationError['code'], message: string) {
    super(message);
    this.name = 'LocalMediaPreparationError';
    this.code = code;
  }
}

function buildAudioFilename(filename: string) {
  const basename = filename.replace(/\.[^.]+$/, '').trim() || 'video';
  return `${basename}-audio.mp3`;
}

export async function prepareLocalTranscriptionMedia(
  file: File,
  onProgress?: (progress: number) => void
) {
  if (file.size <= LOCAL_TRANSCRIPTION_PREPROCESS_THRESHOLD) return file;

  const [media, mp3Encoder] = await Promise.all([
    import('mediabunny'),
    import('@mediabunny/mp3-encoder'),
  ]);

  if (!(await media.canEncodeAudio('mp3'))) {
    mp3Encoder.registerMp3Encoder();
  }

  const input = new media.Input({
    source: new media.BlobSource(file),
    formats: media.ALL_FORMATS,
  });
  const target = new media.BufferTarget();
  const output = new media.Output({
    format: new media.Mp3OutputFormat(),
    target,
  });

  try {
    const conversion = await media.Conversion.init({
      input,
      output,
      tracks: 'primary',
      video: { discard: true },
      audio: {
        codec: 'mp3',
        bitrate: TRANSCRIPTION_AUDIO_BITRATE,
        forceTranscode: true,
        numberOfChannels: 1,
        sampleRate: 16_000,
      },
    });

    if (!conversion.isValid) {
      throw new LocalMediaPreparationError(
        'unsupported',
        'The browser could not decode the audio track in this video.'
      );
    }

    conversion.onProgress = (progress) => {
      onProgress?.(Math.max(0, Math.min(1, progress)));
    };
    await conversion.execute();

    if (!target.buffer?.byteLength) {
      throw new LocalMediaPreparationError(
        'unsupported',
        'No usable audio track was found in this video.'
      );
    }
    if (target.buffer.byteLength > TRANSCRIPTION_PROVIDER_MAX_BYTES) {
      throw new LocalMediaPreparationError(
        'too_large',
        'The extracted audio is still too large for online transcription.'
      );
    }

    return new File([target.buffer], buildAudioFilename(file.name), {
      type: 'audio/mpeg',
      lastModified: file.lastModified,
    });
  } catch (error) {
    if (error instanceof LocalMediaPreparationError) throw error;
    throw new LocalMediaPreparationError(
      'failed',
      'The browser could not prepare this video for transcription.'
    );
  } finally {
    input.dispose();
  }
}
