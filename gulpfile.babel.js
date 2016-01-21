// generated on 2016-01-15 using generator-gulp-webapp 1.1.1
import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import browserSync from 'browser-sync';
import del from 'del';
import {stream as wiredep} from 'wiredep';

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

gulp.task('styles', () => {
    return gulp.src('app/styles/*.scss')
        .pipe($.plumber())
        .pipe($.sourcemaps.init())
        .pipe($.sass.sync({
            outputStyle: 'expanded',
            precision: 10,
            includePaths: ['.']
        }).on('error', $.sass.logError))
        .pipe($.autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']}))
        .pipe($.sourcemaps.write())
        .pipe(gulp.dest('.tmp/styles'))
        .pipe(reload({stream: true}));
});

gulp.task('scripts', () => {
    return gulp.src('app/scripts/**/*.js')
        .pipe($.plumber())
        .pipe($.sourcemaps.init())
        .pipe($.babel())
        .pipe($.sourcemaps.write('.'))
        .pipe(gulp.dest('.tmp/scripts'))
        .pipe(reload({stream: true}));
});

function lint(files, options) {
    return () => {
        return gulp.src(files)
            .pipe(reload({stream: true, once: true}))
            .pipe($.eslint(options))
            .pipe($.eslint.format())
            .pipe($.if(!browserSync.active, $.eslint.failAfterError()));
    };
}
const testLintOptions = {
    env: {
        mocha: true
    }
};

gulp.task('lint', lint('app/scripts/**/*.js'));
gulp.task('lint:test', lint('test/spec/**/*.js', testLintOptions));

gulp.task('html', ['styles', 'scripts'], () => {
    return gulp.src('app/templates/*.html')
        .pipe($.data((file) => {
            // get data
            try {
                return {
                    global: yaml.safeLoad(fs.readFileSync('app/data/global.yaml', 'utf8')),
                    page: yaml.safeLoad(fs.readFileSync('app/data/' + path.basename(file.path) + '.yaml', 'utf8')),
                    runtime: {
                        date: {
                            year: new Date().getFullYear()
                        }
                    }
                }
            } catch (e) {
                console.log(e);
            }
        }))
        .pipe($.nunjucks.compile())
        .pipe($.useref({searchPath: ['.tmp', 'app', '.']}))
        .pipe($.if('*.js', $.uglify()))
        .pipe($.if('*.css', $.cssnano()))
        .pipe($.if('*.html', $.htmlmin({collapseWhitespace: true})))
        .pipe(gulp.dest('dist'));
});

gulp.task('templates', () => {
    return gulp.src('app/templates/*.html')
        .pipe($.data((file) => {
            // get data
            try {
                return {
                    global: yaml.safeLoad(fs.readFileSync('app/data/global.yaml', 'utf8')),
                    page: yaml.safeLoad(fs.readFileSync('app/data/' + path.basename(file.path) + '.yaml', 'utf8')),
                    runtime: {
                        date: {
                            year: new Date().getFullYear()
                        }
                    }
                }
            } catch (e) {
                console.log(e);
            }
        }))
        .pipe($.nunjucks.compile())
        .pipe(gulp.dest('.tmp'));
});

gulp.task('images', () => {
    return gulp.src('app/images/**/*')
        .pipe($.if($.if.isFile, $.cache($.imagemin({
            progressive: true,
            interlaced: true,
            // don't remove IDs from SVGs, they are often used
            // as hooks for embedding and styling
            svgoPlugins: [{cleanupIDs: false}]
        }))
                   .on('error', function (err) {
                       console.log(err);
                       this.end();
                   })))
        .pipe(gulp.dest('dist/images'));
});

gulp.task('fonts', () => {
    return gulp.src(require('main-bower-files')('**/*.{eot,svg,ttf,woff,woff2}', function (err) {})
                    .concat('app/fonts/**/*'))
        .pipe(gulp.dest('.tmp/fonts'))
        .pipe(gulp.dest('dist/fonts'));
});

gulp.task('extras', () => {
    return gulp.src([
        'app/*.*',
        '!app/*.html'
    ], {
        dot: true
    }).pipe(gulp.dest('dist'));
});

gulp.task('clean', function(cb){
    del.bind(null, ['.tmp', 'dist'])
    cb();
});

gulp.task('serve', ['templates', 'styles', 'scripts', 'fonts'], () => {
    browserSync({
        notify: false,
        port: 9000,
        server: {
            baseDir: ['.tmp', 'app'],
            routes: {
                '/bower_components': 'bower_components'
            }
        }
    });

    gulp.watch([
        '.tmp/*.html',
        '.tmp/scripts/**/*.js',
        'app/images/**/*',
        '.tmp/fonts/**/*'
    ]).on('change', reload);

    gulp.watch(['app/templates/*.html', 'app/data/*.yaml'], ['templates']);
    gulp.watch('app/styles/**/*.scss', ['styles']);
    gulp.watch('app/scripts/**/*.js', ['scripts']);
    gulp.watch('app/fonts/**/*', ['fonts']);
    gulp.watch('bower.json', ['wiredep', 'fonts']);
});

gulp.task('serve:dist', () => {
    browserSync({
        notify: false,
        port: 9000,
        server: {
            baseDir: ['dist']
        }
    });
});

gulp.task('serve:test', ['scripts'], () => {
    browserSync({
        notify: false,
        port: 9000,
        ui: false,
        server: {
            baseDir: 'test',
            routes: {
                '/scripts': '.tmp/scripts',
                '/bower_components': 'bower_components'
            }
        }
    });

    gulp.watch('app/scripts/**/*.js', ['scripts']);
    gulp.watch('test/spec/**/*.js').on('change', reload);
    gulp.watch('test/spec/**/*.js', ['lint:test']);
});

// inject bower components
gulp.task('wiredep', () => {
    gulp.src('app/styles/*.scss')
        .pipe(wiredep({
            ignorePath: /^(\.\.\/)+/
        }))
        .pipe(gulp.dest('app/styles'));

    gulp.src('app/templates/*.html')
        .pipe(wiredep({
            exclude: ['bootstrap-sass'],
            ignorePath: /^(\.\.\/)*\.\./
        }))
        .pipe(gulp.dest('app/templates'));
});

gulp.task('build', ['lint', 'html', 'images', 'fonts', 'extras'], (cb) => {
    return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));

    cb();
});

gulp.task('default', ['clean', 'build']);

// publish to S3 bucket
// https://www.npmjs.com/package/gulp-awspublish
gulp.task('publish:staging', ['clean', 'build'], function(){
    var publisher = $.awspublish.create({
        params: {
            Bucket: 'jsgroup.cimolini.com'
        }
    });

    var headers = {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        // 'Pragma': 'no-cache',
        'Expires': 0
    };

    return gulp.src('./dist/**')
        .pipe(publisher.publish(headers))
        .pipe(publisher.cache()) // create a cache file to speed up consecutive uploads
        .pipe($.awspublish.reporter()); // print upload updates to console
});

// publish to S3 bucket
gulp.task('publish:production', function(){
    var publisher = $.awspublish.create({
        params: {
            Bucket: 'jsgroup.com'
        }
    });

    var headers = {
        'Cache-Control': 'max-age=315360000, no-transform, public'
    };

    return gulp.src('./dist/**')
        .pipe(publisher.publish(headers))
        .pipe(publisher.cache()) // create a cache file to speed up consecutive uploads
        .pipe($.awspublish.reporter()); // print upload updates to console
});

