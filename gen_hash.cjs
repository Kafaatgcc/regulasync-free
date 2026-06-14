const bcrypt = require('bcryptjs');
bcrypt.hash('Demo@2026!', 12).then(h => {
  console.log(h);
  process.exit(0);
});
