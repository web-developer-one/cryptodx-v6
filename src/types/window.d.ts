
// This declaration file is used to extend the global Window object
// with non-standard properties used by the Web Speech API.

interface Window {
  // For standard-compliant browsers
  SpeechRecognition: any;
  // For older WebKit-based browsers like Chrome
  webkitSpeechRecognition: any;
}
