var fs = require('fs');
var path = require('path');
var readline = require('readline');
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
var eslintConfigFileName;
var sailsConfigFileName;
// preset code style
var preset = null;

var readFile = function(fileName, cb) {
  switch (path.extname(fileName)) {
    case '':
      try {
        var config = JSON.parse(fs.readFileSync(fileName, 'utf-8'));
        cb(null, config);
      } catch (err) {
        cb(err);
      }
      break;
    case '.js':
    case '.json':
      try {
        var eslintConfigPath = fileName;
        var eslintConfig = require(eslintConfigPath);
        cb(null, eslintConfig);
      } catch (err) {
        cb(err);
      }
      break;
    default:
      console.error('readFile: Can\'t found the eslintrc file.');
  }
};

var writeFile = function(fileName, data) {
  switch (path.extname(fileName)) {
    case '':
    case '.json':
      fs.writeFileSync(eslintConfigFileName, data);
      break;
    case '.js':
      fs.writeFileSync(eslintConfigFileName, 'module.exports = ' + data);
      break;
    default:
      console.error('writeFile: Can\'t found the eslintrc file.');
  }
};

var updateEslintrc = function(err, config) {
  if (!err) {
    if (config.extends.indexOf(sailsConfigFileName) >= 0) {
      return;
    }
    if (!Array.isArray(config.extends))
      config.extends = [config.extends];
    if (preset && config.extends.indexOf(preset) < 0) {
      config.extends = config.extends.concat(preset);
    }
    config.extends = config.extends.concat(sailsConfigFileName);
    writeFile(eslintConfigFileName, JSON.stringify(config, null, '\t'));
  }
};

var establishEslintrc = function(answer) {
  switch (answer.trim()) {
    case 'yes':
    case 'y':
    case 'Y':
      fs.open(eslintConfigFileName, 'w', function(err) {
        if (err) {
          process.exit(0);
        }
        fs.writeFileSync(eslintConfigFileName,
          JSON.stringify({
            extends: [preset, sailsConfigFileName]
          }, null, '\t'));
      });
      break;
    case 'no':
    case 'n':
    case 'N':
      break;
    default:
      break;
  }
  rl.close();
};

exports.configureEslintrc = function(eFileName, sFileName, presetCodeStyle) {
  eslintConfigFileName = eFileName;
  sailsConfigFileName = sFileName;
  preset = presetCodeStyle;
  fs.exists(eslintConfigFileName, function(exists) {
    if (exists) {
      readFile(eslintConfigFileName, updateEslintrc);
      rl.close();
    } else {
      preset = preset ? preset : 'google';
      rl.question('Do you want to establish config file named ' +
        eslintConfigFileName +
        ' and set ' + preset + ' as default coding style(yes/no):  ',
        establishEslintrc);
    }
  });
};
