import { createApp } from './app/server';

const PORT = Number(process.env.PORT ?? 3000);

const app = createApp();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend listening on http://0.0.0.0:${PORT}`);
});
