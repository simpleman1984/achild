module.exports = function (ctx) {
    const Q = ctx.requireCordovaModule('q'),
    path = ctx.requireCordovaModule('path'),
    fs = ctx.requireCordovaModule('fs'),
    cp = ctx.requireCordovaModule('child_process'),
    os = ctx.requireCordovaModule('os'),
    ifaces = os.networkInterfaces(),
    spawn = cp.spawn,
    exec = cp.exec,
    pRoot = ctx.opts.projectRoot;

    let defer = new Q.defer()

    console.info('_________', 'module.exports')

    let h5Root = path.join(__dirname, '..', 'src')

    console.info(h5Root)

    let run = 'npm run build'
    let args = []
    let outText = ''
    let isResultFound = false
    let devServerSpawn = spawn(run, args, {
        shell: true,
        cwd: h5Root,
        stdio: [process.stdin, 'pipe', process.stderr]
    })

    devServerSpawn.on('error', (err) => {
        console.error(err)
        defer.reject(err)
    })

    devServerSpawn.stdout.on('data', (data) => {
        process.stdout.write(data)
        outText += data
        // defer.resolve()
        if (!isResultFound) {
            if(outText.indexOf("file:// won't work.") != -1) {
                isResultFound = true
                outText = ''
                defer.resolve()
            }
        }
    })

    return defer.promise
}