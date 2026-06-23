const sharp = require('sharp');
const sizes = [192, 512];
Promise.all(sizes.map(s =>
  sharp('icons/icon-'+s+'.svg').resize(s,s).png().toFile('icons/icon-'+s+'.png')
)).then(() => console.log('PNG icons created'));
