var fs = require('fs-extra');
var path = require('path');
var spawn = require('cross-spawn');
var pathExists = require('path-exists');
var chalk = require('chalk');

var packagesToInstallInApp = [
  'react',
  'react-dom',
];

module.exports = function(appPath, appName, verbose, originalDirectory) {
  var ownPackageName = require(path.join(__dirname, '..', 'package.json')).name;
  var ownPath = path.join(appPath, 'node_modules', ownPackageName);
  var appPackage = require(path.join(appPath, 'package.json'));
  var useYarn = pathExists.sync(path.join(appPath, 'yarn.lock'));

  // Copy over some of the devDependencies
  appPackage.dependencies = appPackage.dependencies || {};
  appPackage.devDependencies = appPackage.devDependencies || {};

  // Setup the script rules
  appPackage.scripts = {
    'start': 'accurapp-scripts start',
    'build': 'accurapp-scripts build',
    'test': 'accurapp-scripts test --env=jsdom',
    'eject': 'accurapp-scripts eject',
    'postinstall': '[ -f node_modules/.bin/eslint ] || ln -s -f ../eslint/bin/eslint.js node_modules/.bin/eslint',
  };

  fs.writeFileSync(
    path.join(appPath, 'package.json'),
    JSON.stringify(appPackage, null, 2)
  );

  var readmeExists = pathExists.sync(path.join(appPath, 'README.md'));
  if (readmeExists) {
    fs.renameSync(path.join(appPath, 'README.md'), path.join(appPath, 'README.old.md'));
  }

  // Copy the files for the user
  fs.copySync(path.join(ownPath, 'template'), appPath);

  // Rename gitignore after the fact to prevent npm from renaming it to .npmignore
  // See: https://github.com/npm/npm/issues/1862
  fs.move(path.join(appPath, 'gitignore'), path.join(appPath, '.gitignore'), [], function (err) {
    if (err) {
      // Append if there's already a `.gitignore` file there
      if (err.code === 'EEXIST') {
        var data = fs.readFileSync(path.join(appPath, 'gitignore'));
        fs.appendFileSync(path.join(appPath, '.gitignore'), data);
        fs.unlinkSync(path.join(appPath, 'gitignore'));
      } else {
        throw err;
      }
    }
  });

  // Run yarn or npm for react and react-dom
  // TODO: having to do two npm/yarn installs is bad, can we avoid it?
  var command;
  var args;

  if (useYarn) {
    command = 'yarn';
    args = ['add'];
  } else {
    command = 'npm';
    args = [
      'install',
      '--save',
      verbose && '--verbose'
    ].filter(function(e) { return e; });
  }
  args.push.apply(args, packagesToInstallInApp);

  console.log('Installing project packages using ' + command + '...');
  console.log();

  var proc = spawn(command, args, {stdio: 'inherit'});
  proc.on('close', function (code) {
    if (code !== 0) {
      console.error('`' + command + ' ' + args.join(' ') + '` failed');
      return;
    }

    // Display the most elegant way to cd.
    // This needs to handle an undefined originalDirectory for
    // backward compatibility with old global-cli's.
    var cdpath;
    if (originalDirectory &&
        path.join(originalDirectory, appName) === appPath) {
      cdpath = appName;
    } else {
      cdpath = appPath;
    }

    console.log();
    console.log('Success! Created ' + appName + ' at ' + appPath);
    console.log('Inside that directory, you can run several commands:');
    console.log();
    console.log(chalk.cyan('  ' + command + ' start'));
    console.log('    Starts the development server.');
    console.log();
    console.log(chalk.cyan('  ' + command + ' run build'));
    console.log('    Bundles the app into static files for production.');
    console.log();
    console.log(chalk.cyan('  ' + command + ' test'));
    console.log('    Starts the test runner.');
    console.log();
    console.log(chalk.cyan('  ' + command + ' run eject'));
    console.log('    Removes this tool and copies build dependencies, configuration files');
    console.log('    and scripts into the app directory. If you do this, you can’t go back!');
    console.log();
    console.log('We suggest that you begin by typing:');
    console.log();
    console.log(chalk.cyan('  cd'), cdpath);
    console.log('  ' + chalk.cyan(command + ' start'));
    if (readmeExists) {
      console.log();
      console.log(chalk.yellow('You had a `README.md` file, we renamed it to `README.old.md`'));
    }
    console.log();
    console.log('Happy hacking!');
  });
};
