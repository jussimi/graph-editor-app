import app from './app';

const { PORT } = process.env;
app.listen(PORT, err => {
  if (err) {
    return console.error(err);
  }
  return console.log(`
    -------------------------------
      server is listening on ${PORT}
    -------------------------------
  `);
});
