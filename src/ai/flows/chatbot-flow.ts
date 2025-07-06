
'use server';

import {z} from 'zod';

// This file has been modified to gracefully handle the absence of Genkit AI packages,
// which are causing installation errors in the current environment. This version
// provides multilingual, keyword-based responses to make the chatbot more helpful
// without relying on external packages that break the build.

// Helper to create a WAV file from raw PCM data. This avoids external dependencies.
function pcmToWav(pcmData: Buffer): string {
  const numChannels = 1;
  const sampleRate = 24000;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = pcmData.length;
  const fileSize = 36 + dataSize;

  const buffer = Buffer.alloc(44);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(fileSize, 4);
  buffer.write('WAVE', 8);

  // fmt chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Sub-chunk size
  buffer.writeUInt16LE(1, 20); // Audio format (1 for PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bytesPerSample * 8, 34); // Bits per sample

  // data chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  const wavBuffer = Buffer.concat([buffer, pcmData]);
  return 'data:audio/wav;base64,' + wavBuffer.toString('base64');
}

const responses = {
  en: {
    hello: "Hello! I'm the CryptoDx chatbot. You can ask me about topics like Blockchain, DeFi, Bitcoin, Ethereum, and NFTs.",
    bitcoin: 'Bitcoin (BTC) is the first decentralized cryptocurrency. It was created in 2009 by an unknown person or group using the name Satoshi Nakamoto. It operates on a proof-of-work blockchain, which is secured by a global network of computers.',
    ethereum: 'Ethereum is a decentralized, open-source blockchain with smart contract functionality. Its native cryptocurrency is Ether (ETH). Ethereum allows developers to build and deploy decentralized applications (dApps) and is currently secured by a proof-of-stake consensus mechanism.',
    nft: "A Non-Fungible Token (NFT) is a unique digital asset representing ownership of items like art, music, or videos. They are recorded on a blockchain, which provides a public proof of ownership. Unlike cryptocurrencies like Bitcoin, each NFT is unique and cannot be replaced with another.",
    blockchain: "A blockchain is a distributed, immutable ledger that records transactions in a secure and transparent way. It's a chain of blocks, where each block contains a list of transactions. Once a block is added to the chain, it cannot be altered, ensuring the integrity of the record.",
    defi: "DeFi, or Decentralized Finance, is a term for financial services built on blockchain technology. It aims to create an open and global financial system that doesn't rely on traditional central intermediaries like banks. DeFi applications include lending, borrowing, and trading assets.",
    wallet: "In crypto, a wallet is a digital tool that allows you to store, send, and receive cryptocurrencies. It holds your private keys, which are secret passwords that give you access to your assets on the blockchain. Examples include MetaMask and Trust Wallet. You are always in control of your own wallet and keys.",
    smart_contract: "A smart contract is a self-executing contract with the terms of the agreement directly written into code. They run on a blockchain, so they are stored on a public database and cannot be changed. Transactions that happen in a smart contract are processed by the blockchain, which means they can be sent automatically without a third party.",
    what_is_cryptodx: "CryptoDx is a decentralized exchange (DEX) interface. It provides tools for users to swap cryptocurrencies, provide liquidity, and explore the market, all while maintaining control of their own assets in their personal wallets.",
    blockchain_ai: "Blockchain AI combines artificial intelligence with blockchain technology. AI can analyze blockchain data for insights, improve security by detecting fraud, and automate smart contract execution. For example, AI could optimize DeFi yields or verify the authenticity of NFTs. This integration aims to create more intelligent, secure, and efficient decentralized systems.",
    help: "Due to a temporary configuration issue, my advanced AI is offline. However, I can provide high-quality information on many crypto topics. Try asking me questions like 'What is a blockchain?', 'Explain DeFi', or ask about specific cryptocurrencies like Bitcoin or Ethereum.",
    fallback: "I can answer many questions about crypto! Please try asking me something specific, like 'What is a smart contract?' or 'Tell me about Ethereum'. My advanced AI features are temporarily disabled, but my built-in knowledge is still quite good."
  },
  es: {
    hello: "¡Hola! Soy el chatbot de CryptoDx. Puedes preguntarme sobre temas como Blockchain, DeFi, Bitcoin, Ethereum y NFTs.",
    bitcoin: "Bitcoin (BTC) es la primera criptomoneda descentralizada. Fue creada en 2009 por una persona o grupo desconocido usando el nombre de Satoshi Nakamoto. Opera en una blockchain de prueba de trabajo, que está asegurada por una red global de computadoras.",
    ethereum: "Ethereum es una blockchain de código abierto y descentralizada con funcionalidad de contratos inteligentes. Su criptomoneda nativa es Ether (ETH). Ethereum permite a los desarrolladores construir y desplegar aplicaciones descentralizadas (dApps) y actualmente está asegurada por un mecanismo de consenso de prueba de participación.",
    nft: "Un Token No Fungible (NFT) es un activo digital único que representa la propiedad de artículos como arte, música o videos. Se registran en una blockchain, lo que proporciona una prueba pública de propiedad. A diferencia de las criptomonedas como Bitcoin, cada NFT es único y no puede ser reemplazado por otro.",
    blockchain: "Una blockchain es un libro de contabilidad distribuido e inmutable que registra las transacciones de forma segura y transparente. Es una cadena de bloques, donde cada bloque contiene una lista de transacciones. Una vez que un bloque se añade a la cadena, no puede ser alterado, asegurando la integridad del registro.",
    defi: "DeFi, o Finanzas Descentralizadas, es un término para los servicios financieros construidos sobre la tecnología blockchain. Su objetivo es crear un sistema financiero abierto y global que no dependa de intermediarios centrales tradicionales como los bancos. Las aplicaciones DeFi incluyen préstamos, empréstitos e intercambio de activos.",
    wallet: "En cripto, una billetera es una herramienta digital que te permite almacenar, enviar y recibir criptomonedas. Contiene tus claves privadas, que son contraseñas secretas que te dan acceso a tus activos en la blockchain. Ejemplos incluyen MetaMask y Trust Wallet. Siempre tienes el control de tu propia billetera y tus claves.",
    smart_contract: "Un contrato inteligente es un contrato autoejecutable con los términos del acuerdo escritos directamente en el código. Se ejecutan en una blockchain, por lo que se almacenan en una base de datos pública y no se pueden cambiar. Las transacciones que ocurren en un contrato inteligente son procesadas por la blockchain, lo que significa que se pueden enviar automáticamente sin un tercero.",
    what_is_cryptodx: "CryptoDx es una interfaz de intercambio descentralizado (DEX). Proporciona herramientas para que los usuarios intercambien criptomonedas, proporcionen liquidez y exploren el mercado, todo mientras mantienen el control de sus propios activos en sus billeteras personales.",
    blockchain_ai: "La IA de Blockchain combina la inteligencia artificial con la tecnología blockchain. La IA puede analizar datos de la blockchain para obtener información, mejorar la seguridad detectando fraudes y automatizar la ejecución de contratos inteligentes. Por ejemplo, la IA podría optimizar los rendimientos de DeFi o verificar la autenticidad de los NFTs. Esta integración busca crear sistemas descentralizados más inteligentes, seguros y eficientes.",
    help: "Debido a un problema de configuración temporal, mi IA avanzada está desconectada. Sin embargo, puedo proporcionar información de alta calidad sobre muchos temas de cripto. Intenta hacerme preguntas como '¿Qué es una blockchain?', 'Explica DeFi', o pregunta sobre criptomonedas específicas como Bitcoin o Ethereum.",
    fallback: "¡Puedo responder muchas preguntas sobre cripto! Por favor, intenta preguntarme algo específico, como '¿Qué es un contrato inteligente?' o 'Háblame de Ethereum'. Mis funciones avanzadas de IA están deshabilitadas temporalmente, pero mi conocimiento incorporado sigue siendo bastante bueno."
  },
  fr: {
    hello: "Bonjour ! Je suis le chatbot de CryptoDx. Vous pouvez me poser des questions sur des sujets comme la Blockchain, la DeFi, le Bitcoin, l'Ethereum et les NFT.",
    bitcoin: "Le Bitcoin (BTC) est la première cryptomonnaie décentralisée. Il a été créé en 2009 par une personne ou un groupe inconnu sous le nom de Satoshi Nakamoto. Il fonctionne sur une blockchain à preuve de travail, sécurisée par un réseau mondial d'ordinateurs.",
    ethereum: "L'Ethereum est une blockchain open-source et décentralisée avec une fonctionnalité de contrat intelligent. Sa cryptomonnaie native est l'Ether (ETH). Ethereum permet aux développeurs de créer et de déployer des applications décentralisées (dApps) et est actuellement sécurisé par un mécanisme de consensus de preuve d'enjeu.",
    nft: "Un Jeton Non Fongible (NFT) est un actif numérique unique représentant la propriété d'objets comme de l'art, de la musique ou des vidéos. Ils sont enregistrés sur une blockchain, ce qui fournit une preuve publique de propriété. Contrairement aux cryptomonnaies comme le Bitcoin, chaque NFT est unique et ne peut être remplacé par un autre.",
    blockchain: "Une blockchain est un registre distribué et immuable qui enregistre les transactions de manière sécurisée et transparente. C'est une chaîne de blocs, où chaque bloc contient une liste de transactions. Une vez qu'un bloc est ajouté à la chaîne, il ne peut pas être modifié, garantissant l'intégrité de l'enregistrement.",
    defi: "La DeFi, ou Finance Décentralisée, est un terme désignant les services financiers construits sur la technologie blockchain. Elle vise à créer un système financier ouvert et mondial qui ne dépend pas d'intermédiaires centraux traditionnels comme les banques. Les applications DeFi incluent le prêt, l'emprunt et l'échange d'actifs.",
    wallet: "En crypto, un portefeuille est un outil numérique qui vous permet de stocker, envoyer et recevoir des cryptomonnaies. Il détient vos clés privées, qui sont des mots de passe secrets vous donnant accès à vos actifs sur la blockchain. Les exemples incluent MetaMask et Trust Wallet. Vous êtes toujours en contrôle de votre propre portefeuille et de vos clés.",
    smart_contract: "Un contrat intelligent est un contrat auto-exécutable dont les termes de l'accord sont directement écrits dans le code. Ils s'exécutent sur une blockchain, ils sont donc stockés sur une base de données publique et ne peuvent pas être modifiés. Les transactions qui se produisent dans un contrat intelligent sont traitées par la blockchain, ce qui signifie qu'elles peuvent être envoyées automatiquement sans tiers.",
    what_is_cryptodx: "CryptoDx est une interface d'échange décentralisé (DEX). Elle fournit des outils aux utilisateurs pour échanger des cryptomonnaies, fournir des liquidités et explorer le marché, tout en gardant le contrôle de leurs propres actifs dans leurs portefeuilles personnels.",
    blockchain_ai: "L'IA Blockchain combine l'intelligence artificielle avec la technologie blockchain. L'IA peut analyser les données de la blockchain pour obtenir des informations, améliorer la sécurité en détectant la fraude et automatiser l'exécution des contrats intelligents. Par exemple, l'IA pourrait optimiser les rendements DeFi ou vérifier l'authenticité des NFT. Cette intégration vise à créer des systèmes décentralisés plus intelligents, sécurisés et efficaces.",
    help: "En raison d'un problème de configuration temporaire, mon IA avancée est hors ligne. Cependant, je peux fournir des informations de haute qualité sur de nombreux sujets crypto. Essayez de me poser des questions comme 'Qu'est-ce qu'une blockchain ?', 'Expliquez la DeFi', ou posez des questions sur des cryptomonnaies spécifiques comme le Bitcoin ou l'Ethereum.",
    fallback: "Je peux répondre à de nombreuses questions sur la crypto ! Essayez de me poser une question spécifique, comme 'Qu'est-ce qu'un contrat intelligent ?' ou 'Parlez-moi d'Ethereum'. Mes fonctionnalités d'IA avancées sont temporairement désactivées, mais mes connaissances intégrées sont toujours très bonnes."
  }
};


