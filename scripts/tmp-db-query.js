const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

(async () => {
    try {
        await ssh.connect({
            host: '208.109.62.140',
            username: 'nhs13h5k0x0j',
            password: 'Inspiron1999#',
            port: 22,
        });

        const cmd = `MYSQL_PWD=Inspiron1999# mysql -u nhs13h5k_krause -D nhs13h5k_krause -e "select id,email,user_type,status,password_hash from users where email='guillermo@krauser.com';"`;
        const res = await ssh.execCommand(cmd, { pty: true });
        console.log('STDOUT:\n', res.stdout || '(empty)');
        console.log('STDERR:\n', res.stderr || '(empty)');
    } catch (e) {
        console.error(e);
    } finally {
        ssh.dispose();
    }
})();
