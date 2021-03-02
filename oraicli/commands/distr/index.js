export default async (argv) => {
    const command = argv._.shift();
    if (command) {
        import('./commands/' + command).then(({ default: fn }) => fn(argv));
    }
};
