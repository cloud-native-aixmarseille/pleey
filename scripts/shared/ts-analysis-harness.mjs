import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const workspaceRoot = path.resolve(import.meta.dirname, '..', '..');
const DEFAULT_SOURCE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];
const DEFAULT_IGNORED_DIRECTORIES = new Set(['node_modules', 'dist', 'coverage']);
const typeScriptCache = new Map();

function defaultShouldCheckAppFile(relativePath) {
  if (relativePath.startsWith('src/app/')) {
    return false;
  }

  if (relativePath.startsWith('src/test-utils/')) {
    return false;
  }

  if (relativePath.includes('/generated/')) {
    return false;
  }

  return !/\.(test|spec)\.[jt]sx?$/.test(relativePath);
}

const DEFAULT_APP_PROJECT_DEFINITIONS = {
  frontend: {
    rootCandidates: [path.join(workspaceRoot, 'application/frontend'), '/usr/src/app'],
    sourceRootRelativePath: 'src',
    label: 'Frontend',
    shouldCheckFile: defaultShouldCheckAppFile,
  },
  backend: {
    rootCandidates: [path.join(workspaceRoot, 'application/backend'), '/usr/src/app'],
    sourceRootRelativePath: 'src',
    label: 'Backend',
    shouldCheckFile: defaultShouldCheckAppFile,
  },
};

function resolveProjectRoot(project) {
  const root = project.rootCandidates.find((candidate) =>
    fs.existsSync(path.join(candidate, project.sourceRootRelativePath)),
  );

  if (!root) {
    throw new Error(`Unable to locate ${project.label} source root.`);
  }

  return root;
}

function resolveAppProject(projectName, overrides = {}) {
  const definition = DEFAULT_APP_PROJECT_DEFINITIONS[projectName];

  if (!definition) {
    throw new Error(`Unsupported project "${projectName}".`);
  }

  const project = {
    ...definition,
    ...overrides,
  };

  return {
    ...project,
    root: resolveProjectRoot(project),
  };
}

function loadTypeScriptFromDirectory(directory) {
  const resolvedDirectory = path.resolve(directory);
  const cached = typeScriptCache.get(resolvedDirectory);

  if (cached) {
    return cached;
  }

  const requireFromDirectory = createRequire(path.join(resolvedDirectory, 'package.json'));
  const ts = requireFromDirectory('typescript');
  typeScriptCache.set(resolvedDirectory, ts);

  return ts;
}

function createTypeScriptCompilerOptions(ts, { allowJs = true } = {}) {
  return {
    allowJs,
    jsx: ts.JsxEmit.ReactJSX,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    target: ts.ScriptTarget.Latest,
  };
}

function toPosix(filePath) {
  return filePath.split(path.sep).join('/');
}

function toProjectRelative(project, filePath) {
  return toPosix(path.relative(project.root, filePath));
}

function shouldAnalyzeAppFile(project, filePath) {
  const relativePath = toProjectRelative(project, filePath);

  return (
    relativePath.startsWith(`${project.sourceRootRelativePath}/`) && project.shouldCheckFile(relativePath)
  );
}

function walkFiles(directory, options = {}) {
  const {
    extensions = DEFAULT_SOURCE_EXTENSIONS,
    files = [],
    ignoredDirectories = DEFAULT_IGNORED_DIRECTORIES,
  } = options;
  const extensionSet = new Set(extensions);
  const ignoredDirectorySet =
    ignoredDirectories instanceof Set ? ignoredDirectories : new Set(ignoredDirectories);

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      if (ignoredDirectorySet.has(entry.name)) {
        continue;
      }

      walkFiles(absolutePath, {
        extensions,
        files,
        ignoredDirectories: ignoredDirectorySet,
      });
      continue;
    }

    if (extensionSet.has(path.extname(entry.name))) {
      files.push(absolutePath);
    }
  }

  return files;
}

function walkProjectSourceFiles(project, options = {}) {
  return walkFiles(path.join(project.root, project.sourceRootRelativePath), options);
}

function loadTsConfigProgram(ts, projectRoot, options = {}) {
  const { configFileName = 'tsconfig.json', compilerOptions = { noEmit: true } } = options;
  const configPath = path.join(projectRoot, configFileName);
  const configFile = ts.readConfigFile(configPath, ts.sys.readFile);

  if (configFile.error) {
    throw new Error(ts.flattenDiagnosticMessageText(configFile.error.messageText, '\n'));
  }

  const parsedConfig = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    projectRoot,
    compilerOptions,
    configPath,
  );

  if (parsedConfig.errors.length > 0) {
    throw new Error(
      parsedConfig.errors
        .map((error) => ts.flattenDiagnosticMessageText(error.messageText, '\n'))
        .join('\n'),
    );
  }

  return ts.createProgram({
    rootNames: parsedConfig.fileNames,
    options: parsedConfig.options,
  });
}

function loadTypeScriptProjectConfiguration(ts, options) {
  const { currentDirectory, fallbackFileNames, fallbackCompilerOptions } = options;
  const configPath = ts.findConfigFile(currentDirectory, ts.sys.fileExists, 'tsconfig.json');
  const fallback = {
    compilerOptions: fallbackCompilerOptions,
    fileNames: fallbackFileNames,
  };

  if (!configPath) {
    return fallback;
  }

  const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
  if (configFile.error) {
    return fallback;
  }

  const parsedConfig = ts.parseJsonConfigFileContent(configFile.config, ts.sys, path.dirname(configPath));
  return {
    compilerOptions: parsedConfig.options,
    fileNames: [...new Set([...parsedConfig.fileNames.map((file) => path.resolve(file)), ...fallbackFileNames])],
  };
}

function createTypeScriptLanguageService(ts, options) {
  const { currentDirectory, fileNames, compilerOptions } = options;
  const scriptVersions = new Map(fileNames.map((file) => [file, '0']));

  const host = {
    directoryExists: ts.sys.directoryExists?.bind(ts.sys),
    fileExists: ts.sys.fileExists,
    getCompilationSettings: () => compilerOptions,
    getCurrentDirectory: () => currentDirectory,
    getDefaultLibFileName: (settings) => ts.getDefaultLibFilePath(settings),
    getDirectories: ts.sys.getDirectories?.bind(ts.sys),
    getScriptFileNames: () => fileNames,
    getScriptSnapshot: (fileName) => {
      if (!fs.existsSync(fileName)) {
        return undefined;
      }

      return ts.ScriptSnapshot.fromString(fs.readFileSync(fileName, 'utf8'));
    },
    getScriptVersion: (fileName) => scriptVersions.get(fileName) ?? '0',
    readDirectory: ts.sys.readDirectory.bind(ts.sys),
    readFile: ts.sys.readFile.bind(ts.sys),
  };

  return ts.createLanguageService(host, ts.createDocumentRegistry());
}

export {
  DEFAULT_APP_PROJECT_DEFINITIONS,
  createTypeScriptCompilerOptions,
  createTypeScriptLanguageService,
  loadTsConfigProgram,
  loadTypeScriptFromDirectory,
  loadTypeScriptProjectConfiguration,
  resolveAppProject,
  shouldAnalyzeAppFile,
  toPosix,
  toProjectRelative,
  walkFiles,
  walkProjectSourceFiles,
};