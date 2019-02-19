/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

const SHA256 = require('crypto-js/sha256');
const LevelSandbox = require('./LevelSandbox.js');
const Block = require('./Block.js');

class Blockchain {

    constructor() {
        this.db = new LevelSandbox.LevelSandbox();
        this.generateGenesisBlock();
    }

    // Generate Genesis Block. (WORKS)
    /*=================================================================/
    /   Attempts to create Genesis Block if Blockchain Height === 0.   /
    /   If successful returns the persisted Genesis Block as a String. /
    /=================================================================*/
    async generateGenesisBlock() {
        //1 Check height of current blockchain on levelDB
        //2 if height === 0 then create the genesis block

        //1
        const chainHeight = await this.getBlockHeight();

        //2
        if (chainHeight === 0) {
            let newBlock = new Block.Block(`Genesis Block.`);
            newBlock.height = 0;
            newBlock.time = new Date().getTime().toString().slice(0, -3);
            newBlock.previousBlockHash = '';
            newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();

            //Don't call addBlock() for the Genesis Block
            //Statically type the code to create it within this method

            console.log(newBlock);
            return await this.db
                .addLevelDBData(newBlock.height, JSON.stringify(newBlock))
                .then(persistedBlock => {
                    // console.log(`New Block Persisted to the Blockchain = ${persistedBlock}`);
                    return persistedBlock;
                })
                .catch(console.log);
        }
    }




    // Get Block Height. (WORKS)
    /*=================================================================/
    /   Attempts to GET the Blockchain height.                         /
    /   If successful returns the height as an Integar.                /
    /=================================================================*/
    async getBlockHeight() {
        // Add your code here
        return await this.db.getBlocksCount();
    }




    // Add new Block. (WORKS)
    /*================================================================/
    /   Attempts to persist a new Block to the levelDB "blockchain".  /
    /   and returns the new Block as a String if successful.          /
    /================================================================*/
    async addBlock(newBlock) {
        // Add your code here
        // console.log('\nAttempting to add new Block to the blockchain...\n');

        //1 Set newBlock.height
        //2 Set newBlock.time
        //3 Retrieve the last persisted block on the blockchain
        //4 JSON.parse() the last persisted block on the blockchain to access it's hash value. Use this for the newBlock.previousBlockHash
        //5 Set the newBlock.hash using SHA256().toString()
        //6 Persist the newBlock to the levelDB blockchain
        //7 Return the async Function (this will be a Resolved Promise)
        //8 Deal with any Errors


        //1
        newBlock.height = await this.getBlockHeight();
        // console.log('newBlock.height = ' + newBlock.height);

        //2
        newBlock.time = new Date().getTime().toString().slice(0,-3);
        // console.log('newBlock.time = ' + newBlock.time);

        // console.log(newBlock.body);

        //3
        let previousBlock = await this.getBlock(newBlock.height - 1);
        // console.log('previousBlock = ' + previousBlock);

        //4
        newBlock.previousBlockHash = JSON.parse(previousBlock).hash;
        // console.log('previousBlockHash = ' + newBlock.previousBlockHash);

        //5
        newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
        // console.log('newBlock.hash = ' + newBlock.hash);


        //6
        return await this.db
            .addLevelDBData(newBlock.height, JSON.stringify(newBlock))
            .then(persistedBlock => {
                //7
                // console.log(`\nBlock persisted to the levelDB Blockchain: ${persistedBlock}\n`);
                return new Promise (resolve => resolve(persistedBlock)).catch(console.log);
            })
            .catch(err => {
                //8
                return new Promise((resolve, reject) => reject(err)).catch(console.log);
            });


    }




    // Get Block By Height. (WORKS)
    /*=================================================================/
    /   Attempts to GET a Block from the Blockchain by it's height.    /
    /   If successful returns the Block as a String.                   /
    /=================================================================*/
    async getBlock(height) {
        // Add your code here
        return await new Promise((resolve, reject) => {
            this.db.getLevelDBData(height)
                .then(block => {
                    resolve(block);
                })
                .catch(reject);
        });

    }




