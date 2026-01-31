export default {
    base: './',
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: {
                main: 'index.html',
                landing: 'landing.html'
            }
        }
    }
}
