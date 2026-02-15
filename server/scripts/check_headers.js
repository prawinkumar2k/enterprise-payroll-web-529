
async function checkStats() {
    const res = await fetch('http://localhost:5001/api/health');
    console.log('Headers:', [...res.headers.entries()]);
}
checkStats();
