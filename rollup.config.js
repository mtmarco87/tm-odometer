import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import fs from 'fs-extra';
import path from 'path';
import pkg from './package.json';
import copy from 'rollup-plugin-copy';
import { rimraf } from 'rimraf';

// Define the output directory name by removing the "-lib" suffix
// Development package is "tm-odometer-lib" but published as "tm-odometer"
const pkgName = pkg.name.replace(/-lib$/g, '');

// Ensure output directories exist
fs.ensureDirSync(`dist/${pkgName}/cjs`);
fs.ensureDirSync(`dist/${pkgName}/esm`);
fs.ensureDirSync(`dist/${pkgName}/umd`);
fs.ensureDirSync(`dist/${pkgName}/themes`);

// JS bundle configurations
const createJSConfig = (format, outputPath, minify = false) => {
    const outputFile = `dist/${pkgName}/${outputPath}`;
    const outputDir = path.dirname(outputFile);

    const outputOptions = {
        name: 'TmOdometer',
        file: outputFile,
        format,
        exports: 'auto',
        sourcemap: true
    };

    if (format === 'umd') {
        outputOptions.footer = 'if(typeof window !== "undefined" && window.TmOdometer){window.Odometer = TmOdometer;}';
    }

    return {
        input: 'src/public-api.ts',
        output: outputOptions,
        plugins: [
            nodeResolve(),
            commonjs(),
            typescript({
                tsconfig: './tsconfig.json',
                declaration: false,
                compilerOptions: {
                    outDir: outputDir
                }
            }),
            minify && terser({
                output: {
                    preamble: `/*! ${pkg.name} v${pkg.version} | ${pkg.license} License */`
                }
            })
        ].filter(Boolean)
    };
};

// Generate TypeScript declaration files
const generateDeclarations = {
    input: 'src/public-api.ts',
    output: {
        file: `dist/${pkgName}/types/${pkgName}.js`,
        format: 'es',
        sourcemap: false,
    },
    plugins: [
        typescript({
            tsconfig: './tsconfig.json',
            declaration: true,
            declarationDir: `dist/${pkgName}/types`,
            emitDeclarationOnly: true
        })
    ]
};

// Finalize the build by copying necessary files
const finalize = {
    input: 'src/finalize.js', // This file doesn't need to exist
    output: {
        file: `dist/${pkgName}/temp/finalize.js` // This file won't actually be created
    },
    plugins: [
        {
            name: 'finalize-plugin',
            resolveId(id) {
                if (id === 'src/finalize.js') return id;
                return null;
            },
            load(id) {
                if (id === 'src/finalize.js') return 'export default {}';
                return null;
            }
        },
        copy({
            targets: [
                // Create a modified package.json for publishing
                {
                    src: 'package.json',
                    dest: `dist/${pkgName}`,
                    transform: (contents) => {
                        const pkg = JSON.parse(contents.toString());

                        pkg.name = pkgName

                        // Inject keywords directly
                        pkg.keywords = [
                            "tm-odometer",
                            "animated-counter",
                            "odometer",
                            "counter",
                            "javascript-library",
                            "typescript",
                            "numeric-animation",
                            "decimal-precision",
                            "customizable-themes",
                            "smooth-transitions",
                            "lightweight-library",
                            "tm-ng-odometer"
                        ];

                        // Dynamically inject the fields
                        pkg.main = `cjs/${pkgName}.js`;
                        pkg.module = `esm/${pkgName}.js`;
                        pkg.browser = `umd/${pkgName}.js`;
                        pkg.unpkg = `umd/${pkgName}.min.js`;
                        pkg.jsdelivr = `umd/${pkgName}.min.js`;
                        pkg.types = `types/public-api.d.ts`;

                        // Set the exports field
                        pkg.exports = {
                            ".": {
                                "import": `./esm/${pkgName}.js`,
                                "require": `./cjs/${pkgName}.js`,
                                "default": `./cjs/${pkgName}.js`,
                                "types": `./types/public-api.d.ts`
                            },
                            "./themes/*": "./themes/*"
                        };

                        // Set the files field to include all relevant directories
                        pkg.files = [
                            "cjs", "esm", "umd", "legacy", "types", "themes"
                        ];

                        // Remove development-only fields
                        delete pkg.private;
                        delete pkg.publishConfig;
                        delete pkg.devDependencies;
                        delete pkg.scripts;

                        return JSON.stringify(pkg, null, 2);
                    }
                },
                // Copy README and LICENSE
                { src: 'README.md', dest: `dist/${pkgName}` },
                { src: 'LICENSE', dest: `dist/${pkgName}` }
            ]
        })
    ]
};

// Cleanup temporary files after the build
const cleanup = {
    input: 'src/cleanup.js',
    output: {
        file: `dist/${pkgName}/temp/cleanup.js`
    },
    plugins: [
        {
            name: 'cleanup-plugin',
            resolveId(id) {
                if (id === 'src/cleanup.js') return id;
                return null;
            },
            load(id) {
                if (id === 'src/cleanup.js') return 'export default {}';
                return null;
            },
            closeBundle() {
                rimraf.sync(`dist/${pkgName}/temp`);
                rimraf.sync(`dist/${pkgName}/types/${pkgName}.js`);
                console.log('Cleanup completed: removed temporary files');
            }
        }
    ]
};

// Create all bundle configurations
export default [
    // ESM builds
    createJSConfig('es', `esm/${pkgName}.js`),
    createJSConfig('es', `esm/${pkgName}.min.js`, true),

    // CommonJS builds
    createJSConfig('cjs', `cjs/${pkgName}.js`),
    createJSConfig('cjs', `cjs/${pkgName}.min.js`, true),

    // UMD builds
    createJSConfig('umd', `umd/${pkgName}.js`),
    createJSConfig('umd', `umd/${pkgName}.min.js`, true),

    // TypeScript declaration files
    generateDeclarations,

    // Finalization
    finalize,

    // Cleanup
    cleanup
];