const ChatbotInputSchema = z.object({
  message: z.string().describe("The user's message to the chatbot."),
  language: z
    .string()
    .describe('The language code for the response (e.g., "en", "es").'),
  enableAudio: z.boolean().describe('Whether to generate an audio response.'),
});
export type ChatbotInput = z.infer<typeof ChatbotInputSchema>;

const ChatbotOutputSchema = z.object({
  response: z.string().describe("The chatbot's text response."),
  audio: z
    .string()
    .optional()
    .describe('The audio response as a base64-encoded WAV data URI.'),
});
export type ChatbotOutput = z.infer<typeof ChatbotOutputSchema>;

export async function askChatbot(input: ChatbotInput): Promise<ChatbotOutput> {
  // AI features are disabled due to a persistent package installation issue.
  // This function provides expanded, keyword-based responses as a fallback.
  console.warn("askChatbot was called, but AI features are disabled. Using multilingual fallback responses.");
  
  const lang = (input.language in responses ? input.language : 'en') as keyof typeof responses;
  const message = input.message.toLowerCase();
  const currentLangResponses = responses[lang];

  // Expanded keyword-based responses (keywords are still in English for simplicity)
  if (message.includes('hello') || message.includes('hi')) {
    return {
      response: currentLangResponses.hello,
    };
  }
  if (message.includes('bitcoin')) {
    return {
      response: currentLangResponses.bitcoin,
    };
  }
  if (message.includes('ethereum')) {
    return {
      response: currentLangResponses.ethereum,
    };
  }
  if (message.includes('nft')) {
    return {
        response: currentLangResponses.nft,
    }
  }
   if (message.includes('blockchain') && !message.includes('ai')) {
      return {
          response: currentLangResponses.blockchain,
      }
  }
  if (message.includes('defi')) {
      return {
          response: currentLangResponses.defi,
      }
  }
  if (message.includes('wallet')) {
      return {
          response: currentLangResponses.wallet,
      }
  }
  if (message.includes('smart contract')) {
      return {
          response: currentLangResponses.smart_contract,
      }
  }
  if (message.includes('what is cryptodx')) {
      return {
          response: currentLangResponses.what_is_cryptodx,
      }
  }
  if (message.includes('blockchain ai') || (message.includes('blockchain') && message.includes('ai'))) {
      return {
          response: currentLangResponses.blockchain_ai,
      }
  }
  if (message.includes('what can you do') || message.includes('help')) {
    return {
        response: currentLangResponses.help,
    }
  }

  // Refined default response
  return {
    response: currentLangResponses.fallback,
    audio: undefined,
  };
}
