//Notes

class Blockchain {

    constructor () {
        this.db = new LevelSandbox.LevelSandbox();
        this.generateGenesisBlock();
    }

    generateGenesisBlock() {
        //1 Check height of current blockchain on levelDB
            //1.1 if height === 0 then create the genesis block
            //1.2 if height > 0 then create a normal block

        //1 const chainheight = await this.get
    }

    addBlock() {

    }


}