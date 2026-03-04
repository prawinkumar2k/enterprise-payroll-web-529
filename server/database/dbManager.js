
/**
 * dbManager — now a thin re-export of dualDB
 *
 * All existing controllers that import dbManager continue to work unchanged.
 * The actual implementation now lives in dualDB.js.
 */
import dualDB from './dualDB.js';

export default dualDB;
