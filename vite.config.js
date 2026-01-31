export default {
    base: './',
    build: {
        outDir: 'docs',
        rollupOptions: {
            input: {
                main: 'index.html',
                slides: 'slides.html'
            }
        }
    }
}
