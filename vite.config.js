export default {
    base: './',
    build: {
        outDir: 'docs',
        rollupOptions: {
            input: {
                main: 'index.html',
                landing: 'landing.html'
            }
        }
    }
}
