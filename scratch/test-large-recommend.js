const Groq = require('groq-sdk');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const match = env.match(/GROQ_API_KEY=(.+)/);
const apiKey = match ? match[1].trim() : '';

const groq = new Groq({ apiKey });

async function testLargePrompt() {
  console.log('Testing Groq with ~600 movie exclusion & taste list...');
  // Generate 600 movie titles
  const sampleTitles = [];
  for (let i = 1; i <= 600; i++) {
    sampleTitles.push(`Película Test ${i} (20${(i % 24).toString().padStart(2, '0')})`);
  }
  // Add some real classics
  sampleTitles.push('The Godfather', 'Pulp Fiction', 'The Dark Knight', 'Inception', 'Fight Club', 'Forrest Gump', 'The Matrix', 'Goodfellas', 'Interstellar', 'Parasite');

  const system = "Eres CineBot, el curador cinematográfico de FilmTracker. Respondes en JSON.";
  const prompt = `
HISTORIAL Y CATÁLOGO DEL USUARIO (${sampleTitles.length} títulos):
${sampleTitles.join(', ')}

INSTRUCCIONES:
El usuario es un cinéfilo con más de 600 películas vistas.
Analiza sus gustos de cine de autor y suspenso psicológico.
Recomienda exactamente 5 películas reconocidas o de culto que NO estén en la lista anterior.
Responde con JSON: {"recommendations": [{"title": "...", "year": 2020, "reason": "...", "vibe": "..."}]}
  `;

  const start = Date.now();
  try {
    const res = await groq.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      temperature: 0.7,
      max_tokens: 1500,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: prompt }
      ]
    });
    console.log(`Success in ${(Date.now() - start) / 1000}s!`);
    console.log(res.choices[0]?.message?.content);
  } catch (e) {
    console.error('Error:', e.message);
  }
}

testLargePrompt();
