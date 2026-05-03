import express from 'express';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SYSTEM_PROMPT = `Eres Juan de la Cosa, el famoso navegante y cartógrafo cántabro del siglo XV.
Tono: Valiente, sabio, aventurero y muy afectuoso con tu "tripulación" (los alumnos de 6-8 años).
Lenguaje: Usas expresiones marineras sencillas pero evocadoras ("¡Viento en popa!", "¡Por todos los cabos de Cantabria!", "¡Rayos y centellas, grumete!").
Atitud: Siempre animas a los niños. Nunca castigas el error, lo tratas como una "niebla en el mar" que pronto despejaremos juntos.
Rol: Capitán de una Nao que navega por la costa de Cantabria. Eres un guía de aprendizaje globalizado que conecta matemáticas, lengua, conocimiento del medio y plástica.
Objetivo: Convertir cada lección en una misión de a bordo para completar el "Gran Mapa de la Costa". Adaptar el desafío: 1º (6 años) frases sencillas; 2º (7-8 años) oraciones más largas o sumas/restas.
Formato: Brevedad (3-4 párrafos máximo). Termina SIEMPRE con una pregunta o reto.
Visual: Usa emojis náuticos (⚓, 🌊, ⛵, 🦀, 🗺️) para separar secciones.
Seguridad: No hables de temas violentos ni uses lenguaje complejo. No pidas datos personales.
Cantabria: Prioriza ejemplos locales (Santander, Santoña, San Vicente de la Barquera, el Faro de Caballo, etc.).`;

async function startServer() {
  const app = express();
  app.use(express.json());

  const apiKey = process.env.GOOGLE_GENAI_API_KEY;
  if (!apiKey) {
    console.error("GOOGLE_GENAI_API_KEY is not defined");
  }
  const ai = new GoogleGenAI({ apiKey: apiKey || '' });

  app.post('/api/chat', async (req, res) => {
    try {
      const { messages } = req.body;
      
      // Inject System Prompt in the first user message
      if (messages.length === 1 && messages[0].role === 'user') {
        messages[0].content = `${SYSTEM_PROMPT}\n\n${messages[0].content}`;
      }

      const chat = ai.chats.create({ 
        model: 'gemma-4-26b-a4b-it'
      });
      // The old messages need to be formatted for the chat history if using chat.sendMessage
      // Actually, for a simple chat, we can just use sendMessage(lastMessage)
      
      const lastMessage = messages[messages.length - 1].content;
      const response = await chat.sendMessage({ message: lastMessage });
      const responseText = response.text;
      
      res.json({ reply: responseText });
    } catch (error) {
      console.error('Chat error:', error);
      res.status(500).json({ error: 'Interferencias en la navegación: no pudimos recibir la respuesta' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(3000, '0.0.0.0', () => {
    console.log('Server running on http://localhost:3000');
  });
}

startServer();
