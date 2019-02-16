/* ===== Persist data with LevelDB ==================
|  Learn more: level: https://github.com/Level/level |
/===================================================*/

const level = require('level');
const chainDB = './chaindata';


class LevelSandbox {

    constructor() {
        this.db = level(chainDB);
    }

    // Get data from levelDB with key (Promise)
    getLevelDBData(key){
        let self = this;
        return new Promise(function(resolve, reject) {
            // Add your code here, remember in Promises you need to resolve() or reject()
            return self.db.get(key)
                .then(resolve)
                .catch(reject);
        });
    }

    // Add data to levelDB with key and value (Promise)
    async addLevelDBData(key, value) {
        let self = this;

        return await new Promise(function(resolve, reject) {
            // Add your code here, remember in Promises you need to resolve() or reject()
            return self.db.put(key, value, function(err) {
                if(err) reject(err);

                //success!
                self.db.get(key, function(err, value) {
                    if(err) {
                        console.log(err);
                        reject(err);
                    }

                    //retrieved the doc!
                    resolve(value);
                })
        });
        });
    }

    // Method that return the height
    getBlocksCount() {
        let self = this;
        return new Promise(function(resolve, reject){
            // Add your code here, remember in Promises you need to resolve() or reject()
            let height = 0;
            self.db.createReadStream()
                .on('data', function (data) {
                    height++;
                })
                .on('error', function (err) {
                    reject(err)
                })
                .on('close', function () {
                    /* Resolve the final height once stream completes. */
                    resolve(height);
                })
                .on('end', function () {
                    // console.log('Stream ended')
                })
        });
    }
        

}

module.exports = {LevelSandbox};
