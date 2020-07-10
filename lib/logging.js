
/**
 * Logs something. Disable console logging during testing.
 * 
 * @param  {...any} args See console.log args
 */

function log(...args) { 
    if ( process.env.NODE_ENV !== 'test' ) return console.log(...args);
}

module.exports = { log };