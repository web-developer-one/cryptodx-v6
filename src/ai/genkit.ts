
'use server';

// The genkit packages are failing to install due to a persistent
// npm registry issue. To allow the app to build, the package has been removed
// and this file now exports a placeholder object.
// As a result, all AI features will be disabled and show a fallback message.

export const ai = {};
