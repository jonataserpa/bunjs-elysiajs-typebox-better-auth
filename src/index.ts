import app from './app';

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

console.log(`🚀 Payment API starting...`);
console.log(`📚 Documentation: http://${HOST}:${PORT}/docs`);
console.log(`🏥 Health Check: http://${HOST}:${PORT}/health`);

app.listen(
  {
    port: PORT,
    hostname: HOST,
  },
  () => {
    console.log(`✅ Payment API is running on http://${HOST}:${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📊 Process ID: ${process.pid}`);
  }
);