    // Validate if Block is being tampered by Block Height. (WORKS)
    /*=================================================================/
    /   Gets a Block using it's height.                                /
    /   Then attempts to validate that Block.                          /
    /   Returns a boolean true or false.                               /
    /=================================================================*/
    async validateBlock(height) {
        // Add your code here

        //1 retrieve block from levelDB
        //2 transform block to JavaScript Object using JSON.parse(block)
        //3 store the block.hash locally for later reference
        //4 reassign block.hash to an empty string (because when the block.hash was initalised block.hash = '';
        //5 perform a SHA256 hash on the reassigned block (above) and finally .toString()
        //6 Check that the hash in //5 === the locally stored hash from //3


        //1
        const blockFromDB = await this.getBlock(height);

        //2
        let blockObject = JSON.parse(blockFromDB);

        //3
        const originalHash = blockObject.hash;

        //4
        blockObject.hash = '';

        //5
        const reHash = SHA256(JSON.stringify(blockObject)).toString();

        //6
        if(originalHash === reHash) {
            // the validation === true.
            return true;
        } else if(originalHash !== reHash) {
            // validation failed.
            return false;
        }


    }





    async checkPreviousHash(){

        const chainHeight = await this.getBlockHeight();
        const validatedList = [];
        const invalidList = [];

        for(let i = 0; i < chainHeight; i++){

            if(i === 0){

            }

            if(i > 0){
                const a = await this.getBlock(i).then(block => JSON.parse(block));
                const b = await this.getBlock(i - 1).then(block => JSON.parse(block));


                if(a.previousBlockHash === b.hash){
                    validatedList.push(a.height);
                } else {
                    invalidList.push(a.height);
                }
            }
        }


        return new Promise((resolve, reject) => {

            if(invalidList.length > 0){
                reject(`Block ${invalidList[0]} did not pass the validateChain method.`)
            } else {
                resolve(true)
            }
        });
    }






    // Validate the entire Blockchain using validateBlock loop. (WORKS)
    /*=================================================================/
    /   Get's chain height and uses height to iterate with for loop    /
    /   Fills a Promise.all with validateBlock()'s.                    /
    /   Returns the boolean true or false.                             /
    /   true = chain validated.                                        /
    /   false = chain corrupt.                                         /
    /=================================================================*/
    async validateChain() {
        const self = this;
        return new Promise((resolve, reject) => {
            self.getBlockHeight()
                .then(height => {
                    let promiseArray = [];
                    for(let i = 0; i < height; i++){
                        promiseArray.push(self.validateBlock(i));
                        if(promiseArray.length === height){
                            return promiseArray;
                        }
                    }
                })
                .then(promiseArray => {
                    return Promise.all(promiseArray);
                })
                .then(resultsOfPromiseAll => {
                    // if we are in this code block then all individual blocks have had their hash's recalculated and validated.
                    return this.checkPreviousHash().then(resolve).catch(reject);
                })
                .catch(e => {
                    console.log(`An error has occurred in validateChain = ${e}`);
                    reject(false);
                });
        });
    }




    // Utility Method to Tamper a Block for Test Validation
    // This method is for testing purpose
    _modifyBlock(height, block) {
        let self = this;
        return new Promise( (resolve, reject) => {
            self.db
                .addLevelDBData(height, JSON.stringify(block).toString())
                .then((blockModified) => {
                    resolve(blockModified);
                })
                .catch((err) => {
                    console.log(err); reject(err)
                });
        });
    }

    async getBlockChain(){
        const chainHeight = await this.getBlockHeight();

        const fullChain = [];

        for(let i = 0; i < chainHeight; i++){
            await this.getBlock(i)
                .then(block => {
                    fullChain.push(block)
                })
                .catch(console.log);
        }

        return new Promise((resolve, reject) => {
            if(chainHeight === fullChain.length){
                resolve(fullChain);
            } else {
                reject(`The full blockchain could not be retuned. Please review the code in _getBlockChain()_ method inside of Blockchain class.`);
            }
        });
    }

}





module.exports.Blockchain = Blockchain;



