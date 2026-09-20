/**
 * Multilingual Hospital Voice Announcement Service (English & Malayalam)
 * Uses Web Audio API for realistic procedural hospital attention chimes
 * and Web Speech API (SpeechSynthesis) for token announcements.
 */

// Procedural Hospital Attention Chime generator using Web Audio API
export function playHospitalChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();
    const now = ctx.currentTime;

    // Note 1: E5 (659.25 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.3, now + 0.05);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.65);

    // Note 2: B4 (493.88 Hz) - playing slightly after
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(493.88, now + 0.25);
    gain2.gain.setValueAtTime(0, now + 0.25);
    gain2.gain.linearRampToValueAtTime(0.35, now + 0.3);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.95);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.25);
    osc2.stop(now + 1.0);

  } catch (err) {
    console.warn('Web Audio Chime failed or user has not interacted with page yet:', err);
  }
}

/**
 * Phonetic formatter for clear speech synthesis
 */
function formatTokenForSpeech(tokenNumber) {
  // Turn "GM-104" into "G M 1 0 4" or "General Medicine 104"
  if (!tokenNumber) return '';
  return tokenNumber.split('').join(' ');
}

/**
 * Announce Token in English and/or Malayalam
 */
export function announceToken({
  tokenNumber,
  counterNumber,
  departmentName = 'General Medicine',
  language = 'bilingual', // 'en', 'ml', 'bilingual'
  rate = 0.9,
  pitch = 1.0,
  volume = 1.0,
  onStart = () => {},
  onEnd = () => {},
}) {
  if (!('speechSynthesis' in window)) {
    console.warn('SpeechSynthesis is not supported in this browser.');
    return;
  }

  // Play chime first
  playHospitalChime();

  // Wait 600ms after chime to start speech
  setTimeout(() => {
    window.speechSynthesis.cancel(); // Stop any pending utterance

    const voices = window.speechSynthesis.getVoices();
    
    // Find Malayalam voice or Indian English / fallback voice
    const mlVoice = voices.find(v => v.lang.includes('ml') || v.name.toLowerCase().includes('malayalam')) ||
                    voices.find(v => v.lang.includes('hi') || v.lang.includes('en-IN')) || null;

    const enVoice = voices.find(v => v.lang.includes('en-IN')) ||
                    voices.find(v => v.lang.startsWith('en')) || null;

    const utterances = [];

    // English Announcement
    if (language === 'en' || language === 'bilingual') {
      const enText = `Attention please. Token number ${tokenNumber}, please proceed to Counter ${counterNumber}.`;
      const enUtterance = new SpeechSynthesisUtterance(enText);
      enUtterance.rate = rate;
      enUtterance.pitch = pitch;
      enUtterance.volume = volume;
      enUtterance.lang = 'en-IN';
      if (enVoice) enUtterance.voice = enVoice;
      utterances.push(enUtterance);
    }

    // Malayalam Announcement
    if (language === 'ml' || language === 'bilingual') {
      // Malayalam text: "ശ്രദ്ധിക്കുക. ടോക്കൺ നമ്പർ [token], കൗണ്ടർ [counter] ലേക്ക് ദയവായി വരിക."
      const mlText = `ശ്രദ്ധിക്കുക. ടോക്കൺ നമ്പർ ${tokenNumber}, കൗണ്ടർ ${counterNumber} ലേക്ക് ദയവായി വരിക.`;
      const mlUtterance = new SpeechSynthesisUtterance(mlText);
      mlUtterance.rate = rate * 0.95;
      mlUtterance.pitch = pitch;
      mlUtterance.volume = volume;
      mlUtterance.lang = 'ml-IN';
      if (mlVoice) mlUtterance.voice = mlVoice;
      utterances.push(mlUtterance);
    }

    if (utterances.length === 0) return;

    onStart();

    utterances.forEach((utt, idx) => {
      if (idx === utterances.length - 1) {
        utt.onend = () => onEnd();
        utt.onerror = () => onEnd();
      }
      window.speechSynthesis.speak(utt);
    });

  }, 650);
}

/**
 * Text script representations for TV captions
 */
export function getAnnouncementCaptions(tokenNumber, counterNumber, departmentName) {
  return {
    english: `Token Number ${tokenNumber} — Please proceed to Counter ${counterNumber} (${departmentName})`,
    malayalam: `ടോക്കൺ നമ്പർ ${tokenNumber} — കൗണ്ടർ ${counterNumber} ലേക്ക് ദയവായി വരിക (${departmentName})`,
  };
}
